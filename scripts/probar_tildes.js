// Banco de pruebas del emparejado de respuestas tras hacer las tildes y los
// espacios de la barra cosméticos. Incluye los casos viejos, para asegurar
// que no se rompe nada de lo que ya funcionaba.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'js/app.js'), 'utf8');
const ini = src.indexOf('  function normalizar(s) {');
const nd  = src.indexOf('  function notaDeGenero(respuestas) {');
const fin = src.indexOf('\n  }', src.indexOf('return hay ?', nd)) + 4;
const f = new Function(src.slice(ini, fin) +
  '; return { aciertaTecleado, normalizar };')();

const acepta = (t, rs) => f.aciertaTecleado(f.normalizar(t), rs);

const casos = [
  // EL CASO DE RIC
  ['el/ella',        ['él / ella'], true,  'EL CASO DE RIC: sin tilde y sin espacios'],
  ['él / ella',      ['él / ella'], true,  'la forma exacta sigue valiendo'],
  ['el / ella',      ['él / ella'], true,  'solo la tilde'],
  ['él/ella',        ['él / ella'], true,  'solo los espacios'],
  ['El/Ella',        ['él / ella'], true,  'mayúsculas'],
  ['él',             ['él / ella'], true,  'una sola de las dos'],
  ['ella',           ['él / ella'], true,  'la otra'],
  ['el',             ['él / ella'], true,  'una sola, sin tilde'],
  ['ellos',          ['él / ella'], false, 'RECHAZA lo que no es'],
  ['el/ellos',       ['él / ella'], false, 'RECHAZA media buena media mala'],

  // Tildes en general
  ['adios',          ['adiós'],     true,  'adios sin tilde'],
  ['mañana',         ['mañana'],    true,  'la ñ intacta'],
  ['manana',         ['mañana'],    false, 'la ñ NO es una n con adorno'],
  ['tu',             ['tú'],        true,  'tu/tú'],
  ['que tal',        ['qué tal'],   true,  'qué tal'],

  // Lo de la sesión anterior, que no se rompa
  ['gracias',        ['muchas gracias','gracias'], true, 'esAlt de eskerrik asko'],
  ['muchas gracias', ['muchas gracias','gracias'], true, 'la forma larga'],
  ['adiós',          ['muchas gracias','gracias'], false, 'RECHAZA otra palabra'],
  ['el amigo',       ['el amigo'],  true,  'con artículo'],
  ['amigo',          ['el amigo'],  true,  'sin artículo'],
];

let mal = 0;
for (const [t, rs, esperado, nota] of casos) {
  const got = acepta(t, rs);
  if (got !== esperado) mal++;
  console.log(got === esperado ? '✓' : '✗ ✗ ✗',
    JSON.stringify(t).padEnd(18), '→', String(got).padEnd(6), nota);
}
console.log(mal ? `\n${mal} FALLOS` : '\nTodo correcto.');
process.exit(mal ? 1 : 0);
