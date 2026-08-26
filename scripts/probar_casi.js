// ¿El «casi correcto» enseña ahora la forma buena? Se extraen las funciones
// que hacen falta por nombre, contando llaves, y se les pone un typebox
// de mentira.
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

const nombres = ['esc','normalizar','variantesRespuesta','todasLasVariantes','claveRespuesta',
                 'aciertaTecleado','notaDeGenero','distanciaAlineada','respuestaMasCercana',
                 'esCasiCorrecto','alinear','pintarTrozos','comparacion','combinar',
                 'expandirBarra','corregirTeclear'];
const cuerpo = nombres.map(sacar).join('\n\n');
// Las tablas de módulo salen del propio app.js, para que la prueba use las
// mismas que la app y no una copia que se quede vieja.
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
const previo = `
  var ARTICULO_ES = /^(el|la|los|las|un|una|unos|unas)\s+/;
  ${['TILDES','CIFRAS','LETRAS'].map(sacarVar).join('\n')}
  var typebox = { value: '', blur: function () {} };
  function $(){ return typebox; }
`;
const f = new Function(previo + cuerpo +
  '; return { corregirTeclear, typebox };')();

const palabra = { respuestas: ['eskerrik asko'], solucion: 'eskerrik asko', explicacion: '' };
// Acertando exacto NO hace falta enseñar la respuesta: acabas de escribirla.
// La exigencia de Ric es sobre el «casi» y el fallo.
const casos = [
  ['eskerrik asko',  false, 'exacto: no hace falta enseñarla'],
  ['eskerrik askos', true,  'CASI: una letra de más'],
  ['eskerik asko',   true,  'CASI: una letra de menos'],
  ['eskerrik askoa', true,  'CASI: una letra cambiada'],
  ['agur',           true,  'mal del todo'],
];
let mal = 0;
for (const [texto, debe, nota] of casos) {
  f.typebox.value = texto;
  const r = f.corregirTeclear(palabra);
  const plano = r.cuerpo.replace(/<[^>]*>/g, '');
  const enseña = plano.replace(/\s+/g,'').includes('eskerrikasko');
  if (enseña !== debe) mal++;
  console.log(enseña === debe ? '✓' : '✗ ✗ ✗',
    JSON.stringify(texto).padEnd(17),
    ('ok=' + r.ok + ' leve=' + r.leve).padEnd(21),
    (enseña ? 'enseña la buena' : 'no la enseña').padEnd(17), nota);
}
console.log(mal ? `\n${mal} FALLOS` : '\nTodo correcto: el «casi» y el fallo enseñan la forma buena.');
process.exit(mal ? 1 : 0);
