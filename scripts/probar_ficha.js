// El botón del libro abre la ficha del tema del ejercicio. Si el grupo
// practica algo que se explica en OTRO tema —«tener» con vocabulario del
// caserío, que fue lo que encontró Ric—, lleva `explica` y el libro va allí.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'js/app.js'), 'utf8');

function sacar(n) {
  const i = src.indexOf('function ' + n + '(');
  if (i < 0) throw new Error('no está ' + n);
  let p = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') p++; else if (src[k] === '}' && --p === 0) return src.slice(i, k + 1);
  }
  throw new Error('llaves sin cerrar en ' + n);
}

const CURSO_FALSO = { unidades: [
  { id: 'u4', numero: 4, titulo: 'Zenbat eta familia',
    subniveles: [{ id: '4.1', titulo: 'Los números' }, { id: '4.4', titulo: 'Tener' }],
    gramatica: [{ subnivel: '4.1', titulo: 'Del uno al diez' },
                { subnivel: '4.4', titulo: 'El verbo «ukan» (tener)' },
                { subnivel: '4.4', titulo: 'Cuando tienes varias cosas' }] },
  { id: 'u5', numero: 5, titulo: 'Etxea',
    subniveles: [{ id: '5.1', titulo: 'El sitio' }, { id: '5.5', titulo: 'El caserío' }],
    gramatica: [{ subnivel: '5.1', titulo: 'El verbo «egon»' },
                { subnivel: '5.5', titulo: '«Etxea» y «baserria»' }] },
]};

const api = new Function(`
  var CURSO = arguments[0];
  var estado = { unidad: arguments[1] };
  function gramaticaVisible(l){ return l || []; }
  function delSubnivel(lista, sub){ return (lista||[]).filter(function(x){ return x.subnivel===sub; }); }
  ${sacar('unidadDe')}
  ${sacar('temaDe')}
  ${sacar('fichasDe')}
  return { temaDe: temaDe, fichasDe: fichasDe };
`);

let fallos = 0;
function comprobar(que, cond, detalle) {
  if (cond) return;
  fallos++;
  console.error('  ✗ ' + que + (detalle ? '\n      ' + detalle : ''));
}
const titulos = l => l.map(x => x.titulo);

// ── Lo normal: la ficha del propio tema ──────────────────────────────────
let a = api(CURSO_FALSO, null);
let ej = { __sub: '5.5', __uid: 'u5' };
comprobar('abre la ficha de su propio tema',
  JSON.stringify(titulos(a.fichasDe(ej))) === JSON.stringify(['«Etxea» y «baserria»']),
  JSON.stringify(titulos(a.fichasDe(ej))));

// ── El caso de Ric: el grupo practica «tener» y vive en el caserío ───────
ej = { __sub: '5.5', __uid: 'u5', __explica: '4.4' };
comprobar('con `explica`, lleva a la ficha que toca — aunque sea de otra unidad',
  JSON.stringify(titulos(a.fichasDe(ej))) ===
  JSON.stringify(['El verbo «ukan» (tener)', 'Cuando tienes varias cosas']),
  JSON.stringify(titulos(a.fichasDe(ej))));
const d = a.temaDe(ej);
comprobar('y la cabecera dice la unidad y el tema de destino',
  d.unidad.numero === 4 && d.tema.titulo === 'Tener',
  JSON.stringify({ unidad: d.unidad.numero, tema: d.tema && d.tema.titulo }));

// ── Practicando una unidad el ejercicio no lleva la unidad encima ────────
a = api(CURSO_FALSO, CURSO_FALSO.unidades[1]);
comprobar('sin __uid, usa la unidad abierta',
  JSON.stringify(titulos(a.fichasDe({ __sub: '5.1' }))) === JSON.stringify(['El verbo «egon»']));

// ── Vocabulario: la unidad viene por número ──────────────────────────────
a = api(CURSO_FALSO, null);
comprobar('una palabra trae la unidad por número',
  JSON.stringify(titulos(a.fichasDe({ __sub: '4.1', __unum: 4 }))) === JSON.stringify(['Del uno al diez']));

// ── Sin tema, no hay botón ───────────────────────────────────────────────
comprobar('un ejercicio sin tema no ofrece ficha', a.fichasDe({ __uid: 'u5' }).length === 0);
comprobar('el test de unidad tampoco', a.fichasDe({ __sub: 'test', __uid: 'u5' }).length === 0);

// ── Y el curso de verdad: los `explica` apuntan a temas que existen ──────
const curso = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'data/curso-v2.json'), 'utf8'));
const base = require('path').join(__dirname, '..', 'data');
const temas = new Set();
const grupos = [];
for (const rel of curso.unidades) {
  const u = JSON.parse(fs.readFileSync(require('path').join(base, rel), 'utf8'));
  (u.subniveles || []).forEach(s => temas.add(s.id));
  u.ejercicios.forEach(g => { if (g.explica) grupos.push([g.id, g.explica]); });
}
grupos.forEach(([id, ex]) => comprobar('«' + id + '» apunta a un tema que existe (' + ex + ')', temas.has(ex)));
console.log('  (grupos con `explica`: ' + grupos.length + ')');

if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('ficha OK');
