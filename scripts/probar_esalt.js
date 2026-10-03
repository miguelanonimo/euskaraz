// `esAlt` son las otras traducciones castellanas que valen y que no se
// deducen del texto: «gracias» por «muchas gracias», «muchas veces» por
// «askotan». Todo el vocabulario del repaso y de escuchar pasa por
// formasDe(), que copia campo a campo — y durante un tiempo se dejó ese
// fuera, así que las respuestas buenas se daban por malas. Esta prueba
// recorre el curso de verdad y comprueba que llegan hasta la pregunta.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(raiz, 'js/app.js'), 'utf8');

function sacar(n) {
  const i = src.indexOf('function ' + n + '(');
  if (i < 0) throw new Error('no está ' + n);
  let p = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') p++; else if (src[k] === '}' && --p === 0) return src.slice(i, k + 1);
  }
  throw new Error('llaves sin cerrar en ' + n);
}

// formasDe mira una variable de módulo; se le da el valor por fuera.
const api = new Function(`
  var euskalkiActivo = 'bizkaiera';
  var modoSilencioso = false;
  function marcarVocab(q, entrada) { q.__clave = 'v:' + entrada.eu; return q; }
  ${sacar('formasDe')}
  ${sacar('preguntaEscucharTeclear')}
  return { formasDe, preguntaEscucharTeclear };
`)();

const curso = JSON.parse(fs.readFileSync(path.join(raiz, 'data/curso-v2.json'), 'utf8'));
let fallos = 0, comprobadas = 0;

for (const rel of curso.unidades) {
  const u = JSON.parse(fs.readFileSync(path.join(raiz, 'data', rel), 'utf8'));
  for (const v of (u.vocabulario || [])) {
    if (!v.esAlt || !v.esAlt.length) continue;
    comprobadas++;
    for (const forma of api.formasDe(v, u.numero, u.titulo)) {
      if (!forma.esAlt || forma.esAlt.length !== v.esAlt.length) {
        fallos++;
        console.error('  ✗ formasDe() pierde el esAlt de «' + v.eu + '»');
        continue;
      }
      if (!forma.audio) continue;   // sin audio no hay pregunta de escuchar
      const q = api.preguntaEscucharTeclear(forma);
      for (const alt of v.esAlt) {
        if (q.respuestas.indexOf(alt) < 0) {
          fallos++;
          console.error('  ✗ «' + v.eu + '» no acepta «' + alt + '» al escuchar y traducir');
        }
      }
    }
  }
}

// El caso concreto que dio pie a todo esto.
const u6 = JSON.parse(fs.readFileSync(path.join(raiz, 'data/unidades-v2/06-egutegia.json'), 'utf8'));
const askotan = (u6.vocabulario || []).filter(v => v.eu === 'askotan')[0];
if (!askotan || (askotan.esAlt || []).indexOf('muchas veces') < 0) {
  fallos++;
  console.error('  ✗ «askotan» debe aceptar «muchas veces», que es lo que significa literalmente');
}

if (!comprobadas) { console.error('  ✗ no hay ninguna entrada con esAlt: la prueba no prueba nada'); fallos++; }
if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('esAlt OK (' + comprobadas + ' entradas)');
