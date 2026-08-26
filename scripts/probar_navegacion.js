// ¿A qué tema manda el botón «Seguir» al acabar cada tema? Se extraen las
// funciones reales de app.js y se corren contra el curso de verdad.
const fs = require('fs');
const src = fs.readFileSync(process.env.HOME + '/Proyectos/euskaraz/js/app.js', 'utf8');

function sacar(nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  if (i < 0) throw new Error('no está ' + nombre);
  let prof = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') prof++;
    else if (src[k] === '}' && --prof === 0) return src.slice(i, k + 1);
  }
  throw new Error('llaves sin cerrar en ' + nombre);
}

const f = new Function(`
  var incluirDialectales = false;
  ${['tieneSubniveles','delSubnivel','gramaticaVisible','contenidoSub','temaSiguiente'].map(sacar).join('\n')}
  return { temaSiguiente, contenidoSub, gramaticaVisible, delSubnivel };
`)();

const raiz = process.env.HOME + '/Proyectos/euskaraz/data/';
const idx = JSON.parse(fs.readFileSync(raiz + 'curso-v2.json', 'utf8'));
const unidades = idx.unidades.map(r => JSON.parse(fs.readFileSync(raiz + r, 'utf8')));

let mal = 0, filas = 0;
for (const u of unidades) {
  const subs = u.subniveles || [];
  for (let i = 0; i < subs.length; i++) {
    const sig = f.temaSiguiente(u, subs[i].id);
    const esperado = i < subs.length - 1 ? subs[i + 1].id : null;
    const bien = (sig ? sig.id : null) === esperado;
    if (!bien) { mal++; console.log('✗', `u${u.numero} ${subs[i].id} → ${sig ? sig.id : 'null'} (esperaba ${esperado})`); }
    filas++;
  }
  // el test de la unidad no debe ofrecer «seguir»
  if (f.temaSiguiente(u, 'test') !== null) { mal++; console.log('✗', `u${u.numero} test ofrece seguir`); }
}
console.log(`\nCadena de temas comprobada en ${filas} temas de ${unidades.length} unidades.`);

// Qué botones salen en cada caso
const u = unidades[2];                       // unidad 3
const casos = [
  ['3.1', 'tema con siguiente'],
  [u.subniveles[u.subniveles.length - 1].id, 'último tema'],
  ['test', 'test de la unidad'],
];
console.log('\nBotones de la pantalla final:');
for (const [sub, nota] of casos) {
  const sig = f.temaSiguiente(u, sub);
  const esTema = sub && sub !== 'test';
  const botones = !esTema
    ? ['Repetir la unidad', 'Repasar la gramática', 'Volver al inicio']
    : (sig ? ['Seguir: ' + sig.titulo, 'Volver a la unidad', 'Repetir este tema']
           : ['Volver a la unidad', 'Repetir este tema']);
  console.log(`  ${String(sub).padEnd(5)} ${nota.padEnd(22)} → ${botones.join('  ·  ')}`);
}

// El «seguir» debe llevar a la gramática solo si el tema la tiene
console.log('\n¿Cada tema tiene gramática que abrir?');
for (const un of unidades) {
  for (const s of un.subniveles || []) {
    const g = f.gramaticaVisible(f.delSubnivel(un.gramatica, s.id)).length;
    if (!g) console.log(`  · u${un.numero} ${s.id} «${s.titulo}» no tiene: se abrirá la portada del tema`);
  }
}
process.exit(mal ? 1 : 0);
