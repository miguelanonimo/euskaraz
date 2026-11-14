// La gramática escrita: cuándo una pregunta de opción se pide sin opciones
// y cómo se juzga lo que se escribe. La parte que más importa se comprueba
// contra el curso entero: en TODAS las preguntas marcadas, escribir la buena
// acierta y escribir cualquiera de sus distractores falla.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');

function sacar(nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  if (i < 0) throw new Error('no está ' + nombre);
  let j = src.indexOf('{', i), prof = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') prof++;
    else if (src[k] === '}' && --prof === 0) return src.slice(i, k + 1);
  }
  throw new Error('llaves sin cerrar en ' + nombre);
}
function sacarVar(nombre) {
  const i = src.indexOf('var ' + nombre + ' =');
  if (i < 0) throw new Error('no está la variable ' + nombre);
  let prof = 0, dentro = false;
  for (let k = i; k < src.length; k++) {
    if (src[k] === '{' || src[k] === '(') { prof++; dentro = true; }
    else if (src[k] === '}' || src[k] === ')') prof--;
    if (dentro && prof === 0) return src.slice(i, src.indexOf(';', k) + 1);
    if (!dentro && src[k] === ';') return src.slice(i, k + 1);
  }
}
const fns = ['normalizar', 'expandirBarra', 'combinar', 'variantesRespuesta', 'todasLasVariantes',
             'claveRespuesta', 'aciertaTecleado', 'alinear', 'distanciaAlineada', 'respuestaMasCercana',
             'esCasiCorrecto', 'pideTeclear', 'juzgarTecleada'];
const api = new Function(`
  var ARTICULO_ES = /^(el|la|los|las|un|una|unos|unas)\\s+/;
  ${['TILDES', 'CIFRAS', 'LETRAS', 'PASO_TECLEAR'].map(sacarVar).join('\n')}
  ${fns.map(sacar).join('\n\n')}
  return { pideTeclear, juzgarTecleada, normalizar, PASO_TECLEAR };`)();

let fallos = 0;
function comprobar(que, cond, detalle) {
  if (cond) return;
  fallos++;
  if (fallos <= 25) console.error('  ✗ ' + que + (detalle ? '\n      ' + detalle : ''));
}

// ── Cuándo se pide escrita ──────────────────────────────────────────────
const marcada = { tipo: 'opcion', teclea: true }, sinMarca = { tipo: 'opcion' };
comprobar('el umbral es el peldaño 2', api.PASO_TECLEAR === 2);
comprobar('una ficha sin estrenar nunca se pide escrita', !api.pideTeclear(marcada, null));
comprobar('ni una recién vista (peldaño 1)', !api.pideTeclear(marcada, { paso: 1 }));
comprobar('ni una recién fallada (peldaño 0)', !api.pideTeclear(marcada, { paso: 0 }));
comprobar('asentada (peldaño 2), sí', api.pideTeclear(marcada, { paso: 2 }));
comprobar('y de ahí en adelante', api.pideTeclear(marcada, { paso: 6 }));
comprobar('sin la marca del contenido, nunca', !api.pideTeclear(sinMarca, { paso: 6 }));
comprobar('vetada a mano (teclea: false), nunca', !api.pideTeclear({ tipo: 'opcion', teclea: false }, { paso: 6 }));
comprobar('solo las de opción', !api.pideTeclear({ tipo: 'pares', teclea: true }, { paso: 6 }));

// ── Cómo se juzga ───────────────────────────────────────────────────────
const j = (dado, ops, c) => api.juzgarTecleada(api.normalizar(dado), ops, c);
let r = j('lanean', ['lanan', 'lanean', 'lana', 'lanera'], 1);
comprobar('la buena acierta', r.ok && !r.leve);
r = j('Lanean.', ['lanan', 'lanean', 'lana', 'lanera'], 1);
comprobar('mayúsculas y puntos no cuentan', r.ok && !r.leve);
r = j('lanan', ['lanan', 'lanean', 'lana', 'lanera'], 1);
comprobar('el error vigilado falla aunque esté a una letra', !r.ok && r.vigilado, JSON.stringify(r));
r = j('laneam', ['lanan', 'lanean', 'lana', 'lanera'], 1);
comprobar('una errata que no es un distractor pasa como casi correcto', r.ok && r.leve, JSON.stringify(r));
r = j('ditut', ['naiz', 'da', 'dut', 'ditut'], 2);
comprobar('«ditut» por «dut»: fallo', !r.ok);
r = j('dat', ['naiz', 'da', 'dut', 'ditut'], 2);
comprobar('en palabras de tres letras no hay casi', !r.ok && !r.leve, JSON.stringify(r));
r = j('etxea', ['zaude', 'zara', 'dago', 'gaude'], 0);
comprobar('otra cosa cualquiera: fallo', !r.ok);
r = j('nondik', ['nondik?', 'nora?', 'beti', 'nor?'], 0);
comprobar('el signo de interrogación no hace falta', r.ok && !r.leve);

// ── Contra el curso entero ──────────────────────────────────────────────
const indice = JSON.parse(fs.readFileSync(path.join(raiz, 'data/curso-v2.json'), 'utf8'));
let marcadas = 0, grupos = new Set();
indice.unidades.forEach(ruta => {
  const u = JSON.parse(fs.readFileSync(path.join(raiz, 'data', ruta), 'utf8'));
  u.ejercicios.forEach(g => (g.variantes || [g]).forEach((v, n) => {
    if (v.teclea === undefined) return;
    const id = g.id + ' v' + (n + 1);
    comprobar(id + ': «teclea» solo va en preguntas de opción', v.tipo === 'opcion');
    if (v.teclea !== true || v.tipo !== 'opcion') return;
    marcadas++; grupos.add(g.id);
    const buena = v.opciones[v.correcta];
    comprobar(id + ': la respuesta no pasa de tres palabras', buena.split(/\s+/).length <= 3, buena);
    comprobar(id + ': el enunciado es un hueco o un «se dice»',
      /_{2,}/.test(v.pregunta) || /¿c[oó]mo se dice|se dice(…|\.\.\.|:)?\s*$/i.test(v.pregunta), v.pregunta);
    const rb = j(buena, v.opciones, v.correcta);
    comprobar(id + ': escribir la buena acierta', rb.ok && !rb.leve, buena);
    v.opciones.forEach((o, i) => {
      if (i === v.correcta) return;
      const ro = j(o, v.opciones, v.correcta);
      comprobar(id + ': escribir el distractor «' + o + '» falla', !ro.ok, 'buena: ' + buena + ' · ' + JSON.stringify(ro));
    });
  }));
});
comprobar('hay preguntas marcadas (si no, falta correr scripts/marcar-tecleables.py)', marcadas > 300, 'marcadas: ' + marcadas);

if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('teclear: ' + marcadas + ' preguntas en ' + grupos.size + ' grupos, todas bien juzgadas');
