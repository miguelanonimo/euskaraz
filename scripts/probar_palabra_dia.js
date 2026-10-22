// La carta que se abre al pulsar «Gaurko hitza». El mazo son las palabras ya
// abiertas, pero la de hoy puede no estar en él: si ese día se abrió una y
// luego cambió la del calendario, el hueco del día sigue apuntando a la vieja.
// Antes eso enseñaba la PRIMERA carta que se abrió nunca. Se saca la función
// de app.js por nombre, como el resto de pruebas.
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

eval(sacar('cartaInicial'));

let fallos = 0;
function comprobar(queja, cond) {
  if (!cond) { console.log('  ✗ ' + queja); fallos++; }
}

const carta = (clave) => ({ p: { clave: clave }, dia: 1 });
const HOY = 20748;

// 1 · Lo normal: la pedida está en el mazo y se abre esa.
{
  const mazo = [carta('udazkena'), carta('gaztaina'), carta('lainoa')];
  const r = cartaInicial(mazo, 'gaztaina', { clave: 'gaztaina' }, HOY);
  comprobar('debería abrir la pedida', r.mazo[r.pos].p.clave === 'gaztaina');
  comprobar('no debería tocar el mazo', r.mazo.length === 3);
}

// 2 · El caso que falló de verdad: hoy ya se abrió «gaztaina», después la
//     palabra del 22 pasó a ser «birziklatu», y al abrir salía «udazkena»
//     —la primera del mazo— en vez de la de hoy.
{
  const mazo = [carta('udazkena'), carta('gaztaina')];
  const r = cartaInicial(mazo, 'birziklatu', { clave: 'birziklatu' }, HOY);
  comprobar('debería abrir la de hoy, no la primera del mazo',
    r.mazo[r.pos].p.clave === 'birziklatu');
  comprobar('la de hoy va delante', r.pos === 0 && r.mazo.length === 3);
  comprobar('no se pierde lo ya visto',
    r.mazo.some(x => x.p.clave === 'udazkena') && r.mazo.some(x => x.p.clave === 'gaztaina'));
  comprobar('la carta añadida lleva el día de hoy', r.mazo[0].dia === HOY);
}

// 3 · Mazo vacío: primera vez que se abre nada.
{
  const r = cartaInicial([], 'birziklatu', { clave: 'birziklatu' }, HOY);
  comprobar('con el mazo vacío debería entrar la de hoy',
    r.mazo.length === 1 && r.mazo[0].p.clave === 'birziklatu');
}

// 4 · Si no hay palabra que anteponer, no se inventa nada ni se rompe.
{
  const mazo = [carta('udazkena')];
  const r = cartaInicial(mazo, 'fantasma', null, HOY);
  comprobar('sin palabra suelta, el mazo no cambia', r.mazo.length === 1 && r.pos === 0);
}

console.log(fallos ? '✗ ' + fallos + ' fallos' : 'OK');
process.exit(fallos ? 1 : 0);
