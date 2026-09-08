// Construye revision-audio/bloqueN.html a partir de lo que falta de audio
// en una o varias unidades de data/unidades-v2/, usando los mp3 ya
// generados en out/. Reutiliza el esqueleto de bloque1.html (todo salvo
// UNIDADES y AUDIOS, que son los dos bloques que cambian por revisión).
//
// Uso: node construir-revision.mjs <numeroBloque> <unidadId...>
//   node construir-revision.mjs 2 u5
//   node construir-revision.mjs 3 u6 u7

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');

function claveArchivo(eu) {
  return String(eu || '')
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*\/\s*/g, ' o ')
    .replace(/[·—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

async function buscarPorId(unidadId) {
  const dir = path.join(RAIZ, 'data', 'unidades-v2');
  for (const f of await readdir(dir)) {
    const contenido = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
    if (contenido.id === unidadId) return contenido;
  }
  throw new Error(`No encuentro la unidad "${unidadId}"`);
}

async function main() {
  const [numeroBloque, ...unidadIds] = process.argv.slice(2);
  if (!numeroBloque || !unidadIds.length) {
    console.error('Uso: node construir-revision.mjs <numeroBloque> <unidadId...>');
    process.exit(1);
  }

  const UNIDADES = [];
  const AUDIOS = {};
  let totalEsperado = 0;
  let totalEncontrado = 0;

  for (const uid of unidadIds) {
    const unidad = await buscarPorId(uid);
    const items = [];

    (unidad.vocabulario || []).forEach((v) => {
      if (!v.audio) items.push([claveArchivo(v.eu), v.es || '', v.eu]);
    });
    (unidad.gramatica || []).forEach((g) => {
      (g.ejemplos || []).forEach((e) => {
        if (e.eu && !e.audio) items.push([claveArchivo(e.eu), e.es || '', e.eu]);
      });
    });

    // Quita duplicados (misma clave, p. ej. la misma palabra en vocabulario y en un ejemplo).
    const vistas = new Set();
    const itemsUnicos = items.filter(([clave]) => {
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    });

    const outDir = path.join(AQUI, 'out', uid);
    for (const [clave, es] of itemsUnicos) {
      totalEsperado++;
      try {
        const buf = await readFile(path.join(outDir, clave + '.mp3'));
        AUDIOS[uid + '/' + clave] = buf.toString('base64');
        totalEncontrado++;
      } catch {
        console.error(`  FALTA mp3: ${uid}/${clave}.mp3 — corre generar.mjs ${uid} primero`);
      }
    }

    UNIDADES.push({
      id: uid,
      titulo: `Unidad ${uid.replace(/^u/, '')} · ${unidad.titulo || ''}`.trim(),
      items: itemsUnicos.map(([clave, es]) => [clave, es]),
    });
  }

  console.log(`Bloque ${numeroBloque}: ${totalEncontrado}/${totalEsperado} palabras con mp3 encontrado.`);
  if (totalEncontrado < totalEsperado) {
    console.log('Sigo, pero al que le falte el audio no se podrá escuchar en la página.');
  }

  const antes = await readFile(path.join(AQUI, '..', '..', 'revision-audio', '_plantilla-antes.html'), 'utf8');
  const despues = await readFile(path.join(AQUI, '..', '..', 'revision-audio', '_plantilla-despues.html'), 'utf8');

  const totalPalabras = UNIDADES.reduce((n, u) => n + u.items.length, 0);
  const unidadesTxt = unidadIds.map((u) => 'u' + u.replace(/^u/, '')).join(', ');

  let antesAjustado = antes
    .replace(/Revisión — bloque 1/, `Revisión — bloque ${numeroBloque}`)
    .replace(
      /51 palabras y frases nuevas \(unidades 1–4\), generadas hoy y subidas a[\s\S]*?elegir la mejor\./,
      `${totalPalabras} palabras y frases nuevas (unidades ${unidadesTxt}). Marca cada una como bien o mal; si está mal, deja una nota de qué falla — luego usa "Copiar informe" para pasarle el resultado a Miguel.`
    )
    .replace(/euskaraz-revision-bloque1/g, `euskaraz-revision-bloque${numeroBloque}`);

  const bloqueJs = 'const UNIDADES = ' + JSON.stringify(UNIDADES, null, 2) + ';\n\nconst AUDIOS = ' + JSON.stringify(AUDIOS) + ';\n\n';

  const salida = antesAjustado + bloqueJs + despues;
  const destino = path.join(AQUI, '..', '..', 'revision-audio', `bloque${numeroBloque}.html`);
  await writeFile(destino, salida);
  console.log(`Escrito ${path.relative(RAIZ, destino)} (${(salida.length / 1024).toFixed(0)} KB)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
