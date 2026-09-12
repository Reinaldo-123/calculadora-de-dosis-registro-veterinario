// server.js - Proxy ejemplo para llamar a OpenAI (o modo mock)
// Requisitos: Node >= 16. Usa "type":"module" en package.json para usar import
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Helper para llamar OpenAI Chat Completions
async function callOpenAIChat(messages, max_tokens = 800, model = 'gpt-4o-mini') {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const payload = { model, messages, temperature: 0.0, max_tokens };
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${txt}`);
  }
  const j = await resp.json();
  return j.choices?.[0]?.message?.content || j.choices?.[0]?.text || '';
}

// Endpoint: información de fármaco
app.post('/api/ai/drug-info', async (req, res) => {
  const { name, species } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  const system = `Eres un asistente experto en farmacología veterinaria. Responde con JSON válido.`;
  const user = `Proporciona datos clínicos para el fármaco "${name}" en la especie "${species}". Devuelve un JSON con claves:
{
  "nombre", "clase", "dosis_mgkg", "concentracion", "vias", "sitios", "contraindicadas",
  "indicaciones", "farmacodinamia", "referencias"
}
Si no conoces un campo, déjalo vacío. Prioriza evidencia y si la respuesta es estimada, pon "estimado" en el campo referencias.`;

  try {
    if (!OPENAI_KEY) {
      return res.json({
        nombre: name,
        clase: '',
        dosis_mgkg: '',
        concentracion: '',
        vias: '',
        sitios: '',
        contraindicadas: '',
        indicaciones: '',
        farmacodinamia: '',
        referencias: ['modo-mock: configurar OPENAI_API_KEY']
      });
    }
    const content = await callOpenAIChat([{ role: 'system', content: system }, { role: 'user', content: user }], 600);
    let parsed;
    try { parsed = JSON.parse(content); }
    catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'No se pudo parsear respuesta IA', raw: content });
    }
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint: diagnóstico diferencial (a partir de anamnesis/signos/exámenes)
app.post('/api/ai/differential', async (req, res) => {
  const { anamnesis = '', species = '', signs = '', exams = '' } = req.body || {};
  if (!anamnesis && !signs && !exams) return res.status(400).json({ error: 'Se requiere anamnesis o signos o exámenes' });

  const system = `Eres un asistente veterinario experto en diagnóstico diferencial y manejo inicial. Responde únicamente con JSON válido.`;
  const user = `Paciente (especie: "${species}"). Anamnesis: "${anamnesis}". Signos/exámenes: "${signs}". Resultados relevantes: "${exams}".
Devuelve un JSON con las claves: summary, differentials (lista con al menos 3 objetos con diagnosis, confidence (0-100), rationale, key_findings, recommended_tests, initial_management (urgent, medication, supportive, cautions)), suggested_questions (lista), suggested_tests_overall, recommended_treatment_plan, references.
Si no sabes, devuelve cadenas vacías o marca como "estimado".`;

  try {
    if (!OPENAI_KEY) {
      return res.json({
        summary: 'Mock: configure OPENAI_API_KEY para obtener resultados reales.',
        differentials: [],
        suggested_questions: [],
        suggested_tests_overall: [],
        recommended_treatment_plan: '',
        references: []
      });
    }
    const content = await callOpenAIChat([{ role: 'system', content: system }, { role: 'user', content: user }], 1000);
    let parsed;
    try { parsed = JSON.parse(content); }
    catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'No se pudo parsear respuesta IA', raw: content });
    }
    return res.json(parsed);
  } catch (err) {
    console.error('Error /api/ai/differential:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`AI proxy escuchando en http://localhost:${PORT}`));
