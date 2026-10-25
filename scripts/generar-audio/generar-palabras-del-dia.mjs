// Audio de las palabras del día (data/palabras-del-dia.json) que aún no tienen `audio`.
//
//   node generar-palabras-del-dia.mjs --seco     (solo cuenta y enseña el plan)
//   node generar-palabras-del-dia.mjs            (genera, sube al bucket, parchea los JSON y escribe out/faltantes-informe.json)
//
// Para cada entrada sin `audio`:
//  · si el mismo texto ya tiene mp3 en otro sitio del curso → solo se enlaza (no se genera);
//  · si el mp3 ya existe en el bucket en la ruta prevista → se enlaza sin generar;
//  · si no → se sintetiza con Cloud TTS (voz Kore) con notas fonéticas sacadas de la revisión de Ric, se sube y se enlaza.
// Es idempotente. Necesita ADC de Google y SUPABASE_SECRET en ~/.config/euskaraz/supabase.env.
import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';
const SUPA = 'https://jdijrqkzhohpzdwlsyvg.supabase.co';
const SECO = process.argv.includes('--seco');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(AQUI, '..', '..', 'data', 'unidades-v2');
const SALIDA = path.join(AQUI, 'out', 'palabras-del-dia');
const ARCHIVO = path.join(DATA, '..', 'palabras-del-dia.json');

const normalizar = (s) => String(s || '').toLowerCase().replace(/[¿?¡!.,;:«»"'()]/g, '').replace(/\s+/g, ' ').trim();
const clave = (eu) => normalizar(eu).replace(/\s*\/\s*/g, ' o ').replace(/[·—–]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s+/g, '-');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const existe = async (p) => { try { await access(p); return true; } catch { return false; } };

const env = Object.fromEntries((await readFile(path.join(os.homedir(), '.config', 'euskaraz', 'supabase.env'), 'utf8'))
  .split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));

// Carpetas fijadas por Ric para formas que el hueco histórico de unidades despista (ver docs/audios-pendientes.md)
const CARPETA = { };
const CARPETA_VIEJA = { dena: 'u10', astiro: 'u11', zenuten: 'u11', nituen: 'u11', zenituen: 'u11', zituen: 'u11', genituen: 'u11', zenituzten: 'u11', zituzten: 'u11', zeunden: 'u11', zeundeten: 'u11' };

// Notas fonéticas (causas que se repiten en la revisión de Ric: docs/audio-revision-completa.md)
const COMUN = 'Every final consonant must be clearly audible — never swallowed. All vowels open and distinct. Do not palatalize the n or the l (no "ñ" or "ll") unless it directly follows an i. ';
const Z = 'The letter z is a whistling s, as in Spanish "sol" — never the Spanish "z" of "zapato" and never an English "sh". ';
function nota(t) {
  let n = COMUN;
  if (/z/.test(t)) n += Z;
  if (/tz/.test(t)) n += 'The group "tz" is a clear ts sound as in English "cats", never "ch". ';
  if (/g/.test(t)) n += 'The letter g is always a hard g as in English "go" — never a d, never a j. ';
  if (/\bh|h[aeiou]/.test(t)) n += 'The letter h is silent. ';
  if (/rr/.test(t)) n += 'The "rr" is a strong trilled r. ';
  if (/tx/.test(t)) n += 'The "tx" is a "ch" as in English "church". ';
  if (/t[ei]a\b|ti[ao]\b/.test(t) || /astia|astiro/.test(t)) n += 'The t must be a clear unvoiced t — it must not turn into a p. ';
  if (/\bd/.test(t)) n += 'The d is dental and soft, as in Spanish "dato". ';
  return n;
}
const NOTAS_RIC = { // las nueve del lote de Ric, con sus instrucciones propias
  zenuten: Z + 'Three clear syllables: ze-nu-ten. ' + COMUN,
  nituen: 'Three syllables: ni-tu-en. The t in the middle must be a clear unvoiced t — it carries the meaning (plural object) and must not be softened or dropped. ' + COMUN,
  zenituen: Z + 'Four syllables, every one distinct: ze-ni-tu-en. The t must be clearly audible. ' + COMUN,
  zituen: Z + 'Three syllables: zi-tu-en. The t must be clearly audible. ' + COMUN,
  genituen: 'The initial g is a hard g as in English "go", never a j sound. Four syllables: ge-ni-tu-en. The t must be clearly audible. ' + COMUN,
  zenituzten: Z + 'Long word, five syllables, none rushed: ze-ni-tuz-ten. The "tz" is a clear ts sound as in English "cats" — it must NOT become a "ch". ' + COMUN,
  zituzten: Z + 'Four syllables: zi-tuz-ten. The "tz" is a clear ts sound as in English "cats", never a "ch". ' + COMUN,
  zeunden: Z + 'The "eu" is two distinct vowels, e then u — do not merge them and do not turn them into "au". Two syllables: zeun-den. ' + COMUN,
  zeundeten: Z + 'The "eu" is two distinct vowels, e then u — do not merge them and do not turn them into "au". Three syllables: zeun-de-ten. ' + COMUN,
};


// Audio que el curso ya tiene por texto: la app usa `e.audio || audioDePalabra(e.eu)`, así que esas palabras
// cogen el suyo (ya revisado) y no se generan de nuevo.
const enCurso = new Set();
for (const f of (await readdir(DATA)).filter((x) => x.endsWith('.json'))) {
  const u = JSON.parse(await readFile(path.join(DATA, f), 'utf8'));
  const reg = (x) => { if (x && x.eu && x.audio) enCurso.add(normalizar(x.eu)); };
  for (const v of u.vocabulario || []) { reg(v); (v.variantes || []).forEach(reg); }
  for (const g of u.gramatica || []) (g.ejemplos || []).forEach(reg);
  (u.audiosExtra || []).forEach(reg);
}
const datos = JSON.parse(await readFile(ARCHIVO, 'utf8'));
const plan = (datos.palabras || []).filter((p) => p.eu && !p.audio && !enCurso.has(normalizar(p.eu)))
  .map((p) => ({ p, ruta: `palabras-del-dia/${clave(p.eu)}.mp3`, nota: nota(normalizar(p.eu)) }));
console.log(`Palabras del día a generar: ${plan.length} (de ${(datos.palabras || []).length}; las que ya tienen audio en el curso se reutilizan)`);
if (SECO) { plan.forEach((x) => console.log(`  ${x.p.fecha} «${x.p.eu}» → ${x.ruta}`)); process.exit(0); }

async function enBucket(ruta) {
  const r = await fetch(`${SUPA}/storage/v1/object/public/euskaraz-audio/${ruta.split('/').map(encodeURIComponent).join('/')}`, { method: 'HEAD' });
  return r.ok;
}
async function sintetizar(cli, texto, n, intento = 1) {
  const { token } = await cli.getAccessToken();
  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'x-goog-user-project': PROJECT_ID, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ input: { prompt: BASE + n, text: texto }, voice: VOICE, audioConfig: { audioEncoding: 'MP3' } }) });
  const d = await r.json();
  if (!r.ok) { if (r.status === 429 && intento <= 6) { await esperar(10000 * intento); return sintetizar(cli, texto, n, intento + 1); } throw new Error('TTS ' + r.status + ' ' + JSON.stringify(d).slice(0, 160)); }
  return Buffer.from(d.audioContent, 'base64');
}
async function subir(ruta, buf, intento = 1) {
  const r = await fetch(`${SUPA}/storage/v1/object/euskaraz-audio/${ruta}`, { method: 'POST',
    headers: { Authorization: 'Bearer ' + env.SUPABASE_SECRET, apikey: env.SUPABASE_SECRET, 'Content-Type': 'audio/mpeg' }, body: buf });
  if (r.ok) return 'subido';
  const t = await r.text();
  if (r.status === 429 && intento <= 5) { await esperar(3000 * intento); return subir(ruta, buf, intento + 1); }
  if (r.status === 409 || /exists|Duplicate/i.test(t)) return 'ya existía';
  throw new Error('subida ' + r.status + ' ' + t.slice(0, 160));
}

await mkdir(SALIDA, { recursive: true });
const cli = await (new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' })).getClient();
const hechos = [];
for (const x of plan) {
  try {
    if (!(await enBucket(x.ruta))) {
      const local = path.join(SALIDA, x.ruta.replaceAll('/', '_'));
      let buf;
      if (await existe(local)) buf = await readFile(local); else { buf = await sintetizar(cli, x.p.eu, x.nota); await writeFile(local, buf); await esperar(1500); }
      console.log(`${x.p.eu}: ${await subir(x.ruta, buf)}`);
    } else console.log(`${x.p.eu}: ya estaba en el bucket`);
    hechos.push(x);
  } catch (e) { console.error(`FALLO ${x.p.eu}: ${e.message}`); }
}
// Se vuelve a leer el JSON justo antes de escribir, por si cambió mientras se generaba.
const ahora = JSON.parse(await readFile(ARCHIVO, 'utf8'));
for (const x of hechos) { const e = ahora.palabras.find((q) => q.fecha === x.p.fecha && q.eu === x.p.eu); if (e) e.audio = x.ruta; }
await writeFile(ARCHIVO, JSON.stringify(ahora, null, 2) + '\n');
console.log(`Hecho: ${hechos.length}/${plan.length}`);
