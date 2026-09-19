// Regenera en 3 versiones cada palabra que Ric marcó "mal" al revisar el
// bloque 1 (revision-audio/bloque1.html), para elegir la mejor de las tres.
// Mismo mecanismo que lote-ric-3.mjs: instrucción fonética en inglés
// adjunta al texto. Las notas de Ric (en español) están traducidas a
// instrucciones explícitas para el modelo.
//
//   cd scripts/generar-audio && node regenerar-fallos-bloque1.mjs
//
// Salida: out/_regenerar/<unidad>__<clave>/v1.mp3, v2.mp3, v3.mp3

import { GoogleAuth } from 'google-auth-library';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(AQUI, 'out', '_regenerar');

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE = 'Say this Basque word or phrase at a natural, normal conversational pace. ';

// Cada palabra: la nota de Ric (para referencia) + la instrucción en
// inglés que se le manda al modelo. `variantes` opcional: 3 formulaciones
// distintas de la misma corrección — por defecto se generan 3 pasadas con
// la MISMA instrucción (la voz no es determinista, ya varía sola), salvo
// que se listen variantes específicas para dar más margen.
const PALABRAS = [
  { unidad: 'u1', clave: 'gipuzkoa', texto: 'Gipuzkoa',
    notaRic: 'la "z" debe de ser una s silbante.',
    instruccion: 'The "z" in "Gipuzkoa" must be a sibilant s sound, like the s in English "see". It must NEVER sound like the Spanish "z" (th) or like "sh".' },
  { unidad: 'u1', clave: 'barkatu-mesedez', texto: 'Barkatu, mesedez.',
    notaRic: 'la d debe de ser clara, ahora mismo suena mesenez',
    instruccion: 'The "d" in "mesedez" must be clearly articulated, a dental d as in Spanish "dato". It must NOT be dropped or nasalized — do not say "mesenez".' },
  { unidad: 'u1', clave: 'gela', texto: 'gela',
    notaRic: 'suena como aleman o inglés, con una voz española debería ser claramente "Guela"',
    instruccion: 'Pronounce this with a Spanish-accented voice, not German or English. The g must be hard as in Spanish "guerra": GUE-la, two clear syllables, clean vowels.' },
  { unidad: 'u1', clave: 'bizkaiera', texto: 'bizkaiera',
    notaRic: 'el acento está mal, es Bizkáiera (acento en la a)',
    instruccion: 'Stress the syllable "kai": biz-KAI-e-ra. The main stress falls on that "a", not on any other syllable.' },
  { unidad: 'u2', clave: 'nola-duzu-izena', texto: 'Nola duzu izena?',
    notaRic: 'el acento es como americano, Izena no se oye bien, es claramente "ISENA" con s silvante',
    instruccion: 'Do not use an American English accent. The word "izena" must be clearly pronounced i-SE-na, with a sibilant s as in English "see", not "sh" and not Spanish "z".' },
  { unidad: 'u2', clave: 'ni-ere-euskalduna-naiz', texto: 'Ni ere euskalduna naiz.',
    notaRic: 'ere se acentúa en la segunda e como eré',
    instruccion: 'The word "ere" is stressed on its FINAL syllable: e-RE. Do not stress the first e.' },
  { unidad: 'u2', clave: 'gu-ere-lagunak-gara', texto: 'Gu ere lagunak gara.',
    notaRic: 'gará (no se entiende gara, con acento en la a final)',
    instruccion: 'The word "gara" is stressed on its FINAL syllable: ga-RA. It must be clearly audible, not swallowed.' },
  { unidad: 'u2', clave: 'nire-herria-txikia-da', texto: 'Nire herria txikia da.',
    notaRic: 'Txikia da, no es claro, suena como txikinada, separa las palabras, y que "txikia" sea claro',
    instruccion: 'Pronounce "txikia" and "da" as two clearly separate words with a brief pause between them. Do NOT blend them into one word like "txikinada". Every syllable of "txikia" (txi-ki-a) must be distinct.' },
  { unidad: 'u2', clave: 'zuek-ikasleak-zarie', texto: 'Zuek ikasleak zarie.',
    notaRic: 'el "ikasleak" suena "ikashleak", la S debe ser silvante',
    instruccion: 'The s in "ikasleak" must be a sibilant s, like the s in English "see". It must NOT be a "sh" sound — do not say "ikashleak".' },
  { unidad: 'u3', clave: 'horiek', texto: 'horiek',
    notaRic: 'Es "Horiek" la R debe ser clara',
    instruccion: 'The r in "horiek" must be a clear, audible tapped r. Do not drop or weaken it.' },
  { unidad: 'u3', clave: 'horreek', texto: 'horreek',
    notaRic: 'el acento es en la o "Hórreek"',
    instruccion: 'Stress the FIRST syllable: HO-rreek. The rr is a strongly rolled r.' },
  { unidad: 'u3', clave: 'ikasle-hori-nongoa-da', texto: 'Ikasle hori nongoa da?',
    notaRic: 'nongóa (el acento está en esa última o)',
    instruccion: 'In the word "nongoa", stress the syllable "go": non-GO-a. Do not stress the first syllable.' },
  { unidad: 'u3', clave: 'ha-medikua-da', texto: 'Ha medikua da.',
    notaRic: 'separa la palabra "ha" de "medikua"',
    instruccion: 'Pronounce "Ha" as a clearly separate word, with a brief pause before "medikua". Do not merge them into one word.' },
  { unidad: 'u3', clave: 'ikasle-horreek-euskaldunak-dira', texto: 'Ikasle horreek euskaldunak dira.',
    notaRic: 'el acento de horreek es en la o',
    instruccion: 'In the word "horreek", stress the FIRST syllable: HO-rreek, with a strongly rolled rr.' },
  { unidad: 'u3', clave: 'noiz-gaur', texto: 'Noiz? Gaur.',
    notaRic: 'mal, dice otra cosa. Sería: Noiz? gaur.',
    instruccion: 'This is exactly two short separate utterances: first "Noiz?" spoken as a short rising question, then a clear pause, then "Gaur." spoken as a short confident statement. Do not say anything else — only these two words.' },
  { unidad: 'u4', clave: 'hemeretzi', texto: 'hemeretzi',
    notaRic: 'dice hemenetzi, la R debe ser clara "hemeretzi"',
    instruccion: 'The r in "hemeretzi" must be a clear tapped r. It must NOT sound like an n — do not say "hemenetzi".' },
];

function esperar(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function sintetizar(authClient, texto, instruccion) {
  const { token } = await authClient.getAccessToken();
  const resp = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'x-goog-user-project': PROJECT_ID,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      input: { prompt: BASE + instruccion, text: texto },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error('TTS ' + resp.status + ': ' + JSON.stringify(data));
  return data.audioContent;
}

async function conReintentos(authClient, texto, instruccion, intento = 1) {
  try {
    return await sintetizar(authClient, texto, instruccion);
  } catch (err) {
    if (String(err.message).includes('429') && intento <= 5) {
      const espera = 10000 * intento;
      console.log('    cuota agotada, esperando ' + (espera / 1000) + 's...');
      await esperar(espera);
      return conReintentos(authClient, texto, instruccion, intento + 1);
    }
    throw err;
  }
}

async function main() {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const authClient = await auth.getClient();

  for (const p of PALABRAS) {
    const destDir = path.join(SALIDA, p.unidad + '__' + p.clave);
    await mkdir(destDir, { recursive: true });
    console.log(p.unidad + '/' + p.clave + ' — «' + p.texto + '»');
    for (let v = 1; v <= 3; v++) {
      const destino = path.join(destDir, 'v' + v + '.mp3');
      const audio = await conReintentos(authClient, p.texto, p.instruccion);
      await writeFile(destino, audio, 'base64');
      console.log('  v' + v + ' generada');
      await esperar(2500);
    }
  }
  console.log('\nListo. Salida en ' + path.relative(path.join(AQUI, '..', '..'), SALIDA) + '/');
}

main().catch((err) => { console.error(err); process.exit(1); });
