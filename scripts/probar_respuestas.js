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
const f = new Function(`
  var ARTICULO_ES = /^(el|la|los|las|un|una|unos|unas)\\s+/;
  var TILDES = { 'á':'a','à':'a','ä':'a','â':'a','é':'e','è':'e','ë':'e','ê':'e',
                 'í':'i','ì':'i','ï':'i','î':'i','ó':'o','ò':'o','ö':'o','ô':'o',
                 'ú':'u','ù':'u','ü':'u','û':'u' };
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
