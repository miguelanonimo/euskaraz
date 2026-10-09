// Deja TODAS las frases destacadas de las fichas (gramatica[].ejemplos) con
// audio. Para cada ejemplo sin `audio` (y cuyo texto no tenga ya mp3 en otro
// sitio del curso) genera el mp3 con Cloud TTS (misma voz que el resto),
// lo sube al bucket euskaraz-audio y escribe la ruta en el JSON.
//
// Uso:  node completar-ejemplos.mjs --seco     (solo lista lo que falta)
//       node completar-ejemplos.mjs            (genera, sube y parchea)
// Lee SUPABASE_SECRET de ~/.config/euskaraz/supabase.env. Es idempotente:
// se puede relanzar si se corta (el cupo de TTS se agota a veces).
import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';
const NOTA_Z = 'The letter z must be a clear sibilant s sound (like the s in English "see"), never a Spanish z sound.';
const SUPA = 'https://jdijrqkzhohpzdwlsyvg.supabase.co';
const SECO = process.argv.includes('--seco');

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(AQUI, '..', '..', 'data', 'unidades-v2');
const SALIDA = path.join(AQUI, 'out', 'ejemplos');

const normalizar = (s) => String(s || '').toLowerCase().replace(/[¿?¡!.,;:«»"'()]/g, '').replace(/\s+/g, ' ').trim();
const claveArchivo = (eu) => normalizar(eu).replace(/\s*\/\s*/g, ' o ').replace(/[·—–]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s+/g, '-');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const existe = async (p) => { try { await access(p); return true; } catch { return false; } };

const env = Object.fromEntries((await readFile(path.join(os.homedir(), '.config', 'euskaraz', 'supabase.env'), 'utf8'))
  .split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));

async function sintetizar(authClient, texto, intento = 1) {
  const { token } = await authClient.getAccessToken();
  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'x-goog-user-project': PROJECT_ID, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      input: { prompt: BASE_PROMPT + (/z/i.test(texto) ? NOTA_Z : ''), text: texto },
      voice: VOICE, audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  const d = await r.json();
  if (!r.ok) {
    if (r.status === 429 && intento <= 6) { await esperar(10000 * intento); return sintetizar(authClient, texto, intento + 1); }
    throw new Error('TTS ' + r.status + ' ' + JSON.stringify(d).slice(0, 200));
  }
  return Buffer.from(d.audioContent, 'base64');
}

async function subir(ruta, buf) {
  const r = await fetch(`${SUPA}/storage/v1/object/euskaraz-audio/${ruta}`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.SUPABASE_SECRET, apikey: env.SUPABASE_SECRET, 'Content-Type': 'audio/mpeg' },
    body: buf,
  });
  if (r.ok || r.status === 409 || r.status === 400 && /exists|Duplicate/i.test(await r.clone().text())) return;
  throw new Error('subida ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

const archivos = (await readdir(DATA)).filter((f) => f.endsWith('.json')).sort();
const unidades = [];
for (const f of archivos) unidades.push({ f, d: JSON.parse(await readFile(path.join(DATA, f), 'utf8')) });

// Audios que ya existen por texto en cualquier parte del curso.
const porTexto = new Map();
const reg = (x) => { if (x && x.eu && x.audio) porTexto.set(normalizar(x.eu), x.audio); };
for (const { d } of unidades) {
  for (const v of d.vocabulario || []) { reg(v); (v.variantes || []).forEach(reg); }
  for (const g of d.gramatica || []) (g.ejemplos || []).forEach(reg);
  (d.audiosExtra || []).forEach(reg);
}

const pendientes = []; // { unidad, ejemplo, ruta }
for (const { d } of unidades) {
  for (const g of d.gramatica || []) for (const e of g.ejemplos || []) {
    if (e.audio) continue;
    const ya = porTexto.get(normalizar(e.eu));
    if (ya) { pendientes.push({ d, e, ruta: ya, nuevo: false }); continue; }
    const ruta = `unidades/${d.id}/${claveArchivo(e.eu)}.mp3`;
    porTexto.set(normalizar(e.eu), ruta);
    pendientes.push({ d, e, ruta, nuevo: true });
  }
}
const aGenerar = pendientes.filter((p) => p.nuevo);
console.log(`Ejemplos sin audio: ${pendientes.length} (${aGenerar.length} mp3 nuevos, ${pendientes.length - aGenerar.length} reutilizan uno existente)`);
if (SECO) { aGenerar.forEach((p) => console.log('  ' + p.ruta + '  «' + p.e.eu + '»')); process.exit(0); }

await mkdir(SALIDA, { recursive: true });
const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
const authClient = await auth.getClient();
let i = 0, fallos = 0;
for (const p of aGenerar) {
  i++;
  const local = path.join(SALIDA, p.ruta.replaceAll('/', '_'));
  try {
    let buf;
    if (await existe(local)) buf = await readFile(local);
    else { buf = await sintetizar(authClient, p.e.eu); await writeFile(local, buf); await esperar(1500); }
    await subir(p.ruta, buf);
    p.hecho = true;
    console.log(`${i}/${aGenerar.length} ok  ${p.ruta}`);
  } catch (err) { fallos++; console.error(`${i}/${aGenerar.length} FALLO ${p.ruta}: ${err.message}`); }
}

// Parche: solo los que tienen mp3 ya subido (o reutilizado).
const tocados = new Set();
for (const p of pendientes) {
  if (p.nuevo && !p.hecho) continue;
  p.e.audio = p.ruta; tocados.add(p.d.id);
}
for (const { f, d } of unidades) {
  if (tocados.has(d.id)) await writeFile(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n');
}
console.log(`Hecho. ${aGenerar.length - fallos} subidos, ${fallos} fallos. JSON parcheados: ${[...tocados].join(', ')}`);
