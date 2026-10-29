// Audio de las RESPUESTAS CORRECTAS en euskera de los ejercicios (opción, traducir, escribir, ordenar) que no lo tienen.
// No se generan los distractores (muchos son formas incorrectas a propósito, y la app no los reproduce).
//
//   node generar-respuestas.mjs --seco     (solo cuenta y enseña el plan)
//   node generar-respuestas.mjs            (genera, sube al bucket, parchea los JSON y escribe out/faltantes-informe.json)
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
const SALIDA = path.join(AQUI, 'out', 'respuestas');

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


const archivos = (await readdir(DATA)).filter((f) => f.endsWith('.json')).sort();
const unidades = [];
for (const f of archivos) unidades.push({ f, d: JSON.parse(await readFile(path.join(DATA, f), 'utf8')) });

const conAudio = new Set(), vocab = new Set();
for (const { d } of unidades) {
  const reg = (x) => { if (x && x.eu) { vocab.add(normalizar(x.eu)); if (x.audio) conAudio.add(normalizar(x.eu)); } };
  for (const v of d.vocabulario || []) { reg(v); (v.variantes || []).forEach(reg); }
  for (const g of d.gramatica || []) (g.ejemplos || []).forEach((e) => { if (e.audio) conAudio.add(normalizar(e.eu)); });
  (d.audiosExtra || []).forEach((e) => { if (e.audio) conAudio.add(normalizar(e.eu)); });
}
const fichas = new Set(); for (const w of vocab) for (const t of w.split(' ')) fichas.add(t);
const esEuskera = (t) => { const ts = normalizar(t).split(' ').filter(Boolean); return ts.length > 0 && ts.filter((x) => fichas.has(x)).length >= Math.max(1, ts.length / 2); };
// Lo que no se puede decir en voz alta: huecos, glosas en castellano, signos de lista.
const NO_HABLADO = new Set(['el batua', 'al final', 'solo «dut»', 'un «ez»', 'lau (cuatro)', 'izan (naiz, zara, da)', 'eguna < astea < hilabetea']);
const noSeDice = (t) => /___|[«»()<]/.test(t) || NO_HABLADO.has(normalizar(t));

const plan = []; const vistos = new Set();
for (const { d } of unidades) {
  for (const g of d.ejercicios || []) for (const v of g.variantes || []) {
    let txt = null;
    if (v.tipo === 'opcion') txt = v.opciones[v.correcta];
    else if (v.tipo === 'orden') txt = v.eu;
    else if (v.tipo === 'traducir' || v.tipo === 'escribir') txt = (v.respuestas && v.respuestas[0]) || v.solucion;
    if (!txt) continue;
    const k = normalizar(txt);
    if (conAudio.has(k) || vistos.has(k) || !esEuskera(txt) || noSeDice(txt)) continue;
    vistos.add(k);
    plan.push({ d, eu: txt, ruta: `unidades/${d.id}/${clave(txt)}.mp3`, nota: nota(k) });
  }
}
console.log(`Respuestas correctas sin audio: ${plan.length}`);
if (SECO) { plan.forEach((x) => console.log(`  ${x.d.id} «${x.eu}» → ${x.ruta}`)); process.exit(0); }

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
const hechos = [], fallos = [];
for (const x of plan) {
  try {
    if (!(await enBucket(x.ruta))) {
      const local = path.join(SALIDA, x.ruta.replaceAll('/', '_'));
      let buf;
      if (await existe(local)) buf = await readFile(local); else { buf = await sintetizar(cli, x.eu, x.nota); await writeFile(local, buf); await esperar(1500); }
      await subir(x.ruta, buf);
    }
    hechos.push(x);
    if (hechos.length % 20 === 0) console.log(`${hechos.length}/${plan.length}`);
  } catch (e) { fallos.push(x.eu); console.error(`FALLO «${x.eu}»: ${e.message}`); }
}
// Cada respuesta queda enlazada en `audiosExtra` de su unidad: audioDePalabra() la busca ahí por el texto.
// Se vuelve a leer cada JSON del disco justo antes de escribir (Ric puede haber fusionado cambios en data/).
for (const { f, d: viejo } of unidades) {
  const nuevas = hechos.filter((x) => x.d === viejo);
  if (!nuevas.length) continue;
  const d = JSON.parse(await readFile(path.join(DATA, f), 'utf8'));
  d.audiosExtra = d.audiosExtra || [];
  for (const x of nuevas) if (!d.audiosExtra.some((e) => normalizar(e.eu) === normalizar(x.eu))) d.audiosExtra.push({ eu: x.eu, audio: x.ruta });
  await writeFile(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n');
}
console.log(`Hecho: ${hechos.length}/${plan.length}. Fallos: ${fallos.length}${fallos.length ? ' → ' + fallos.join(' | ') : ''}`);
