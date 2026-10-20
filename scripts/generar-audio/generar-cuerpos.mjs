// Audio de las líneas con sangría de las fichas de gramática («<b>Gaur ondo nago.</b> — Hoy estoy bien.»).
//
//   node generar-cuerpos.mjs --seco     (solo cuenta y enseña el plan)
//   node generar-cuerpos.mjs            (genera, sube al bucket, parchea los JSON y escribe out/faltantes-informe.json)
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
const SALIDA = path.join(AQUI, 'out', 'cuerpos');

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

const porTexto = new Map();
const reg = (x) => { if (x && x.eu && x.audio) porTexto.set(normalizar(x.eu), x.audio); };
for (const { d } of unidades) {
  for (const v of d.vocabulario || []) { reg(v); (v.variantes || []).forEach(reg); }
  for (const g of d.gramatica || []) (g.ejemplos || []).forEach(reg);
  (d.audiosExtra || []).forEach(reg);
}
const carpetaDe = (d, sub) => { // la carpeta que más usan las palabras del mismo tema (o de la misma unidad)
  const cuenta = (filtro) => { const c = {}; for (const v of d.vocabulario) { if (!filtro(v)) continue; for (const it of [v, ...(v.variantes || [])]) { const m = /^unidades\/(u[\d.]+)\//.exec(it.audio || ''); if (m) c[m[1]] = (c[m[1]] || 0) + 1; } } return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0]; };
  return cuenta((v) => v.subnivel === sub) || cuenta(() => true) || d.id;
};


// Líneas de ficha con sangría: <b>texto</b> — significado. No llevan audio:
// las letras y sonidos sueltos (referentes, no palabras), las plantillas con «…»
// y las líneas que en realidad son castellano.
const LETRAS = new Set(['z', 's', 'x', 'tx', 'j', 'h', 'g']);
const CASTELLANO = new Set(['los de dentro', 'los que dan de comer', 'los del monte y el corral', 'yo soy profesor']);
const limpiar = (t) => t.replace(/^[—–-]\s*/, '').replace(/^\d+\.\s*/, '').trim();
const plan = []; // { d, eu (texto tal cual en el <b>), tts, accion, ruta, nota }
const vistos = new Map();
for (const { d } of unidades) {
  for (const g of d.gramatica || []) {
    for (const ln of String(g.cuerpo || '').split('\n')) {
      const m = /^<b>([^<]+)<\/b>\s*(—|–|-)/.exec(ln);
      if (!m) continue;
      const eu = m[1].trim();
      if (porTexto.has(normalizar(eu))) continue;
      const tts = limpiar(eu);
      const k = normalizar(tts);
      if (LETRAS.has(k) || tts.includes('…') || CASTELLANO.has(k)) continue;
      if (vistos.has(normalizar(eu))) continue;
      vistos.set(normalizar(eu), true);
      const ya = porTexto.get(k);
      if (ya) { plan.push({ d, eu, tts, accion: 'enlazar', ruta: ya }); continue; }
      const ttsLeido = tts.replace(/\s*\/\s*/g, ', ');
      const rutaClave = clave(tts);
      let ruta = null;
      for (const p of plan) if (p.tts && normalizar(p.tts) === k && p.ruta) ruta = p.ruta;   // mismo texto ya planeado en otra unidad
      plan.push({ d, eu, tts: ttsLeido, accion: ruta ? 'enlazar' : 'generar', ruta: ruta || `unidades/${d.id}/${rutaClave}.mp3`, nota: nota(k) });
    }
  }
}
// Frases en cursiva con una palabra resaltada dentro («<i><b>Non</b> zaude?</i>»): la ficha habla de una
// palabra, pero la frase se narra entera. Si falta, la app solo pondría audio a la palabra.
for (const { d } of unidades) {
  for (const g of d.gramatica || []) {
    const cuerpo = String(g.cuerpo || '');
    const re = /<i>((?:(?!<\/i>)[\s\S])*?<b>(?:(?!<\/i>)[\s\S])*?)<\/i>/g;
    let m;
    while ((m = re.exec(cuerpo))) {
      const eu = m[1].replace(/<[^>]+>/g, '').trim();
      const k = normalizar(eu);
      if (!k || porTexto.has(k) || vistos.has(k) || eu.includes('…') || CASTELLANO.has(k)) continue;
      vistos.set(k, true);
      plan.push({ d, eu, tts: eu, accion: 'generar', ruta: `unidades/${d.id}/${clave(eu)}.mp3`, nota: nota(k), cursiva: true });
    }
  }
}
console.log(`Líneas sin audio: ${plan.length} · enlazar: ${plan.filter((p) => p.accion === 'enlazar').length} · generar: ${plan.filter((p) => p.accion === 'generar').length}`);
if (SECO) { plan.forEach((p) => console.log(`  ${p.cursiva ? 'CURSIVA ' : ''}${p.accion.padEnd(8)} ${p.d.id} «${p.eu}» → ${p.ruta}`)); process.exit(0); }
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
const informe = [];
let i = 0;
const hechos = new Set();
for (const p of plan) {
  i++;
  const reg_ = { ruta: p.ruta, texto: p.eu, unidad: p.d.id, accion: p.accion, nota: p.nota || null };
  try {
    if (p.accion === 'generar' && !hechos.has(p.ruta)) {
      if (await enBucket(p.ruta)) { reg_.accion = 'enlazar'; reg_.detalle = 'ya estaba en el bucket'; }
      else {
        const local = path.join(SALIDA, p.ruta.replaceAll('/', '_'));
        let buf;
        if (await existe(local)) buf = await readFile(local); else { buf = await sintetizar(cli, p.tts, p.nota); await writeFile(local, buf); await esperar(1500); }
        reg_.detalle = await subir(p.ruta, buf);
      }
      hechos.add(p.ruta);
    }
    p.ok = true;
    console.log(`${i}/${plan.length} ${reg_.accion.padEnd(8)} ${p.ruta}`);
  } catch (e) { reg_.error = e.message; console.error(`${i}/${plan.length} FALLO ${p.ruta}: ${e.message}`); }
  informe.push(reg_);
}
// Cada línea queda enlazada en la lista suelta `audiosExtra` de su unidad: audioDePalabra() la busca ahí por el texto del <b>.
// (se vuelve a leer cada JSON del disco justo antes de escribir: mientras se generaba, Ric pudo haber fusionado cambios en `data/`)
for (const { f, d: viejo } of unidades) {
  const nuevas = plan.filter((p) => p.d === viejo && p.ok);
  if (!nuevas.length) continue;
  const d = JSON.parse(await readFile(path.join(DATA, f), 'utf8'));
  d.audiosExtra = d.audiosExtra || [];
  for (const p of nuevas) if (!d.audiosExtra.some((x) => normalizar(x.eu) === normalizar(p.eu))) d.audiosExtra.push({ eu: p.eu, audio: p.ruta });
  await writeFile(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n');
}
await writeFile(path.join(AQUI, 'out', 'cuerpos-informe.json'), JSON.stringify(informe, null, 2));
console.log(`Hecho. ${informe.filter((x) => !x.error).length} bien, ${informe.filter((x) => x.error).length} con error.`);
