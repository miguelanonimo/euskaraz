// El calendario de repaso: que el atasco se reparta, que la sesión mezcle lo
// fallado con lo veterano, que las novedades tengan cupo y que la portada no
// enseñe la deuda entera. Se sacan las funciones de app.js por nombre y se
// les pone alrededor un progreso de mentira.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'js/app.js'), 'utf8');

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
function sacarLinea(nombre) {
  const re = new RegExp('^\\s*var ' + nombre + ' = .*?;', 'm');
  const m = src.match(re);
  if (!m) throw new Error('no está la variable ' + nombre);
  return m[0];
}

const fns = ['hoy', 'ficha', 'estrenosHoy', 'apuntarEstreno', 'anotar',
             'elegirSesion', 'repartirAtrasos', 'recuento', 'frasePendientes'];
const previo = `
  ${['PASOS', 'CUPO_NUEVOS', 'TOPE_DIA', 'MEZCLA', 'REPARTIR_DESDE'].map(sacarLinea).join('\n')}
  var progreso = { srs: {}, estreno: null, repartido: 0 };
  var guardados = 0;
  function guardarProgreso(){ guardados++; }
  function barajar(a){ return a; }   // sin azar, para poder afirmar cosas
`;
const api = new Function(previo + fns.map(sacar).join('\n\n') +
  '; return { hoy, anotar, elegirSesion, repartirAtrasos, recuento, frasePendientes,' +
  '           estrenosHoy, progreso, PASOS, TOPE_DIA, CUPO_NUEVOS, REPARTIR_DESDE,' +
  '           reset: function(){ progreso.srs={}; progreso.estreno=null; progreso.repartido=0; } };')();

let fallos = 0;
function comprobar(que, cond, detalle) {
  if (cond) return;
  fallos++;
  console.error('  ✗ ' + que + (detalle ? '\n      ' + detalle : ''));
}

// ── La escala ────────────────────────────────────────────────────────────
comprobar('la escala sube siempre',
  api.PASOS.every((p, i) => i === 0 || p > api.PASOS[i - 1]), api.PASOS.join(','));
comprobar('la primera repetición sigue siendo al día siguiente', api.PASOS[0] === 1);

// ── El reparto del atasco ────────────────────────────────────────────────
const hoyEs = api.hoy();
api.reset();
for (let i = 0; i < 200; i++) api.progreso.srs['g:x' + i] = { paso: 2, toca: hoyEs - (i % 7), fallos: 0 };
const movidas = api.repartirAtrasos();
comprobar('reparte las 200 atrasadas', movidas === 200, 'movió ' + movidas);
const porDia = {};
Object.keys(api.progreso.srs).forEach(k => {
  const d = api.progreso.srs[k].toca;
  porDia[d] = (porDia[d] || 0) + 1;
});
const dias = Object.keys(porDia).map(Number).sort((a, b) => a - b);
comprobar('ningún día pasa del tope',
  dias.every(d => porDia[d] <= api.TOPE_DIA), JSON.stringify(porDia));
comprobar('el primer día es hoy, no mañana', dias[0] === hoyEs);
comprobar('nada queda atrasado después del reparto',
  dias.every(d => d >= hoyEs));
comprobar('llamarlo otra vez ya no mueve nada', api.repartirAtrasos() === 0);

// Con poco atraso no toca nada: 40 vencidas (bajo el tope) siguen igual.
api.reset();
for (let i = 0; i < 40; i++) api.progreso.srs['g:y' + i] = { paso: 1, toca: hoyEs - 3, fallos: 0 };
comprobar('por debajo del tope no mueve nada', api.repartirAtrasos() === 0);
comprobar('y las deja donde estaban',
  Object.keys(api.progreso.srs).every(k => api.progreso.srs[k].toca === hoyEs - 3));

// Volver de dos semanas fuera: se vuelve a repartir, no es cosa de una vez.
api.reset();
api.progreso.repartido = hoyEs - 14;
for (let i = 0; i < 300; i++) api.progreso.srs['g:w' + i] = { paso: 3, toca: hoyEs - 14, fallos: 0 };
comprobar('al volver de un parón vuelve a repartir', api.repartirAtrasos() === 300);

/* La que se le escapó a Ric: tenía 45 en repaso y 45 en vocabulario y no
   bajaban por mucho que jugara. Eran los dos topes tapando un atraso sin
   repartir, porque el reparto solo corría al arrancar y cualquier otra
   ruta que adoptara un progreso se lo saltaba. Ya no lleva candado de día,
   así que da igual quién lo llame ni cuántas veces: si hay atraso, reparte.
   La prueba fija las dos mitades — que repartir arregle el 45+45, y que
   llamarlo con el candado "puesto" no lo impida. */
api.reset();
const gr = [], pa = [];
for (let i = 0; i < 355; i++) { const k = 'g:x' + i; gr.push(k);
  api.progreso.srs[k] = { paso: 2, toca: hoyEs - (i % 3), fallos: 0 }; }
for (let i = 0; i < 526; i++) { const k = 'v:x' + i; pa.push(k);
  api.progreso.srs[k] = { paso: 2, toca: hoyEs - (i % 3), fallos: 0 }; }
api.progreso.repartido = hoyEs;          // como si ya hubiera corrido hoy
comprobar('el 45+45 de Ric: los dos topes tapan el atraso',
  api.recuento(gr, c => c).hoy === api.TOPE_DIA &&
  api.recuento(pa, c => c).hoy === api.TOPE_DIA);
api.repartirAtrasos();
const tras = api.recuento(gr, c => c).vencidos + api.recuento(pa, c => c).vencidos;
comprobar('y repartir lo deja en un día de trabajo, no en dos topes',
  tras <= api.TOPE_DIA, 'quedaron ' + tras + ' vencidos entre los dos');
// Y tres rondas de 15 lo dejan a cero, que es lo que Ric no conseguía.
for (let r = 0; r < 3; r++) {
  api.elegirSesion(gr, 15, c => c).forEach(k => api.anotar(k, true));
}
api.elegirSesion(pa, 15, c => c).forEach(k => api.anotar(k, true));
comprobar('tres rondas vacían el día',
  api.recuento(gr, c => c).vencidos + api.recuento(pa, c => c).vencidos === 0,
  'quedan ' + (api.recuento(gr, c => c).vencidos + api.recuento(pa, c => c).vencidos));

// ── La mezcla de la sesión ───────────────────────────────────────────────
// 100 flojas (falladas hace poco) y 10 veteranas que vencen justo hoy: con la
// urgencia a secas las veteranas no entrarían nunca, porque son las últimas.
api.reset();
const cand = [];
for (let i = 0; i < 100; i++) {
  const k = 'g:f' + i;
  api.progreso.srs[k] = { paso: 0, toca: hoyEs - 20, fallos: 3 };
  cand.push(k);
}
for (let i = 0; i < 10; i++) {
  const k = 'g:v' + i;
  api.progreso.srs[k] = { paso: 5, toca: hoyEs, fallos: 0 };
  cand.push(k);
}
const sesion = api.elegirSesion(cand, 15, c => c);
comprobar('la sesión sale llena', sesion.length === 15, 'salieron ' + sesion.length);
const veteranas = sesion.filter(k => k.startsWith('g:v')).length;
const flojas = sesion.filter(k => k.startsWith('g:f')).length;
comprobar('entran veteranas aunque haya 100 atrasadas delante',
  veteranas >= 5, 'veteranas: ' + veteranas);
comprobar('y siguen entrando las falladas', flojas >= 5, 'flojas: ' + flojas);

// Si no hay veteranas, su hueco lo ocupan las flojas: la sesión no se acorta.
api.reset();
const soloFlojas = [];
for (let i = 0; i < 40; i++) {
  const k = 'g:f' + i;
  api.progreso.srs[k] = { paso: 0, toca: hoyEs - 1, fallos: 1 };
  soloFlojas.push(k);
}
comprobar('sin veteranas la sesión no se queda corta',
  api.elegirSesion(soloFlojas, 15, c => c).length === 15);

// ── El cupo de novedades ─────────────────────────────────────────────────
api.reset();
const nuevas = [];
for (let i = 0; i < 200; i++) nuevas.push('v:p' + i);
comprobar('el cupo limita las novedades de una sesión',
  api.elegirSesion(nuevas, 100, c => c).length === api.CUPO_NUEVOS,
  'salieron ' + api.elegirSesion(nuevas, 100, c => c).length);
// Estrenar gasta cupo: tras 20 estrenos, la siguiente sesión no trae más.
api.reset();
for (let i = 0; i < api.CUPO_NUEVOS; i++) api.anotar('v:p' + i, true);
comprobar('lo estrenado hoy descuenta del cupo',
  api.elegirSesion(nuevas.slice(50), 100, c => c).length === 0);
comprobar('los estrenos se cuentan por tipo', api.estrenosHoy('v') === api.CUPO_NUEVOS
  && api.estrenosHoy('g') === 0);

// ── Lo que enseña la portada ─────────────────────────────────────────────
api.reset();
const muchas = [];
for (let i = 0; i < 300; i++) {
  const k = 'g:z' + i;
  api.progreso.srs[k] = { paso: 1, toca: hoyEs - 2, fallos: 0 };
  muchas.push(k);
}
api.repartirAtrasos();
const r = api.recuento(muchas, c => c);
comprobar('tras repartir, lo vencido cabe en un día', r.vencidos <= api.TOPE_DIA,
  'vencidos: ' + r.vencidos);
comprobar('y el número que se enseña es ese mismo, no un recorte',
  r.hoy === r.vencidos);
comprobar('pero lo que enseña va con tope', r.hoy === api.TOPE_DIA, 'enseña ' + r.hoy);
const frase = api.frasePendientes(r, 'ejercicio', 'ejercicios');
comprobar('la frase no canta la deuda entera', frase.indexOf('300') < 0, frase);
comprobar('la frase habla del día', /para hoy/.test(frase), frase);

// Y al hacer el día entero, la portada se queda a cero: no quedan restos.
Object.keys(api.progreso.srs).forEach(k => {
  if (api.progreso.srs[k].toca <= hoyEs) api.anotar(k, true);
});
comprobar('al terminar el día no queda nada vencido',
  api.recuento(muchas, c => c).vencidos === 0);

if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('calendario OK');
