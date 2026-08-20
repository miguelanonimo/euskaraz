import { GoogleAuth } from 'google-auth-library';
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';

const PALABRAS = [
  { ruta: 'unidades/u1/ez-horregatik.mp3', texto: 'ez horregatik', nota: 'The rr in "horregatik" must be a strong rolled/trilled Basque-Spanish style rr, not a weak or soft one.' },
  { ruta: 'unidades/u1/ikusi-arte.mp3', texto: 'ikusi arte', nota: 'The r in "arte" must be a clear simple tapped r, never an l sound.' },
  { ruta: 'unidades/u2/gure.mp3', texto: 'gure', nota: 'Both the g and the r must be clearly articulated. Do not swallow them into something like "bule".' },
  { ruta: 'unidades/u2/haren.mp3', texto: 'haren', nota: 'The r in the middle must be clearly audible, a simple tapped r. Do not drop it.' },
  { ruta: 'unidades/u2/hi.mp3', texto: 'hi', nota: 'The h must be a soft aspirated h sound, never a y sound.' },
  { ruta: 'unidades/u2/izena.mp3', texto: 'izena', nota: 'The z must be a clear sibilant s sound (like English "s" in "see"), never a Spanish z sound.' },
  { ruta: 'unidades/u4/izena.mp3', texto: 'izena', nota: 'The z must be a clear sibilant s sound (like English "s" in "see"), never a Spanish z sound.' },
  { ruta: 'unidades/u3/bihar.mp3', texto: 'bihar', nota: 'The final r must be a clear tapped r sound, never an n sound.' },
  { ruta: 'unidades/u7/bihar.mp3', texto: 'bihar', nota: 'The final r must be a clear tapped r sound, never an n sound.' },
  { ruta: 'unidades/u3/galdera.mp3', texto: 'galdera', nota: 'The d must be a clear plain d sound, never a y sound.' },
  { ruta: 'unidades/u3/noren.mp3', texto: 'noren', nota: 'The r must be a clear tapped r sound, never an n sound (do not say "nonen").' },
  { ruta: 'unidades/u3/zergatik.mp3', texto: 'zergatik', nota: 'Pronounce clearly: z as sibilant s, e as in "get", r as simple tap, g hard as in "go", a, t, i, k. Overall clear and precise, not mumbled.' },
  { ruta: 'unidades/u5/hemeretzi.mp3', texto: 'hemeretzi', nota: 'Every r must be a clear tapped r sound, never an l sound.' },
  { ruta: 'unidades/u5/katua.mp3', texto: 'katua', nota: 'The t must be a clear unvoiced t (not d). The word ends cleanly in "-tua" — do not add any r sound at the end, there is no r in this word at all.' },
  { ruta: 'unidades/u5/sei.mp3', texto: 'sei', nota: 'The s must be a clear sibilant s sound, never an sh/x sound.' },
  { ruta: 'unidades/u5/txakurra.mp3', texto: 'txakurra', nota: 'The rr must be a strong rolled/trilled Basque-Spanish style rr, not a soft English-style r.' },
  { ruta: 'unidades/u9/merkatua.mp3', texto: 'merkatua', nota: 'The word ends cleanly in "-tua" — do not add any r sound at the end, there is no r in this word at all.' },
  { ruta: 'unidades/u6/han.mp3', texto: 'han', nota: 'The a must be clearly audible and open, like English "hah". Do not swallow it into something like "en".' },
  { ruta: 'unidades/u7/zer-ordu-da.mp3', texto: 'Zer ordu da?', nota: 'The u in "ordu" must be clearly audible, a clear u vowel. Do not drop it.' },
  { ruta: 'unidades/u6/logela.mp3', texto: 'logela', nota: 'The g must be a hard, clearly marked g sound (like English "go"), never soft or swallowed.' },
  { ruta: 'unidades/u6/mahaia.mp3', texto: 'mahaia', nota: 'The h between vowels is completely silent — do not pronounce it at all, it should sound like "maaia".' },
  { ruta: 'unidades/u8/arazoa.mp3', texto: 'arazoa', nota: 'The z must be a clear sibilant s sound, never an affricate like "tx".' },
  { ruta: 'unidades/u8/arraina.mp3', texto: 'arraina', nota: 'The rr must be a strong rolled/trilled rr, never a simple single r (do not say "araña" with simple r, the rr must be clearly rolled).' },
  { ruta: 'unidades/u8/haragia.mp3', texto: 'haragia', nota: 'The g must be a hard, clearly marked g sound like in Spanish "agua", never a y sound.' },
  { ruta: 'unidades/u8/hartu.mp3', texto: 'hartu', nota: 'The word ends in a clear u vowel sound, never an o sound. Do not say "harto".' },
  { ruta: 'unidades/u8/jan.mp3', texto: 'jan', nota: 'The j must be a soft aspirated sound like the h in English "hat" — never a y sound, never a hard j/y like in Catalan or Spanish.' },
  { ruta: 'unidades/u8/liburua.mp3', texto: 'liburua', nota: 'The r in the middle must be a soft tapped r sound, never an l sound.' },
  { ruta: 'unidades/u8/saldu.mp3', texto: 'saldu', nota: 'The word must end clearly in "-du", with a clear d and u. Do not say "salbo".' },
  { ruta: 'unidades/u9/denda.mp3', texto: 'denda', nota: 'Both d sounds must be equally clear and crisp, the second d must not be softened or slurred.' },
  { ruta: 'unidades/u9/ibili.mp3', texto: 'ibili', nota: 'The l must be clearly audible. Do not drop it (do not say "ibii").' },
  { ruta: 'unidades/u9/zatoz.mp3', texto: 'zatoz', nota: 'Both z sounds must be a clear sibilant s sound, never a Spanish z sound.' },
  { ruta: 'unidades/u9/joan.mp3', texto: 'joan', nota: 'The j must be a soft aspirated sound like the h in English "hat" — never a hard y like in Catalan.' },
  { ruta: 'unidades/u10/guri.mp3', texto: 'guri', nota: 'The g must be a clear hard g sound, never a b sound. Do not say "buri".' },
  { ruta: 'unidades/u10/iruditzen-zait.mp3', texto: 'iruditzen zait', nota: 'The final t in "zait" must be a clear t sound, never a k sound.' },
  { ruta: 'unidades/u10/negua.mp3', texto: 'negua', nota: 'The g must be clearly articulated, not extremely soft or close to a v sound.' },
  { ruta: 'unidades/u9/hondartza.mp3', texto: 'hondartza', nota: 'The vowel after "hond" must be a clear a sound, never an e sound. Do not say "hondertza".' },
  { ruta: 'unidades/u11/ahaztu.mp3', texto: 'ahaztu', nota: 'The h between vowels is completely silent — do not pronounce it as a jota/throat sound, it should sound like "aastu".' },
  { ruta: 'unidades/u11/berriro.mp3', texto: 'berriro', nota: 'The final r must be a clear tapped r sound, never a d sound.' },
  { ruta: 'unidades/u11/duela-bi-urte.mp3', texto: 'duela bi urte', nota: 'The r in "urte" must be a short, clear, single tapped Spanish/Basque style r — never an English-style approximant r.' },
  { ruta: 'unidades/u12/erraza.mp3', texto: 'erraza', nota: 'The z must be a clear sibilant s sound, never an affricate like "tz".' },
  { ruta: 'unidades/u12/hala-ere.mp3', texto: 'hala ere', nota: 'The r in "ere" must be a soft, clear tapped r sound, never a b sound.' },
  { ruta: 'unidades/u12/hobea.mp3', texto: 'hobea', nota: 'The b must be a clear b sound, never a g sound.' },
  { ruta: 'unidades/u12/inor-ez.mp3', texto: 'inor ez', nota: 'The r in "inor" must be a clear simple tapped r sound, never an l sound.' },
  { ruta: 'unidades/u11/nintzen.mp3', texto: 'nintzen', nota: 'The "ntz" sound cluster must be clearly audible, do not swallow or skip it.' },
  { ruta: 'unidades/u11/zenuen.mp3', texto: 'zenuen', nota: 'The z must be a clear sibilant s sound, never a Spanish z sound.' },
];

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
