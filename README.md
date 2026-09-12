# Calculadora de dosis y registro veterinario (VetCalc)

Este repositorio contiene una aplicación web cliente y un proxy servidor para integrar un modelo de lenguaje (IA) que ayuda con: búsqueda de fármacos, cálculo de dosis, diagnóstico diferencial y generación de planes iniciales.

Estructura principal

- client/
  - index.html  -> Interfaz web (cliente)
  - styles.css  -> Estilos
  - app.js      -> Lógica del cliente

- server/
  - server.js   -> Proxy para llamadas a la API de OpenAI (o modo mock si no hay API key)

- package.json  -> Script de ejemplo para ejecutar el servidor

Instrucciones rápidas

1) Cliente
   - Sirve la carpeta `client/` con un servidor estático (recomendado):
     - Python: `python3 -m http.server 8000` (desde client/)
     - o `serve .` si tienes `serve` instalado
   - Abre `http://localhost:8000` en tu navegador.

2) Servidor (proxy IA)
   - En la raíz del repo (donde está package.json):
     - `npm install`
     - Establece la variable de entorno `OPENAI_API_KEY` con tu clave de OpenAI.
       - Linux/macOS: `export OPENAI_API_KEY="tu_api_key"`
       - Windows PowerShell: `$env:OPENAI_API_KEY="tu_api_key"`
     - `npm start`
   - El servidor escuchará en `http://localhost:3000`.

3) Configurar cliente
   - En la app, ve a Ajustes y establece `API base URL` a `http://localhost:3000` y guarda.

4) Uso
   - Usa la pestaña "Asistente IA" para buscar fármacos o pedir diagnóstico diferencial a partir de anamnesis/signos/exámenes.

Advertencias

- Mantén tu OPENAI_API_KEY en el servidor; no la pongas en el cliente.
- La IA entrega sugerencias; valida todas las dosis y planes con un veterinario responsable antes de administración.

Siguientes pasos recomendados

- Integrar html2pdf para descarga de recetas en PDF.
- Añadir autenticación y monetización (Stripe) si quieres cobrar por funciones premium.
- Desplegar el proxy en Render/Vercel y la UI en GitHub Pages o Netlify.
