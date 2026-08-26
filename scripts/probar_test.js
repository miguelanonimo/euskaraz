// El test de unidad debe llegar a 12 preguntas (mínimo aceptable 10) y
// repartirlas entre todos los temas, no cargarlas en los primeros.
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
function sacarVar(n) {
  const i = src.indexOf('var ' + n + ' =');
  return src.slice(i, src.indexOf(';', i) + 1);
}
const f = new Function(`
  ${['ESCUCHAR_PRACTICA','LARGO_TEST'].map(sacarVar).join('\n')}
  function barajar(a){ return a.slice().sort(function(){ return Math.random()-0.5; }); }
  ${['tieneSubniveles','delSubnivel','relleno'].map(sacar).join('\n')}
  return { relleno, LARGO_TEST, ESCUCHAR_PRACTICA };
`)();

const raiz = require('path').join(__dirname, '..', 'data') + '/';
const idx = JSON.parse(fs.readFileSync(raiz + 'curso-v2.json', 'utf8'));
const unidades = idx.unidades.map(r => JSON.parse(fs.readFileSync(raiz + r, 'utf8')));

let mal = 0;
console.log('unidad                      test  +relleno  +escuchar = total   temas cubiertos');
for (const u of unidades) {
  const base = u.ejercicios.filter(g => g.subnivel === 'test');
  const extra = f.relleno(u, base, f.LARGO_TEST - f.ESCUCHAR_PRACTICA - base.length);
  const total = base.length + extra.length + f.ESCUCHAR_PRACTICA;
  const temas = new Set(extra.map(g => g.subnivel));
  const todos = (u.subniveles || []).length;
  const ok = total >= 10;
  if (!ok) mal++;
  // ningún tema debe llevarse más de dos si otros no llevan ninguno
  const cuenta = {};
  extra.forEach(g => cuenta[g.subnivel] = (cuenta[g.subnivel]||0)+1);
  const max = Math.max(0, ...Object.values(cuenta));
  const repartoJusto = temas.size >= Math.min(todos, extra.length);
  if (!repartoJusto) mal++;
  console.log(
    (ok && repartoJusto ? '✓' : '✗') +
    ' u' + String(u.numero).padEnd(3) +
    u.titulo.slice(0, 20).padEnd(21) +
    String(base.length).padStart(4) + ' test' +
    ' +' + String(extra.length).padStart(2) + ' de temas' +
    ' +' + f.ESCUCHAR_PRACTICA + ' escuchar' +
    ' = ' + String(total).padStart(2) + ' preguntas' +
    '   ' + temas.size + '/' + todos + ' temas' +
    (repartoJusto ? '' : '  ⚠ desigual (máx ' + max + ')'));
}
// En la unidad 4 solo hacen falta 3 de relleno: en varias tiradas deberían
// ir saliendo temas distintos, no siempre los tres primeros.
const u4 = unidades.find(u => u.numero === 4);
const base4 = u4.ejercicios.filter(g => g.subnivel === 'test');
const vistos = new Set();
for (let i = 0; i < 60; i++)
  f.relleno(u4, base4, f.LARGO_TEST - f.ESCUCHAR_PRACTICA - base4.length)
    .forEach(g => vistos.add(g.subnivel));
const conEjercicios = (u4.subniveles||[]).filter(s =>
  u4.ejercicios.some(g => g.subnivel === s.id)).length;
const bien = vistos.size >= conEjercicios;
if (!bien) mal++;
console.log('\n%s u4 en 60 tiradas toca %d de sus %d temas%s',
  bien ? '✓' : '✗', vistos.size, conEjercicios,
  bien ? '' : ' — hay temas que no salen nunca');

console.log(mal ? `\n${mal} FALLOS` : '\nTodas llegan al mínimo y reparten entre temas.');
process.exit(mal ? 1 : 0);
