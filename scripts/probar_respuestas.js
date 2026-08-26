// Las interrogativas cuya traducción son dos preguntas seguidas deben
// aceptar cada una por separado, no exigir las dos pegadas.
const fs = require('fs');
const src = fs.readFileSync(process.env.HOME + '/Proyectos/euskaraz/js/app.js', 'utf8');
function sacar(n) {
  const i = src.indexOf('function ' + n + '(');
  if (i < 0) throw new Error('no está ' + n);
  let p = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') p++; else if (src[k] === '}' && --p === 0) return src.slice(i, k + 1);
  }
}
// Las tablas de módulo se sacan del propio app.js, para que la prueba use
// exactamente las mismas que la app y no una copia que se quede vieja.
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
const f = new Function(`
  var ARTICULO_ES = /^(el|la|los|las|un|una|unos|unas)\\s+/;
  ${['TILDES','CIFRAS','LETRAS'].map(sacarVar).join('\n')}
  ${['esc','normalizar','expandirBarra','combinar','variantesRespuesta','todasLasVariantes',
     'claveRespuesta','aciertaTecleado'].map(sacar).join('\n')}
  return { aciertaTecleado, normalizar };
`)();
const ok = (t, rs) => f.aciertaTecleado(f.normalizar(t), rs);

const casos = [
  // zenbat? — EL CASO DE RIC
  ['cuánto',   ['¿cuánto? ¿cuántos?'], true,  'EL CASO DE RIC: una de las dos'],
  ['cuántos',  ['¿cuánto? ¿cuántos?'], true,  'la otra'],
  ['¿cuánto?', ['¿cuánto? ¿cuántos?'], true,  'con signos'],
  ['cuanto',   ['¿cuánto? ¿cuántos?'], true,  'sin tilde'],
  ['cuándo',   ['¿cuánto? ¿cuántos?'], false, 'RECHAZA una interrogativa distinta'],
  // nondik? y zein?
  ['de dónde', ['¿de dónde? ¿por dónde?'], true, 'nondik, primera'],
  ['por dónde',['¿de dónde? ¿por dónde?'], true, 'nondik, segunda'],
  ['cuál',     ['¿cuál? ¿qué (de varios)?'], true, 'zein, primera'],
  ['qué',      ['¿cuál? ¿qué (de varios)?'], true, 'zein, segunda sin el paréntesis'],
  // zergatik? — «porqué» NO se acepta a propósito: como las tildes se
  // aplanan, aceptarla aceptaría también «porque», que en el curso es
  // otra palabra (-lako, el sufijo causal). La distinción es real.
  ['por qué',  ['¿por qué?'], true,  'la forma correcta'],
  ['porque',   ['¿por qué?'], false, 'RECHAZA «porque»: es de -lako'],
  ['porqué',   ['¿por qué?'], false, 'y por tanto «porqué» tampoco'],
  // Números: la cifra vale tanto como la palabra (pedido por Ric)
  ['8',         ['ocho'],       true,  'EL CASO DE RIC: la cifra por la palabra'],
  ['ocho',      ['ocho'],       true,  'y la palabra sigue valiendo'],
  ['16',        ['dieciséis'],  true,  'con tilde en la palabra'],
  ['dieciseis', ['dieciséis'],  true,  'y sin tilde'],
  ['1',         ['uno'],        true,  'uno'],
  ['20',        ['veinte'],     true,  'veinte'],
  ['100',       ['cien'],       true,  'cien'],
  ['1000',      ['mil'],        true,  'mil'],
  ['9',         ['ocho'],       false, 'RECHAZA el número equivocado'],
  ['ochenta',   ['ocho'],       false, 'RECHAZA una palabra parecida'],
  ['8',         ['ochenta'],    false, 'y al revés'],
  // fuera de un número suelto no se toca nada
  ['hace 2 años', ['hace dos años'], false, 'dentro de una frase NO se convierte, a propósito'],
];
let mal = 0;
for (const [t, rs, esperado, nota] of casos) {
  const got = ok(t, rs);
  if (got !== esperado) mal++;
  console.log(got === esperado ? '✓' : '✗ ✗ ✗',
    JSON.stringify(t).padEnd(12), String(got).padEnd(6), nota);
}
console.log(mal ? `\n${mal} FALLOS` : '\nTodo correcto.');
process.exit(mal ? 1 : 0);
