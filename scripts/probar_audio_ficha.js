// Las líneas de ejemplo de una ficha llevan su botón de audio aunque dentro de
// la negrita vaya un <u> subrayando la terminación de la que habla la ficha
// («<b>Mikel<u>ek</u> katu bat du</b>»). Antes solo contaba la negrita sin
// etiquetas dentro, y esas frases —justo las que más enseñan— se quedaban mudas.
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
const CON_AUDIO = { 'mikelek katu bat du': 'a.mp3', 'etxea': 'b.mp3', 'bilbotik nator': 'c.mp3', 'lanean nago': 'd.mp3', 'non zaude?': 'e.mp3' };
const enriquecer = new Function(`
  var AUD = arguments[0];
  function audioDePalabra(t){ return AUD[String(t).toLowerCase().trim()] || ''; }
  function botonAudioTexto(t, a){ return '[' + t + '|' + a + ']'; }
  ${sacar('enriquecerCuerpoConAudio')}
  return enriquecerCuerpoConAudio;
`)(CON_AUDIO);

let fallos = 0;
function igual(nombre, dado, esperado) {
  if (dado === esperado) return;
  fallos++; console.error('✕ ' + nombre + '\n    dado:     ' + dado + '\n    esperado: ' + esperado);
}
// Lo que ya funcionaba no cambia.
igual('negrita sin etiquetas', enriquecer('<b>etxea</b> — la casa'), '<b>etxea</b>[etxea|b.mp3] — la casa');
igual('negrita sin audio', enriquecer('<b>sin audio</b> — nada'), '<b>sin audio</b> — nada');
igual('cursiva al principio de línea', enriquecer('<i>Bilbotik nator</i> — vengo desde Bilbao.'), '<i>Bilbotik nator</i>[Bilbotik nator|c.mp3] — vengo desde Bilbao.');
igual('cursiva con negrita dentro', enriquecer('<i><b>Non</b> zaude?</i>'), '<i><b class="sin-audio">Non</b> zaude?</i>[Non zaude?|e.mp3]');
// Lo nuevo: el subrayado de dentro no impide encontrar la frase, y se conserva al pintarla.
igual('negrita con subrayado', enriquecer('<b>Mikel<u>ek</u> katu bat du</b> — Mikel tiene un gato.'),
  '<b>Mikel<u>ek</u> katu bat du</b>[Mikelek katu bat du|a.mp3] — Mikel tiene un gato.');
igual('cursiva con subrayado', enriquecer('<i>lan<u>ean</u> nago</i> — estoy en el trabajo.'),
  '<i>lan<u>ean</u> nago</i>[lanean nago|d.mp3] — estoy en el trabajo.');
// Otra etiqueta dentro sigue sin contar: una negrita con cursiva es énfasis, no una frase.
igual('negrita con otra etiqueta', enriquecer('<b>etxea <i>da</i></b>'), '<b>etxea <i>da</i></b>');

if (fallos) { console.error(fallos + ' fallo(s)'); process.exit(1); }
console.log('probar_audio_ficha: 7 casos, todo en orden');
