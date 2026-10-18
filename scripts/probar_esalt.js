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
const regla = src.match(/var NOTA_TRAS_GUION = [^;]+;/)[0];

const api = new Function(`
  var euskalkiActivo = 'bizkaiera';
  var modoSilencioso = false;
  function marcarVocab(q, entrada) { q.__clave = 'v:' + entrada.eu; return q; }
  ${regla}
  ${sacar('normalizar')}
  ${sacar('sinNota')}
  ${sacar('formasTraduccion')}
  ${sacar('formasDe')}
  ${sacar('preguntaEscucharTeclear')}
  return { formasDe, preguntaEscucharTeclear, formasTraduccion, sinNota, normalizar };
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

// La nota pegada a la traducción no se teclea. Ric oyó «Zu ondo zaude?»,
// escribió «estás bien?» y le salió «No exactamente», porque lo que se
// esperaba era «¿Estás bien? — vale para cualquiera», nota incluida.
// Y el guion largo no siempre separa una nota: en «¿Dónde? — En Bilbao.»
// la segunda mitad ES la traducción y tiene que seguir haciendo falta.
const NOTAS = [
  ['¿Estás bien? — vale para cualquiera', 'estás bien?',        true ],
  ['¿Estás bien? — vale para cualquiera', 'estás bien',         true ],
  ['la comida (del mediodía)',            'la comida',          true ],
  ['conmigo — batua: nirekin',            'conmigo',            true ],
  ['Tengo una hermana. — dicho por un chico', 'tengo una hermana', true ],
  ['¿Dónde? — En Bilbao.',                '¿dónde?',            false],
  ['¿Qué tal? — Muy bien, ¿y tú?',        'qué tal?',           false],
];
for (const [es, dado, debeValer] of NOTAS) {
  const vale = api.formasTraduccion({ es })
    .some(f => api.normalizar(f) === api.normalizar(dado));
  if (vale !== debeValer) {
    fallos++;
    console.error('  ✗ «' + es + '» con «' + dado + '»: ' +
      (debeValer ? 'debería valer y no vale' : 'no debería valer y vale'));
  }
}

// Cuando la entrada es UNA palabra, su traducción suele enumerar varias
// maneras de decirlo y cualquiera vale. Oír «zu» y escribir «tú» contaba
// como fallo; Ric lo encontró con «bere», escribiendo «suyo». Hay 45
// entradas así en el curso.
// Y al revés: una FRASE no se trocea, porque ahí la coma separa las dos
// mitades de un diálogo y dar media por buena sería regalar la respuesta.
const ALTERNATIVAS = [
  [{ eu: 'zu',        es: 'tú / usted' },            'tú',              true ],
  [{ eu: 'zu',        es: 'tú / usted' },            'usted',           true ],
  [{ eu: 'gu',        es: 'nosotros / nosotras' },   'nosotros',        true ],
  [{ eu: 'iloba',     es: 'el sobrino / el nieto' }, 'el nieto',        true ],
  [{ eu: 'hala-hola', es: 'así así, regular' },      'regular',         true ],
  [{ eu: 'emaztea',   es: 'la mujer, la esposa' },   'la esposa',       true ],
  [{ eu: 'bere', es: 'su (de él/de ella), lo suyo propio' }, 'lo suyo propio', true ],
  [{ eu: 'Zer moduz? — Oso ondo, eta zu?', es: '¿Qué tal? — Muy bien, ¿y tú?' }, '¿y tú?', false],
  [{ eu: 'Non? — Bilbon.', es: '¿Dónde? — En Bilbao.' }, '¿dónde?', false],
];
for (const [entrada, dado, debeValer] of ALTERNATIVAS) {
  const vale = api.formasTraduccion(entrada)
    .some(f => api.normalizar(f) === api.normalizar(dado));
  if (vale !== debeValer) {
    fallos++;
    console.error('  ✗ «' + entrada.eu + '» con «' + dado + '»: ' +
      (debeValer ? 'debería valer y no vale' : 'no debería valer y vale'));
  }
}

// El de Ric, con el dato real del curso.
const u2 = JSON.parse(fs.readFileSync(path.join(raiz, 'data/unidades-v2/02-ni.json'), 'utf8'));
const bere = (u2.vocabulario || []).filter(v => v.eu === 'bere')[0];
if (!bere || !api.formasTraduccion(bere)
      .some(f => api.normalizar(f) === api.normalizar('suyo'))) {
  fallos++;
  console.error('  ✗ «bere» debe aceptar «suyo» al escuchar y traducir');
}

if (!comprobadas) { console.error('  ✗ no hay ninguna entrada con esAlt: la prueba no prueba nada'); fallos++; }
if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('esAlt, notas y alternativas OK (' + comprobadas + ' entradas con esAlt, ' +
            NOTAS.length + ' casos de nota, ' + ALTERNATIVAS.length + ' de alternativas)');
