// Script de autoría — se ejecuta una vez por unidad, a mano, nunca en
// producción. Lee el vocabulario de una unidad y genera un mp3 por
// palabra con Google Cloud Text-to-Speech (voz eu-ES). Ver docs/brief.md
// secciones 4 y 6.
//
// Modelo: gemini-2.5-flash-tts, voz "Kore", con prompt de ritmo natural
// (probado y aprobado por Miguel el 17/08/2026 — la voz estándar por
// defecto sonaba bien pero muy lenta). El SDK @google-cloud/text-to-speech
// 5.8.1 no tiene tipado para los campos `prompt`/`modelName` del TTS con
// Gemini, así que se llama directo al REST endpoint en vez del cliente.
//
// Auth: Application Default Credentials (gcloud auth application-default
// login). No hay ninguna clave de API ni JSON que gestionar; el token de
// acceso se saca con google-auth-library (dependencia de @google-cloud/
// text-to-speech), sin necesitar el CLI de gcloud instalado.
//
// Uso:
//   npm install
//   node generar.mjs u1
//   node generar.mjs u1 --forzar   (regenera aunque el mp3 ya exista)

import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const PROMPT = 'Say this Basque phrase at a natural, normal conversational pace — clear pronunciation, but not slow or exaggerated.';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const SALIDA = path.join(AQUI, 'out');

// Misma normalización que normalizar() en js/app.js, más el paso extra
// de convertir espacios en guiones para que sirva como nombre de archivo
// (la clave 'v:'+normalizar(eu) que usa el motor de progreso no necesita
// ese paso, pero el archivo del bucket sí).
function normalizar(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
// Además de normalizar(), quita separadores que no valen en una clave de
// Storage: '/' (formas alternas tipo "hura / bera"), y '·'/'—'/'–' que
// aparecen en algún ejemplo (listas de flexión, diálogos pregunta-respuesta).
function claveArchivo(eu) {
  return normalizar(eu)
    .replace(/\s*\/\s*/g, ' o ')
    .replace(/[·—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

async function existe(ruta) {
  try { await access(ruta); return true; } catch { return false; }
}

async function main() {
  const unidadId = process.argv[2];
  const forzar = process.argv.includes('--forzar');
  if (!unidadId) {
    console.error('Uso: node generar.mjs <unidadId> [--forzar]   (ej: node generar.mjs u1)');
    process.exit(1);
  }

  const unidadPath = await buscarPorId(unidadId);
  const unidad = JSON.parse(await readFile(unidadPath, 'utf8'));

  const destDir = path.join(SALIDA, unidad.id);
  await mkdir(destDir, { recursive: true });

  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const authClient = await auth.getClient();

  // Aplana entradas + variantes de registro (sección 5.1 del brief): cada
  // variante bizkaina lleva su propio mp3, igual que la forma normativa.
  // Se suman también las frases de ejemplo de gramática (sección 6: "y
  // frases relevantes de ejercicios"). Si un ejemplo coincide en texto
  // con una palabra de vocabulario, comparten el mismo mp3 (misma clave).
  var palabras = unidad.vocabulario.flatMap((v) => [v, ...(v.variantes || [])]);
  (unidad.gramatica || []).forEach((g) => {
    (g.ejemplos || []).forEach((e) => palabras.push(e));
  });

  console.log(`Unidad ${unidad.id} — ${palabras.length} palabras`);

  for (const v of palabras) {
    const clave = claveArchivo(v.eu);
    const destino = path.join(destDir, `${clave}.mp3`);

    if (!forzar && await existe(destino)) {
      console.log(`  ya existe — ${clave}.mp3`);
      continue;
    }

    const audioContent = await sintetizarConReintentos(authClient, v.eu);
    await writeFile(destino, audioContent, 'base64');
    console.log(`  generado — ${clave}.mp3  («${v.eu}»)`);
    await esperar(PAUSA_MS);
  }

  console.log(`\nListo. mp3 guardados en ${path.relative(RAIZ, destDir)}/`);
  console.log('Revisa que suenen bien antes de subirlos al bucket de Supabase.');
}

// gemini-2.5-flash-tts tiene cuota por minuto (a diferencia de las voces
// estándar de Cloud TTS), así que hay que espaciar las llamadas y
// reintentar con backoff cuando se agota.
const PAUSA_MS = 2000;
function esperar(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function sintetizarConReintentos(authClient, texto, intento = 1) {
  try {
    return await sintetizar(authClient, texto);
  } catch (err) {
    if (String(err.message).includes('429') && intento <= 5) {
      const espera = 10000 * intento;
      console.log(`    cuota agotada, esperando ${espera / 1000}s (intento ${intento}/5)…`);
      await esperar(espera);
      return sintetizarConReintentos(authClient, texto, intento + 1);
    }
    throw err;
  }
}

async function sintetizar(authClient, texto) {
  const { token } = await authClient.getAccessToken();
  const respuesta = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': PROJECT_ID,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      input: { prompt: PROMPT, text: texto },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(`Cloud TTS ${respuesta.status}: ${JSON.stringify(datos)}`);
  }
  return datos.audioContent;
}

// Fallback si data/curso.json no lista la ruta con ese nombre exacto de archivo.
async function buscarPorId(unidadId) {
  const { readdir } = await import('node:fs/promises');
  const dir = path.join(RAIZ, 'data', 'unidades');
  for (const f of await readdir(dir)) {
    const contenido = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
    if (contenido.id === unidadId) return path.join(dir, f);
  }
  throw new Error(`No encuentro ninguna unidad con id "${unidadId}" en data/unidades/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
