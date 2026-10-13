// Las nueve formas del pasado de la unidad 10 que no tienen mp3 (13/10/2026).
//
// No son correcciones: estas nueve NUNCA se han generado. Se comprobó una a
// una contra el bucket —las doce carpetas de unidad y los prefijos de
// pruebas, 198 rutas— y no existe ninguna. Las otras tres del paradigma
// (zuen, geunden, zeuden) sí existían y ya están enlazadas.
//
// Mismo mecanismo que lote-ric-3.mjs: al modelo se le pasa una instrucción
// fonética en inglés junto al texto, porque no acepta SSML ni fonemas.
//
//   cd scripts/generar-audio && npm install
//   mkdir -p /tmp/audio-trim-work/lote
//   node lote-paradigmas-u10.mjs
//
// Los mp3 salen a /tmp/audio-trim-work/lote/ con las barras de la ruta
// cambiadas por guiones bajos (unidades_u11_zenuten.mp3).
//
// POR QUÉ ESTAS NOTAS. Ric ha revisado de oído los 302 audios del curso
// (ver docs/audio-revision-completa.md) y de los 108 fallos salen unas diez
// causas que se repiten. Las tres que afectan a estas nueve palabras van
// cargadas de entrada en cada nota, para no gastar una ronda de revisión
// en descubrir lo que ya sabemos:
//
//   · la z vasca es una s silbante, nunca la z castellana ni una "sh"
//     (es la causa más extendida: 353 ficheros del curso llevan z);
//   · las consonantes finales se las come, y las nueve acaban en -n
//     (un tercio de todos los fallos son finales que se pierden);
//   · el grupo tz tiene que sonar como una ts clara, no como "ch".
//
// LO QUE NO SE LE DICE: el acento. Ric ha corregido ocho acentos y no hay
// regla que los una (gásta, sagárra, játen, daukát…), así que inventarse
// una posición aquí sería peor que dejarlo. Eso se juzga al escucharlo.
//
// Y OJO CON LA PALATALIZACIÓN: ninguna de estas nueve la lleva. En euskera
// la n se palataliza solo detrás de una i, y aquí la i va siempre DELANTE
// de una t (ni-tuen, zi-tuen), nunca pegada a la n. La voz ha metido ñ
// donde no tocaba —dijo "amoña" por "amona"—, así que conviene decírselo.

import { GoogleAuth } from 'google-auth-library';
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';

const COMUN =
  'The final n must be clearly audible — do not swallow it or let the word trail off. ' +
  'All vowels open and distinct. Do NOT palatalize the n: it must be a plain n, never a ñ sound.';

const Z_SILBANTE =
  'The initial z is a whistling s, as in Spanish "sol" — it is NOT the Spanish "z" of "zapato" ' +
  'and NOT an English "sh". ';

// ── «ukan» en pasado · las dos que faltaban con objeto singular ─────────
const UKAN_SINGULAR = [
  { ruta: 'unidades/u11/zenuten.mp3', texto: 'zenuten',
    nota: Z_SILBANTE + 'Three clear syllables: ze-nu-ten. ' + COMUN },
];

// ── «ukan» en pasado · el paradigma entero de objeto plural ────────────
// Ninguna de las seis se había generado nunca. Llevan el infijo -it-, que
// es lo que las distingue de las de objeto singular, así que esa t tiene
// que oírse: si se pierde, «nituen» suena igual que «nuen» y el alumno no
// puede distinguirlas de oído.
const UKAN_PLURAL = [
  { ruta: 'unidades/u11/nituen.mp3', texto: 'nituen',
    nota: 'Three syllables: ni-tu-en. The t in the middle must be a clear unvoiced t — it carries the ' +
          'meaning (plural object) and must not be softened or dropped. ' + COMUN },
  { ruta: 'unidades/u11/zenituen.mp3', texto: 'zenituen',
    nota: Z_SILBANTE + 'Four syllables, every one distinct: ze-ni-tu-en. The t must be clearly audible. ' + COMUN },
  { ruta: 'unidades/u11/zituen.mp3', texto: 'zituen',
    nota: Z_SILBANTE + 'Three syllables: zi-tu-en. The t must be clearly audible. ' + COMUN },
  { ruta: 'unidades/u11/genituen.mp3', texto: 'genituen',
    nota: 'The initial g is a hard g as in English "go", never a j sound. Four syllables: ge-ni-tu-en. ' +
          'The t must be clearly audible. ' + COMUN },
  { ruta: 'unidades/u11/zenituzten.mp3', texto: 'zenituzten',
    nota: Z_SILBANTE + 'Long word, five syllables, none rushed: ze-ni-tuz-ten. The "tz" is a clear ' +
          'ts sound as in English "cats" — it must NOT become a "ch". ' + COMUN },
  { ruta: 'unidades/u11/zituzten.mp3', texto: 'zituzten',
    nota: Z_SILBANTE + 'Four syllables: zi-tuz-ten. The "tz" is a clear ts sound as in English "cats", ' +
          'never a "ch". ' + COMUN },
];

// ── «egon» en pasado · las dos que faltaban ────────────────────────────
// Son las más irregulares del curso: la -au- del presente (zaude, zaudete)
// se convierte en -eu-. Si las vocales se juntan, el alumno oye el presente.
const EGON = [
  { ruta: 'unidades/u11/zeunden.mp3', texto: 'zeunden',
    nota: Z_SILBANTE + 'The "eu" is two distinct vowels, e then u — do not merge them into a single ' +
          'sound and do not turn them into "au". Two syllables: zeun-den. ' + COMUN },
  { ruta: 'unidades/u11/zeundeten.mp3', texto: 'zeundeten',
    nota: Z_SILBANTE + 'The "eu" is two distinct vowels, e then u — do not merge them and do not turn ' +
          'them into "au". Three syllables: zeun-de-ten. ' + COMUN },
];

const PALABRAS = [...UKAN_SINGULAR, ...UKAN_PLURAL, ...EGON];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

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
  console.log('');
  console.log('Al subirlos a unidades/u11/, el vocabulario de la unidad 10 queda');
  console.log('completo: los tres paradigmas del pasado con sus seis formas sonando.');
  console.log('Entonces hay que añadir el campo "audio" a esas nueve entradas de');
  console.log('data/unidades-v2/10-atzo.json — la ruta es la de arriba sin cambios.');
}

main();
