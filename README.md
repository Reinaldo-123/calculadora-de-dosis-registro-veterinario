# Calculadora de dosis y registro veterinario (VetCalc)

Este repositorio contiene una aplicación web cliente y un proxy servidor para integrar un modelo de lenguaje (IA) que ayuda con: búsqueda de fármacos, cálculo de dosis, diagnóstico diferencial[...] 

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

Configuración segura de la clave (OPENAI_API_KEY)

He preparado el repositorio para que sea seguro usar claves sin incluirlas en el código.

Qué cambios hice en el repo:
- Añadí el archivo `.env.example` (contiene la variable necesaria, sin valor).
- Verifiqué que `.gitignore` ya excluye archivos `.env` y variantes (`.env`, `.env.*`) y permite `.env.example`.
- Actualicé este README con instrucciones claras para local y despliegue.

Pasos recomendados (resumen)

1) Rotar la clave que compartiste en el chat: si esa clave ya existía en algún servicio, ingresa a dicho servicio y revócala/genera otra.

2) Guardar la nueva clave en GitHub (para despliegues/CI) — RECOMENDADO
   - Nombre sugerido de secret en GitHub Actions: `OPENAI_API_KEY` (esto coincide con la variable que usa el servidor).
   - Con gh CLI (desde tu máquina, autenticado):
     ```bash
     gh secret set OPENAI_API_KEY --body "<tu_nueva_clave>" --repo Reinaldo-123/calculadora-de-dosis-registro-veterinario
     ```
   - Por la UI: Repo > Settings > Secrets and variables > Actions > New repository secret > Name: `OPENAI_API_KEY`, Value: (pega la clave).
   - En Workflows, usa la secret con `${{ secrets.OPENAI_API_KEY }}` o expónla en `env` como `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}`.

3) Uso local (desarrollo)
   - Copia `.env.example` a `.env` en la raíz del repo y pega tu clave real:
     ```bash
     cp .env.example .env
     # luego edita .env y pega:
     # OPENAI_API_KEY=tu_nueva_clave
     ```
   - Asegúrate de que `.env` está en `.gitignore` (ya está configurado).

4) Lectura de la variable en el servidor (ya implementado)
   - El proxy (`server/server.js`) ya usa `process.env.OPENAI_API_KEY`.
   - Si quieres usar `dotenv` en desarrollo, instala y carga `dotenv` en server.js:
     ```js
     // npm install dotenv
     import 'dotenv/config'; // o: import dotenv from 'dotenv'; dotenv.config();
     ```

Notas de seguridad

- No incluyas claves en commits públicos ni en paquetes públicos.
- No envíes claves por canales no cifrados si puedes evitarlo; yo no puedo enviar correos por ti.
- Una vez hayas puesto la clave en GitHub Secrets y localmente, prueba `npm start` en la raíz para levantar el proxy.

Siguientes pasos sugeridos

- (Opcional) Crear un workflow de GitHub Actions que despliegue el servidor usando `OPENAI_API_KEY` desde secrets.
- (Opcional) Añadir autenticación en el proxy para que no quede abierto sin control.

Siguientes comandos útiles

- Instalar dependencias y ejecutar servidor:
  ```bash
  npm install
  npm start
  ```

- Probar el endpoint mock (si no pones clave):
  POST http://localhost:3000/api/ai/drug-info  { "name": "amoxicilina", "species": "perro" }

---

# Cambios realizados por el asistente
Se añadieron archivos y documentación para manejar claves de forma segura: `.env.example` y actualización de `README.md`. No se añadió ninguna clave secreta al repositorio.
