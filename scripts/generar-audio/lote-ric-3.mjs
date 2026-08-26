// Tercera ronda de correcciones de audio dictadas por Ric (25-26/08/2026).
// Mismo mecanismo que lote-ric.mjs: se le pasa al modelo una instrucción
// fonética en inglés junto al texto. Ver docs/audios-pendientes.md para el
// detalle de cada caso y su historial.
//
//   cd scripts/generar-audio && npm install
//   mkdir -p /tmp/audio-trim-work/lote
//   node lote-ric-3.mjs
//
// Los mp3 salen a /tmp/audio-trim-work/lote/ con el nombre de la ruta y las
// barras cambiadas por guiones bajos, igual que el lote anterior.

import { GoogleAuth } from 'google-auth-library';
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';

// ── Grupo 1 · El acento cae en la sílaba equivocada ─────────────────────
// Seis casos y sin regla que los una: «eguerdia» y «euria» empiezan casi
// igual y llevan el acento en sílabas distintas. Por eso aquí se le dice
// la posición palabra por palabra en vez de esperar que la deduzca.
const ACENTO = [
  { ruta: 'unidades/u3/agian.mp3', texto: 'agian',
    nota: 'Stress the SECOND syllable: a-GI-an. The main stress falls on the "i". Do not stress the first syllable.' },
  { ruta: 'unidades/u12/berdin.mp3', texto: 'berdin',
    nota: 'Stress the FINAL syllable: ber-DIN. The final "i" must be open and carry the stress, not reduced or unstressed.' },
  { ruta: 'unidades/u6/daude.mp3', texto: 'daude',
    nota: 'Stress the FINAL syllable: dau-DE. The stress falls on the final "e".' },
  { ruta: 'unidades/u7/eguerdia.mp3', texto: 'eguerdia',
    nota: 'Stress the syllable "er": e-guER-di-a. The stress falls on the "e" of "-guer-", not on the first syllable and not on the "i".' },
  { ruta: 'unidades/u10/euria.mp3', texto: 'euria',
    nota: 'Stress the "i": e-u-RI-a. The stress falls on the "i", not on the opening "eu".' },
  { ruta: 'unidades/u11/garai-hartan.mp3', texto: 'garai hartan',
    nota: 'In the second word the stress falls on its FINAL syllable: har-TAN. Do not stress "har".' },
];

// ── Grupo 2 · Los auxiliares ────────────────────────────────────────────
// Son las palabras más frecuentes del euskera y salen en casi todas las
// frases del curso, así que esta es la tanda que más rinde.
const AUXILIARES = [
  { ruta: 'unidades/u4/da.mp3', texto: 'da',
    nota: 'The d must be a DENTAL d, exactly as in Spanish "dato" — tongue against the upper teeth, no aspiration. It must NOT sound like an English alveolar aspirated d.' },
  { ruta: 'unidades/u5/du.mp3', texto: 'du',
    nota: 'Exactly two sounds: a dental d as in Spanish "dato", then a clean u. Do NOT add any i sound at the end — it must not sound like "dui".' },
  { ruta: 'unidades/u4/gara.mp3', texto: 'gara',
    nota: 'The initial g must be a clear hard g as in English "go". It must NOT sound like a d — do not say "dara".' },
];

// ── Grupo 3 · Consonantes concretas ─────────────────────────────────────
const CONSONANTES = [
  { ruta: 'unidades/u12/benetan.mp3', texto: 'benetan',
    nota: 'The initial b must be a clear b sound. It must NOT sound like a d — do not say "denetan".' },
  { ruta: 'unidades/u7/astea.mp3', texto: 'astea',
    nota: 'The t must be a clear unvoiced t: as-te-a. It must NOT sound like a p — do not say "aspea".' },
  { ruta: 'unidades/u6/atea.mp3', texto: 'atea',
    nota: 'The t must be a clear unvoiced t: a-te-a. It must NOT sound like a p — do not say "apea".' },
  { ruta: 'unidades/u10/axola-zait.mp3', texto: 'axola zait',
    nota: 'The x is a soft "sh" sound as in English "shop" — it must NOT be the "ch" of English "chop". Say "ashola", never "achola".' },
  { ruta: 'unidades/u2/geu.mp3', texto: 'geu',
    nota: 'The e must be an OPEN e as in English "get". Do not close it towards an i — it must not sound like "giu".' },
  { ruta: 'unidades/u1/ez-horregatik.mp3', texto: 'ez horregatik',
    nota: 'Third attempt on this one. The rr must be strongly rolled AND the final k must be a clear, audible k. Previous takes lost the final consonant and sounded like "orregatit" or "horregadit". End the word crisply on k.' },
];

// ── Grupo 4 · Segunda ronda que siguió fallando (revisado 21/08) ────────
const PENDIENTES = [
  { ruta: 'unidades/u12/inor-ez.mp3', texto: 'inor ez',
    nota: 'The "in" is palatalized to a ñ sound: say "iñor". The r must be a clear tapped r. Do not say "inon" and do not turn the r into an l.' },
  { ruta: 'unidades/u10/iruditzen-zait.mp3', texto: 'iruditzen zait',
    nota: 'The word "zait" has two clear parts, za-it, ending on a clean t. It must NOT be reduced to something like "set".' },
  { ruta: 'unidades/u9/joan.mp3', texto: 'joan',
    nota: 'The j is a soft aspirated sound, like the h in English "hat". It must NOT be a y sound — do not say "Yoan".' },
  { ruta: 'unidades/u6/logela.mp3', texto: 'logela',
    nota: 'The g must be a hard, clearly marked g as in English "go" — like Spanish "loguela". It must NOT be the soft Spanish "j" sound; do not say "lojela".' },
  { ruta: 'unidades/u3/noren.mp3', texto: 'noren',
    nota: 'The r must be a clear tapped r. It must NOT become an n or an l — do not say "nonen" or "nolen".' },
  { ruta: 'unidades/u9/zatoz.mp3', texto: 'zatoz',
    nota: 'Both z sounds are a clear sibilant s, as in English "see". Neither may be the Spanish "th" z sound.' },
];

// ── mahaia · caso aparte ────────────────────────────────────────────────
// Tres regeneraciones, tres resultados malos distintos ("mayayaia",
// "maiaia"). Regenerar tal cual no parece bastar, así que va con la
// instrucción más explícita posible. Si vuelve a fallar, el siguiente paso
// acordado es trucar el texto que se envía (mandar "maaia" en vez de
// "mahaia") — no se hace aquí porque cambia lo que se sintetiza y esa
// decisión es de Miguel.
const MAHAIA = [
  { ruta: 'unidades/u6/mahaia.mp3', texto: 'mahaia',
    nota: 'CRITICAL: the letter h here is COMPLETELY SILENT. The word is exactly three vowel sounds after the m: ma-a-ia. Do not insert any y, j, or consonant sound where the h is written. It must sound like "maaia" — never "mayaya", "mayayaia" or "maiaia".' },
];

const PALABRAS = [...ACENTO, ...AUXILIARES, ...CONSONANTES, ...PENDIENTES, ...MAHAIA];

function esperar(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function sintetizar(authClient, texto, nota) {
  const { token } = await authClient.getAccessToken();
  const resp = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'x-goog-user-project': PROJECT_ID,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      input: { prompt: BASE_PROMPT + nota, text: texto },
      voice: VOICE,
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error('TTS ' + resp.status + ': ' + JSON.stringify(data));
  return data.audioContent;
}

async function conReintentos(authClient, texto, nota, intento = 1) {
  try {
    return await sintetizar(authClient, texto, nota);
  } catch (err) {
    if (String(err.message).includes('429') && intento <= 5) {
      const espera = 8000 * intento;
      console.log('    cuota agotada, esperando ' + (espera / 1000) + 's...');
      await esperar(espera);
      return conReintentos(authClient, texto, nota, intento + 1);
    }
    throw err;
  }
}

async function main() {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const authClient = await auth.getClient();
  let i = 0;
  for (const p of PALABRAS) {
    i++;
    const nombre = p.ruta.replace(/\//g, '_');
    try {
      const audio = await conReintentos(authClient, p.texto, p.nota);
      await writeFile('/tmp/audio-trim-work/lote/' + nombre, audio, 'base64');
      console.log(i + '/' + PALABRAS.length + ' ok: ' + p.ruta);
    } catch (err) {
      console.error(i + '/' + PALABRAS.length + ' FALLO: ' + p.ruta, err.message);
    }
    await esperar(1500);
  }
  console.log('TERMINADO');
}

main();
