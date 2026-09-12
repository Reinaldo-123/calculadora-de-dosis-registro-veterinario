// app.js - VetCalc con Asistente IA (cliente)
// ---------- Utilidades ----------
const $ = (s) => document.querySelector(s);
const qs = (s) => Array.from(document.querySelectorAll(s));
const escapeHtml = (s='') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");

// ---------- Storage keys ----------
const KEY_FARMACOS = 'vetcalc_farmacos_v1';
const KEY_PACIENTES = 'vetcalc_pacientes_v1';
const KEY_RECETAS = 'vetcalc_recetas_v1';
const KEY_EVOL = 'vetcalc_evol_v1';
const KEY_SETTINGS = 'vetcalc_settings_v1';

// ---------- Helpers ----------
function cryptoRandomId(){ return 'id-'+Math.random().toString(36).slice(2,10); }
function getSettings(){ return JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}'); }
function saveSettings(s){ localStorage.setItem(KEY_SETTINGS, JSON.stringify(s)); }

// ---------- Farmacos demo (ejemplo) ----------
const farmacosDemo = [
  {
    id: cryptoRandomId(),
    nombre: 'Amoxicilina',
    clase: 'Antibiótico β-lactámico',
    dosis_mgkg: '10-20',
    concentracion: '50',
    vias: 'PO, IM, SC',
    sitios: 'IM: cuádriceps; SC: dorso',
    contraindicadas: 'Evitar en alergia a penicilinas',
    indicaciones: 'Infecciones bacterianas sensibles',
    farmacodinamia: 'Inhibe la síntesis de la pared bacteriana (bactericida)'
  },
  {
    id: cryptoRandomId(),
    nombre: 'Meloxicam',
    clase: 'AINE',
    dosis_mgkg: '0.1',
    concentracion: '5',
    vias: 'PO, SC, IM',
    sitios: 'SC: dorso; IM: cuádriceps',
    contraindicadas: 'No usar en insuficiencia renal o sangrado activo',
    indicaciones: 'Dolor e inflamación',
    farmacodinamia: 'Inhibidor preferente de COX-2'
  }
];

function getFarmacos(){ return JSON.parse(localStorage.getItem(KEY_FARMACOS) || 'null') || (function(){ localStorage.setItem(KEY_FARMACOS, JSON.stringify(farmacosDemo)); return farmacosDemo; })(); }
function saveFarmacos(arr){ localStorage.setItem(KEY_FARMACOS, JSON.stringify(arr)); }
function getPacientes(){ return JSON.parse(localStorage.getItem(KEY_PACIENTES) || '[]'); }
function savePacientes(arr){ localStorage.setItem(KEY_PACIENTES, JSON.stringify(arr)); }
function getRecetas(){ return JSON.parse(localStorage.getItem(KEY_RECETAS) || '[]'); }
function saveRecetas(arr){ localStorage.setItem(KEY_RECETAS, JSON.stringify(arr)); }
function getEvol(){ return JSON.parse(localStorage.getItem(KEY_EVOL) || '[]'); }
function saveEvol(arr){ localStorage.setItem(KEY_EVOL, JSON.stringify(arr)); }

// ---------- Tabs ----------
qs('.tabs button').forEach(btn => btn.addEventListener('click', () => {
  qs('.tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const tab = btn.dataset.tab;
  qs('.tabpanel').forEach(p => p.classList.add('hidden'));
  $(`#panel-${tab}`).classList.remove('hidden');
  if(tab==='farmacos') renderFarmacosList();
  if(tab==='recetas') { renderSelects(); renderRecetasGuardadas(); }
  if(tab==='evolucion') renderEvoSelect();
}));

// ---------- Pacientes ----------
$('#guardarPaciente').addEventListener('click', () => {
  const p = {
    id: cryptoRandomId(),
    nombre: $('#p_nombre').value.trim(),
    especie: $('#p_especie').value,
    raza: $('#p_raza').value.trim(),
    peso: Number($('#p_peso').value) || null,
    edad: $('#p_edad').value.trim(),
    anamnesis: $('#p_anamnesis').value.trim(),
    examenes: $('#p_examenes').value.trim(),
    diferenciales: $('#p_diferenciales').value.trim(),
    creado: new Date().toISOString()
  };
  if(!p.nombre) return alert('Ingrese nombre del paciente');
  const arr = getPacientes();
  arr.unshift(p);
  savePacientes(arr);
  alert('Ficha guardada localmente');
  renderSelects();
  renderEvoSelect();
});

$('#cargarPaciente').addEventListener('click', () => {
  const arr = getPacientes();
  if(arr.length===0) return alert('No hay pacientes guardados');
  const p = arr[0];
  $('#p_nombre').value = p.nombre;
  $('#p_especie').value = p.especie;
  $('#p_raza').value = p.raza;
  $('#p_peso').value = p.peso ?? '';
  $('#p_edad').value = p.edad;
  $('#p_anamnesis').value = p.anamnesis;
  $('#p_examenes').value = p.examenes;
  $('#p_diferenciales').value = p.diferenciales;
  alert('Ficha cargada (última guardada)');
});

// ---------- Farmacos UI ----------
function renderFarmacosList(filter=''){
  const arr = getFarmacos();
  const ul = $('#farmacosList');
  ul.innerHTML = '';
  const q = (filter||'').trim().toLowerCase();
  arr.filter(f => !q || (f.nombre+f.indicaciones+f.clase).toLowerCase().includes(q)).forEach(f => {
    const li = document.createElement('li');
    li.className = 'farmaco-item';
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(f.nombre)}</strong> <span class="small">(${escapeHtml(f.clase)})</span>
        <div class="small">${escapeHtml(f.indicaciones || '')}</div>
      </div>
      <div>
        <button data-id="${f.id}" class="farmaco_ver">Ver</button>
        <button data-id="${f.id}" class="farmaco_editar">Editar</button>
        <button data-id="${f.id}" class="farmaco_borrar">Borrar</button>
      </div>
    `;
    ul.appendChild(li);
  });
}
$('#buscarFarmaco').addEventListener('input', (e)=> renderFarmacosList(e.target.value));

$('#nuevoFarmacoBtn').addEventListener('click', ()=> openEditor({}));
$('#farmacosList').addEventListener('click', (ev)=> {
  const id = ev.target.dataset.id;
  if(!id) return;
  const arr = getFarmacos();
  const f = arr.find(x => x.id===id);
  if(ev.target.classList.contains('farmaco_ver')) {
    if(!f) return;
    const txt = `${f.nombre}\nClase: ${f.clase}\nDosis mg/kg: ${f.dosis_mgkg}\nConcentración: ${f.concentracion}\nVías: ${f.vias}\nSitios: ${f.sitios}\nContraindicaciones: ${f.contraindicadas}\nFarmacodinamia: ${f.farmacodinamia}`;
    alert(txt);
  } else if(ev.target.classList.contains('farmaco_editar')){
    openEditor(f);
  } else if(ev.target.classList.contains('farmaco_borrar')){
    if(!confirm('Borrar fármaco?')) return;
    const newArr = arr.filter(x=>x.id!==id);
    saveFarmacos(newArr);
    renderFarmacosList();
    renderSelects();
  }
});

function openEditor(f = {}){
  $('#farmacoEditor').classList.remove('hidden');
  $('#farmacoEditorTitle').textContent = f.id ? 'Editar fármaco' : 'Nuevo fármaco';
  $('#f_nombre').value = f.nombre || '';
  $('#f_clase').value = f.clase || '';
  $('#f_dosis_mgkg').value = f.dosis_mgkg || '';
  $('#f_concentracion').value = f.concentracion || '';
  $('#f_vias').value = f.vias || '';
  $('#f_sitios').value = f.sitios || '';
  $('#f_contra').value = f.contraindicadas || '';
  $('#f_indicaciones').value = f.indicaciones || '';
  $('#f_farmacodinamia').value = f.farmacodinamia || '';
  $('#guardarFarmaco').dataset.editId = f.id || '';
}
$('#cancelarFarmaco').addEventListener('click', ()=> $('#farmacoEditor').classList.add('hidden'));
$('#guardarFarmaco').addEventListener('click', ()=> {
  const id = $('#guardarFarmaco').dataset.editId || cryptoRandomId();
  const f = {
    id,
    nombre: $('#f_nombre').value.trim(),
    clase: $('#f_clase').value.trim(),
    dosis_mgkg: $('#f_dosis_mgkg').value.trim(),
    concentracion: $('#f_concentracion').value.trim(),
    vias: $('#f_vias').value.trim(),
    sitios: $('#f_sitios').value.trim(),
    contraindicadas: $('#f_contra').value.trim(),
    indicaciones: $('#f_indicaciones').value.trim(),
    farmacodinamia: $('#f_farmacodinamia').value.trim()
  };
  if(!f.nombre) return alert('Nombre requerido');
  const arr = getFarmacos();
  const idx = arr.findIndex(x=>x.id===id);
  if(idx>=0) arr[idx]=f; else arr.unshift(f);
  saveFarmacos(arr);
  $('#farmacoEditor').classList.add('hidden');
  renderFarmacosList();
  renderSelects();
});

// ---------- Recetas / Plan ----------
function renderSelects(){
  const pacientes = getPacientes();
  const selP = $('#selectPaciente');
  const evoSel = $('#evo_selectPaciente');
  selP.innerHTML = '<option value="">-- ninguno --</option>';
  evoSel.innerHTML = '<option value="">-- ninguno --</option>';
  pacientes.forEach(p => {
    selP.innerHTML += `<option value="${p.id}">${escapeHtml(p.nombre)} (${escapeHtml(p.especie)})</option>`;
    evoSel.innerHTML += `<option value="${p.id}">${escapeHtml(p.nombre)} (${escapeHtml(p.especie)})</option>`;
  });

  const farmacos = getFarmacos();
  const selF = $('#selectFarmaco');
  selF.innerHTML = '<option value="">-- seleccionar --</option>';
  farmacos.forEach(f => selF.innerHTML += `<option value="${f.id}">${escapeHtml(f.nombre)}</option>`);
}
renderSelects();

$('#selectFarmaco').addEventListener('change', ()=>{
  const id = $('#selectFarmaco').value;
  if(!id) { $('#plan_dosis_ml').value=''; return; }
  const f = getFarmacos().find(x=>x.id===id);
  const pacienteId = $('#selectPaciente').value;
  const paciente = getPacientes().find(p=>p.id===pacienteId);
  const peso = paciente?.peso || Number($('#p_peso').value) || 0;
  let dosisMgKg = parseFloat(f.dosis_mgkg) || null;
  if(!dosisMgKg){
    const r = (f.dosis_mgkg||'').split(/[-–]/)[0];
    dosisMgKg = parseFloat(r) || null;
  }
  const conc = parseFloat(f.concentracion) || null;
  if(peso && dosisMgKg && conc){
    const ml = (peso * dosisMgKg) / conc;
    $('#plan_dosis_ml').value = Number(ml.toFixed(2));
    $('#plan_via').value = f.vias || '';
  } else {
    $('#plan_dosis_ml').value = '';
    $('#plan_via').value = f.vias || '';
  }
});

// ---------- Fluidoterapia ----------
function calcularFluidoterapia(tipo, valor, pesoKg, especie='Perro'){
  if(!pesoKg) return {error:'Peso requerido'};
  if(tipo==='mantenimiento'){
    const base = especie.toLowerCase().startsWith('gato') ? 50 : 60;
    const mlDia = (Number(valor) || base) * pesoKg;
    return {mlDia, mlHora: Number((mlDia/24).toFixed(2)), nota:`Mantenimiento aproximado (${base} ml/kg/día)`};
  } else if(tipo==='deficit'){
    const pct = Number(valor);
    if(isNaN(pct)) return {error:'Valor % inválido'};
    const ml = (pct/100) * pesoKg * 1000;
    return {ml, nota:`Déficit estimado ${pct}%`};
  } else if(tipo==='bolo'){
    const mlkg = Number(valor);
    if(isNaN(mlkg)) return {error:'Valor ml/kg inválido'};
    const ml = mlkg * pesoKg;
    return {ml, nota:`Bolo ${mlkg} ml/kg`};
  }
  return {error:'Tipo no soportado'};
}

$('#calcularPlan').addEventListener('click', ()=>{
  const pacienteId = $('#selectPaciente').value;
  const paciente = getPacientes().find(p=>p.id===pacienteId);
  const peso = paciente?.peso || Number($('#p_peso').value) || 0;
  if(!peso) return alert('Peso del paciente requerido para cálculos');
  const tipo = $('#ft_tipo').value;
  const valor = $('#ft_valor').value;
  const res = calcularFluidoterapia(tipo, valor, peso, paciente?.especie || $('#p_especie').value);
  if(res.error) return alert(res.error);
  $('#planPreview').innerText = `Fluidoterapia:\n${JSON.stringify(res, null, 2)}`;
});

// Guardar plan
$('#guardarPlan').addEventListener('click', ()=>{
  const pacienteId = $('#selectPaciente').value;
  if(!pacienteId) return alert('Selecciona paciente');
  const farmacoId = $('#selectFarmaco').value;
  const paciente = getPacientes().find(p=>p.id===pacienteId);
  const farmaco = getFarmacos().find(f=>f.id===farmacoId);
  const receta = {
    id: cryptoRandomId(),
    pacienteId,
    pacienteNombre: paciente.nombre,
    fecha: new Date().toISOString(),
    farmacoId,
    farmacoNombre: farmaco?.nombre || '',
    via: $('#plan_via').value,
    dosisMl: $('#plan_dosis_ml').value,
    frecuencia: $('#plan_frecuencia').value,
    fluidoterapia: { tipo: $('#ft_tipo').value, valor: $('#ft_valor').value }
  };
  const arr = getRecetas(); arr.unshift(receta); saveRecetas(arr);
  renderRecetasGuardadas();
  alert('Receta guardada');
});

function renderRecetasGuardadas(){
  const arr = getRecetas();
  const ul = $('#recetasGuardadas');
  ul.innerHTML = '';
  if(arr.length===0) { ul.innerHTML = '<li class="receta-item">No hay recetas</li>'; return; }
  arr.forEach(r=>{
    const li = document.createElement('li');
    li.className = 'receta-item';
    li.innerHTML = `<div><strong>${escapeHtml(r.farmacoNombre)}</strong><div class="small">${escapeHtml(r.pacienteNombre)} · ${new Date(r.fecha).toLocaleString()}</div></div>
      <div>
        <button data-id="${r.id}" class="receta_ver">Ver</button>
        <button data-id="${r.id}" class="receta_borrar">Borrar</button>
      </div>`;
    ul.appendChild(li);
  });
}
$('#recetasGuardadas').addEventListener('click', (ev)=>{
  const id = ev.target.dataset.id;
  if(!id) return;
  const arr = getRecetas();
  const r = arr.find(x=>x.id===id);
  if(ev.target.classList.contains('receta_ver')){
    alert(`Receta: ${r.farmacoNombre}\nPaciente: ${r.pacienteNombre}\nDosis: ${r.dosisMl} mL\nVía: ${r.via}\nFrecuencia: ${r.frecuencia}\nFluidoterapia: ${JSON.stringify(r.fluidoterapia)}`);
  } else if(ev.target.classList.contains('receta_borrar')){
    if(!confirm('Borrar receta?')) return;
    const newArr = arr.filter(x=>x.id!==id); saveRecetas(newArr); renderRecetasGuardadas();
  }
});
renderRecetasGuardadas();

// ---------- Evolución ----------
$('#evo_guardar').addEventListener('click', ()=>{
  const pacienteId = $('#evo_selectPaciente').value;
  if(!pacienteId) return alert('Selecciona paciente');
  const nota = $('#evo_nota').value.trim();
  if(!nota) return alert('Ingresa la nota');
  const arr = getEvol();
  arr.unshift({ id: cryptoRandomId(), pacienteId, nota, fecha: new Date().toISOString() });
  saveEvol(arr);
  $('#evo_nota').value='';
  renderEvoList(pacienteId);
});
$('#evo_selectPaciente').addEventListener('change', (e)=> renderEvoList(e.target.value));
function renderEvoSelect(){ renderSelects(); }
function renderEvoList(pacienteId){
  const ul = $('#evo_list'); ul.innerHTML = '';
  if(!pacienteId) { ul.innerHTML = '<li class="receta-item">Selecciona paciente para ver notas</li>'; return; }
  const arr = getEvol().filter(n => n.pacienteId===pacienteId);
  if(arr.length===0) { ul.innerHTML = '<li class="receta-item">Sin notas</li>'; return; }
  arr.forEach(n => {
    const li = document.createElement('li'); li.className = 'receta-item';
    li.innerHTML = `<div><div class="small">${new Date(n.fecha).toLocaleString()}</div><div>${escapeHtml(n.nota)}</div></div>
      <div><button data-id="${n.id}" class="evo_borrar">Borrar</button></div>`;
    ul.appendChild(li);
  });
}
$('#evo_list').addEventListener('click', (ev) => {
  const id = ev.target.dataset.id; if(!id) return;
  if(ev.target.classList.contains('evo_borrar')){
    if(!confirm('Borrar nota?')) return;
    const arr = getEvol().filter(x=>x.id!==id); saveEvol(arr);
    const selected = $('#evo_selectPaciente').value; renderEvoList(selected);
  }
});

// ---------- ASISTENTE IA (cliente) ----------
async function aiFetchDrugInfo(name, species){
  const settings = getSettings();
  const base = settings.apiBase?.trim();
  if(!base) throw new Error('API base no configurada. Ve a Ajustes y configura la URL del proxy (ej: http://localhost:3000).');
  const url = `${base.replace(/\/$/, '')}/api/ai/drug-info`;
  const body = { name, species };
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if(!res.ok){
    const txt = await res.text();
    throw new Error(`Error servidor IA: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json;
}

$('#ia_buscar').addEventListener('click', async ()=>{
  const name = $('#ia_nombre').value.trim();
  const species = $('#ia_especie').value;
  if(!name) return alert('Ingrese nombre del fármaco');
  $('#ia_result').innerText = 'Consultando IA...';
  try{
    const data = await aiFetchDrugInfo(name, species);
    $('#ia_result').innerText = JSON.stringify(data, null, 2);
    $('#ia_importar').disabled = false;
    $('#ia_importar').dataset.payload = JSON.stringify(data);
  }catch(err){
    console.error(err);
    $('#ia_result').innerText = 'Error: '+err.message;
  }
});

$('#ia_importar').addEventListener('click', ()=>{
  const payload = $('#ia_importar').dataset.payload;
  if(!payload) return;
  try{
    const d = JSON.parse(payload);
    const f = {
      id: cryptoRandomId(),
      nombre: d.nombre || d.name || $('#ia_nombre').value.trim(),
      clase: d.clase || d.class || '',
      dosis_mgkg: d.dosis_mgkg || d.dose_mgkg || '',
      concentracion: d.concentracion || d.concentration || '',
      vias: d.vias || '',
      sitios: d.sitios || '',
      contraindicadas: d.contraindicadas || d.contraindications || '',
      indicaciones: d.indicaciones || d.indications || '',
      farmacodinamia: d.farmacodinamia || d.pharmacodynamics || '',
      referencias: d.referencias || d.references || ''
    };
    const arr = getFarmacos(); arr.unshift(f); saveFarmacos(arr);
    renderFarmacosList();
    renderSelects();
    alert('Fármaco importado (verifica y guarda).');
  }catch(e){
    alert('No se pudo importar: '+e.message);
  }
});

// ---------- DIAGNÓSTICO DIFERENCIAL (IA) ----------
async function aiFetchDifferential({ anamnesis, species, signs, exams }){
  const settings = getSettings();
  const base = settings.apiBase?.trim();
  if(!base) throw new Error('API base no configurada. Ve a Ajustes y configura la URL del proxy (ej: http://localhost:3000).');
  const url = `${base.replace(/\/$/, '')}/api/ai/differential`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ anamnesis, species, signs, exams })
  });
  if(!res.ok){
    const txt = await res.text();
    throw new Error(`Error proxy IA: ${res.status} ${txt}`);
  }
  return res.json();
}

$('#ia_dx').addEventListener('click', async () => {
  try {
    const anam = $('#ia_anamnesis').value.trim();
    const signs = $('#ia_signs').value.trim();
    const exams = $('#ia_exams').value.trim();
    const species = $('#ia_especie')?.value || ($('#p_especie').value || '');
    if (!anam && !signs && !exams) return alert('Ingrese anamnesis o signos o exámenes');
    $('#ia_result').innerText = 'Analizando con IA...';
    const data = await aiFetchDifferential({ anamnesis: anam, species, signs, exams });
    $('#ia_result').innerText = JSON.stringify(data, null, 2);
    $('#ia_import_dx').disabled = false;
    $('#ia_generate_form').disabled = false;
    $('#ia_import_dx').dataset.payload = JSON.stringify(data);
    $('#ia_generate_form').dataset.payload = JSON.stringify(data);
  } catch (err) {
    console.error(err);
    $('#ia_result').innerText = 'Error: ' + err.message;
  }
});

$('#ia_import_dx').addEventListener('click', () => {
  const payload = $('#ia_import_dx').dataset.payload;
  if (!payload) return;
  const json = JSON.parse(payload);
  const names = (json.differentials || []).map(d => d.diagnosis || '').filter(Boolean).slice(0,5).join(', ');
  $('#p_diferenciales').value = names;
  alert('Diferenciales importados a la ficha (verifica y ajusta).');
});

$('#ia_generate_form').addEventListener('click', () => {
  const payload = $('#ia_generate_form').dataset.payload;
  if (!payload) return;
  const json = JSON.parse(payload);
  const q = json.suggested_questions || [];
  if (!q.length) return alert('No hay preguntas sugeridas');
  const html = ['<form id="ia_form_questions">', '<h4>Formulario de preguntarmentos sugeridas</h4>'];
  q.forEach((qq, idx) => {
    html.push(`<label style="display:block;margin:6px 0">${escapeHtml(qq)}<input name="q_${idx}" data-q="${escapeHtml(qq)}" style="width:100%;margin-top:6px"/></label>`);
  });
  html.push('<div class="actions"><button type="button" id="ia_save_answers">Guardar respuestas a anamnesis</button></div>');
  html.push('</form>');
  $('#ia_result').innerHTML = html.join('');
  document.getElementById('ia_save_answers').addEventListener('click', () => {
    const form = document.getElementById('ia_form_questions');
    const inputs = Array.from(form.querySelectorAll('input'));
    const answers = inputs.map(i => `${i.dataset.q}: ${i.value}`).join('\n');
    $('#p_anamnesis').value = ($('#p_anamnesis').value || '') + '\n\n' + answers;
    alert('Respuestas guardadas en anamnesis (editar si necesario).');
  });
});

// ---------- AJUSTES ----------
$('#saveSettings').addEventListener('click', ()=>{
  const apiBase = $('#setting_api_base').value.trim();
  saveSettings({ apiBase });
  alert('Ajustes guardados');
});
(function loadSettingsToForm(){
  const s = getSettings();
  $('#setting_api_base').value = s.apiBase || '';
})();

// ---------- Inicialización ----------
renderFarmacosList();
renderSelects();
renderRecetasGuardadas();
renderEvoSelect();
