import { GoogleAuth } from 'google-auth-library';
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'project-47fac5f5-2320-4893-9eb';
const VOICE = { languageCode: 'eu-ES', name: 'Kore', modelName: 'gemini-2.5-flash-tts' };
const BASE_PROMPT = 'Say this Basque word or phrase at a natural, normal conversational pace, clear pronunciation, not slow or exaggerated. ';
const NOTA_Z = 'The letter z must be a clear sibilant s sound (like the s in English "see"), never a Spanish z sound.';

const PALABRAS = [
  { ruta: 'unidades/u1/eta.mp3', texto: 'eta' },
  { ruta: 'unidades/u2/neure.mp3', texto: 'neure' },
  { ruta: 'unidades/u2/zeure.mp3', texto: 'zeure', nota: NOTA_Z },
  { ruta: 'unidades/u2/geure.mp3', texto: 'geure' },
  { ruta: 'unidades/u2/zeuek.mp3', texto: 'zeuek', nota: NOTA_Z },
  { ruta: 'unidades/u2/nire-etxea.mp3', texto: 'nire etxea' },
  { ruta: 'unidades/u2/zure-laguna.mp3', texto: 'zure laguna', nota: NOTA_Z },
  { ruta: 'unidades/u2/gure-herria.mp3', texto: 'gure herria' },
  { ruta: 'unidades/u2/haren-izena.mp3', texto: 'haren izena', nota: NOTA_Z },
  { ruta: 'unidades/u2/nire-herria.mp3', texto: 'nire herria' },
  { ruta: 'unidades/u2/zure-etxea.mp3', texto: 'zure etxea', nota: NOTA_Z },
  { ruta: 'unidades/u2/gure-laguna.mp3', texto: 'gure laguna' },
  { ruta: 'unidades/u2/haien-izena.mp3', texto: 'haien izena', nota: NOTA_Z },
  { ruta: 'unidades/u2/nire-etxe-handia.mp3', texto: 'nire etxe handia' },
  { ruta: 'unidades/u2/zure-herri-txikia.mp3', texto: 'zure herri txikia', nota: NOTA_Z },
  { ruta: 'unidades/u2/gure-lagun-polita.mp3', texto: 'gure lagun polita' },
  { ruta: 'unidades/u4/ni-ikaslea-naiz.mp3', texto: 'Ni ikaslea naiz.' },
  { ruta: 'unidades/u4/zu-medikua-zara.mp3', texto: 'Zu medikua zara.', nota: NOTA_Z },
  { ruta: 'unidades/u4/gu-lagunak-gara.mp3', texto: 'Gu lagunak gara.' },
  { ruta: 'unidades/u4/haiek-irakasleak-dira.mp3', texto: 'Haiek irakasleak dira.' },
  { ruta: 'unidades/u5/dugu.mp3', texto: 'dugu' },
  { ruta: 'unidades/u5/dute.mp3', texto: 'dute' },
  { ruta: 'unidades/u5/nik.mp3', texto: 'nik' },
  { ruta: 'unidades/u5/zuk.mp3', texto: 'zuk', nota: NOTA_Z },
  { ruta: 'unidades/u5/hark.mp3', texto: 'hark' },
  { ruta: 'unidades/u5/guk.mp3', texto: 'guk' },
  { ruta: 'unidades/u6/gela-txikia.mp3', texto: 'gela txikia' },
  { ruta: 'unidades/u6/herri-polita.mp3', texto: 'herri polita' },
  { ruta: 'unidades/u9/handik.mp3', texto: 'handik' },
  { ruta: 'unidades/u10/zait.mp3', texto: 'zait', nota: NOTA_Z },
  { ruta: 'unidades/u10/zaizu.mp3', texto: 'zaizu', nota: NOTA_Z },
  { ruta: 'unidades/u10/zaio.mp3', texto: 'zaio', nota: NOTA_Z },
  { ruta: 'unidades/u10/zaie.mp3', texto: 'zaie', nota: NOTA_Z },
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
      input: { prompt: BASE_PROMPT + (nota || ''), text: texto },
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
      await writeFile('/tmp/audio-trim-work/lote-parejas/' + nombre, audio, 'base64');
      console.log(i + '/' + PALABRAS.length + ' ok: ' + p.ruta);
    } catch (err) {
      console.error(i + '/' + PALABRAS.length + ' FALLO: ' + p.ruta, err.message);
    }
    await esperar(1500);
  }
  console.log('TERMINADO');
}

main();
