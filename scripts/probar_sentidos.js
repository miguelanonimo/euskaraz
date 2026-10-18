// Dos opciones no pueden significar lo mismo.
//
// Ric oyó «hura / bera», eligió «él / ella» y la app le dijo que no: la
// buena era «él, ella». Las dos son la misma respuesta, escritas distinto.
//
// El detector de choques agrupaba por `normalizar`, que quita las comas
// pero conserva la barra — así que «él / ella» caía en una caja y
// «él ella» en otra, y las dos podían salir en la misma pregunta. Ahora
// hay además `claveSentido`, que aplana los separadores y ordena las
// palabras. Esta prueba comprueba las dos mitades: que la clave une lo que
// significa lo mismo, y que no une lo que no.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');

function sacar(n) {
  const i = src.indexOf('function ' + n + '(');
  if (i < 0) throw new Error('no está ' + n);
  let p = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') p++; else if (src[k] === '}' && --p === 0) return src.slice(i, k + 1);
  }
  throw new Error('llaves sin cerrar en ' + n);
}

eval(src.match(/var NOTA_TRAS_GUION = [^;]+;/)[0]);
eval(sacar('normalizar'));
eval(sacar('sinNota'));
eval(sacar('claveSentido'));

let fallos = 0;

// ── 1 · lo que tiene que quedar unido ──────────────────────────────────
const IGUALES = [
  ['él / ella', 'él, ella'],                                  // el caso de Ric
  ['él / ella', 'él / ella — el euskera no distingue género'],
  ['ellos / ellas', 'ellos, ellas'],
  ['la comida (del mediodía)', 'la comida (en general)'],
];
for (const [a, b] of IGUALES) {
  if (claveSentido(a) !== claveSentido(b)) {
    fallos++;
    console.error('  ✗ «' + a + '» y «' + b + '» deberían contar como el mismo significado');
  }
}

// ── 2 · lo que NO puede unirse ─────────────────────────────────────────
// Una regla por inclusión —«por favor» dentro de «Perdone, por favor»—
// parecía buena idea y se probó: unía 213 parejas, casi todas distractores
// legítimos. Por eso la clave compara conjuntos iguales, no subconjuntos.
const DISTINTOS = [
  ['por favor', 'Perdone, por favor.'],
  ['él / ella', 'vosotros / vosotras'],
  ['muy bien', 'bien'],
  ['¿qué tal?', '¿Qué tal? — Muy bien, ¿y tú?'],
];
for (const [a, b] of DISTINTOS) {
  if (claveSentido(a) === claveSentido(b)) {
    fallos++;
    console.error('  ✗ «' + a + '» y «' + b + '» NO son el mismo significado, y la clave los une');
  }
}

// ── 3 · el curso entero: qué entradas comparten significado ────────────
// No es un fallo que lo compartan —«hura» y «bera» significan lo mismo de
// verdad—; lo que importa es que la app lo sepa. Se listan para poder
// mirarlas, y se exige que la familia de «él/ella» esté completa, que es
// donde se vio el problema.
const curso = JSON.parse(fs.readFileSync(path.join(raiz, 'data/curso-v2.json'), 'utf8'));
const pool = [];
for (const rel of curso.unidades) {
  const u = JSON.parse(fs.readFileSync(path.join(raiz, 'data', rel), 'utf8'));
  for (const w of (u.vocabulario || [])) if (w.audio) pool.push([w.eu, w.es]);
  for (const g of (u.gramatica || [])) {
    for (const e of (g.ejemplos || [])) if (e.audio) pool.push([e.eu, e.es]);
  }
}
const porClave = {};
for (const [eu, es] of pool) {
  const k = claveSentido(es);
  if (!k) continue;
  (porClave[k] = porClave[k] || []).push(eu);
}

const familia = porClave[claveSentido('él / ella')] || [];
const distintas = new Set(familia.map(e => normalizar(e)));
if (distintas.size < 3) {
  fallos++;
  console.error('  ✗ la familia de «él / ella» debería agrupar al menos hura, bera y «hura / bera»; ' +
                'agrupa ' + distintas.size + ': ' + familia.join(', '));
}

const compartidos = Object.keys(porClave)
  .filter(k => new Set(porClave[k].map(e => normalizar(e))).size > 1).length;

if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('sentidos OK (' + pool.length + ' entradas con audio, ' +
            compartidos + ' significados compartidos por más de una palabra)');
