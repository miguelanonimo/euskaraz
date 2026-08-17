// Script de autoría — se ejecuta una vez por unidad, a mano, nunca en
// producción. Lee el vocabulario de una unidad y genera un mp3 por
// palabra con Google Cloud Text-to-Speech (voz eu-ES). Ver docs/brief.md
// secciones 4 y 6.
//
// Auth: Application Default Credentials (gcloud auth application-default
// login). No hay ninguna clave de API ni JSON que gestionar.
//
// Uso:
//   npm install
//   node generar.mjs u1
//   node generar.mjs u1 --forzar   (regenera aunque el mp3 ya exista)

import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import textToSpeech from '@google-cloud/text-to-speech';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', ssmlGender: 'FEMALE' };

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
function claveArchivo(eu) {
  return normalizar(eu).replace(/\s+/g, '-');
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

  const client = new textToSpeech.TextToSpeechClient({ projectId: PROJECT_ID });

  // Aplana entradas + variantes de registro (sección 5.1 del brief): cada
  // variante bizkaina lleva su propio mp3, igual que la forma normativa.
  const palabras = unidad.vocabulario.flatMap((v) => [v, ...(v.variantes || [])]);

  console.log(`Unidad ${unidad.id} — ${palabras.length} palabras`);

  for (const v of palabras) {
    const clave = claveArchivo(v.eu);
    const destino = path.join(destDir, `${clave}.mp3`);

    if (!forzar && await existe(destino)) {
      console.log(`  ya existe — ${clave}.mp3`);
      continue;
    }

    const [respuesta] = await client.synthesizeSpeech({
      input: { text: v.eu },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3' },
    });

    await writeFile(destino, respuesta.audioContent, 'binary');
    console.log(`  generado — ${clave}.mp3  («${v.eu}»)`);
  }

  console.log(`\nListo. mp3 guardados en ${path.relative(RAIZ, destDir)}/`);
  console.log('Revisa que suenen bien antes de subirlos al bucket de Supabase.');
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
