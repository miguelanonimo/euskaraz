// La bolsa del repaso de vocabulario es aditiva: solo entran las palabras
// de los temas que has abierto, y no se caen las de unidades anteriores.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'js/app.js'), 'utf8');
function sacar(n) {
  const i = src.indexOf('function ' + n + '(');
  if (i < 0) throw new Error('no está ' + n);
  let p = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') p++; else if (src[k] === '}' && --p === 0) return src.slice(i, k + 1);
  }
}
const raiz = require('path').join(__dirname, '..', 'data') + '/';
const idx = JSON.parse(fs.readFileSync(raiz + 'curso-v2.json', 'utf8'));
const unidades = idx.unidades.map(r => JSON.parse(fs.readFileSync(raiz + r, 'utf8')));

function conProgreso(progreso) {
  return new Function(`
    var CURSO = ${JSON.stringify({ unidades })};
    var progreso = ${JSON.stringify(progreso)};
    function progUnidad(id){ return progreso[id] || (progreso[id] = {}); }
    function normalizar(s){ return String(s||'').toLowerCase().trim(); }
    function formasDe(v, num, tit){ return [{ eu: v.eu, es: v.es, unidad: num, titulo: tit }]; }
    ${['tieneSubniveles','temaDesbloqueado','fondoVocabulario'].map(sacar).join('\n')}
    return fondoVocabulario();
  `)();
}
const u = id => unidades.find(x => x.id === id);
const palabrasDe = (id, sub) => u(id).vocabulario.filter(v => v.subnivel === sub).length;

let mal = 0;
function probar(nota, progreso, esperado) {
  const got = conProgreso(progreso).length;
  const bien = got === esperado;
  if (!bien) mal++;
  console.log(bien ? '✓' : '✗ ✗ ✗', String(got).padStart(4), 'palabras (esperaba ' + esperado + ')  ', nota);
}

const u1 = unidades[0].id, u4 = unidades[3].id;
probar('empezando de cero: la bolsa está vacía', {}, 0);

probar('abierto solo el tema 1.1',
  { [u1]: { subs: { '1.1': { desbloqueado: true } } } },
  palabrasDe(u1, '1.1'));

probar('1.1 y 1.2: se suman',
  { [u1]: { subs: { '1.1': { desbloqueado: true }, '1.2': { desbloqueado: true } } } },
  palabrasDe(u1, '1.1') + palabrasDe(u1, '1.2'));

probar('un tema de la 1 y otro de la 4: NO se pierde el de atrás',
  { [u1]: { subs: { '1.1': { desbloqueado: true } } },
    [u4]: { subs: { '4.1': { desbloqueado: true } } } },
  palabrasDe(u1, '1.1') + palabrasDe(u4, '4.1'));

probar('visitar la portada del tema NO desbloquea',
  { [u1]: { subs: { '1.1': { visitado: true, desbloqueado: false } } } }, 0);

probar('progreso viejo (marca de unidad, sin temas): la unidad entera',
  { [u1]: { vocab: true } }, unidades[0].vocabulario.length);

probar('progreso viejo PERO ya con un tema abierto: manda el tema',
  { [u1]: { vocab: true, subs: { '1.1': { desbloqueado: true } } } },
  palabrasDe(u1, '1.1'));

const todos = {};
unidades.forEach(x => { todos[x.id] = { subs: {} };
  (x.subniveles||[]).forEach(s => todos[x.id].subs[s.id] = { desbloqueado: true }); });
// `bihar` y `nahi dut` están en dos unidades cada una; la bolsa deduplica
// por palabra, así que salen una vez.
const vistas = new Set();
let unicas = 0;
unidades.forEach(x => x.vocabulario.forEach(v => {
  const k = v.eu.toLowerCase();
  if (!vistas.has(k)) { vistas.add(k); unicas++; }
}));
probar('todos los temas abiertos: el curso entero, sin repetir palabra',
  todos, unicas);

console.log(mal ? `\n${mal} FALLOS` : '\nTodo correcto.');
process.exit(mal ? 1 : 0);
