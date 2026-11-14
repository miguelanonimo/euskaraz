// Dos declaraciones con el mismo nombre en el ámbito principal de app.js.
//
// app.js es una sola función de 6.000 líneas y casi todo son `var` y
// `function` de ese ámbito, así que declarar dos veces el mismo nombre no
// da error: la segunda pisa a la primera en silencio. Pasó con MEZCLA —el
// reparto de la sesión de repaso arriba y la tabla de formatos del
// vocabulario abajo— y el reparto estuvo dos meses y medio sin funcionar.
//
// Las demás pruebas no pueden verlo: sacan cada función por su nombre y le
// ponen alrededor las variables que necesita, copiadas una a una, así que
// corren en un ámbito que no es el de la app. Esta mira el archivo entero.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'js/app.js'), 'utf8');

let prof = 0, enBloque = false;
const vistos = {};
function apuntar(nombre, linea) { (vistos[nombre] = vistos[nombre] || []).push(linea); }

src.split('\n').forEach((l, i) => {
  let s = l;
  if (enBloque) { const f = s.indexOf('*/'); if (f < 0) return; s = s.slice(f + 2); enBloque = false; }
  s = s.replace(/\/\*.*?\*\//g, '');
  const ab = s.indexOf('/*');
  if (ab >= 0) { s = s.slice(0, ab); enBloque = true; }
  s = s.replace(/\/\/.*$/, '')
       .replace(/'(?:\\.|[^'\\])*'/g, "''")
       .replace(/"(?:\\.|[^"\\])*"/g, '""');
  if (prof === 1) {                       // 1 = el cuerpo de la función que lo envuelve todo
    let m = /^\s*function\s+([A-Za-z_$][\w$]*)/.exec(s);
    if (m) apuntar(m[1], i + 1);
    m = /^\s*var\s+(.*)$/.exec(s);
    if (m) {
      // «var a = 1, b = 2»: cada nombre cuenta, sin entrar en paréntesis ni llaves
      let hondo = 0, trozo = '';
      const trozos = [];
      for (const c of m[1]) {
        if ('([{'.includes(c)) hondo++;
        else if (')]}'.includes(c)) hondo--;
        if (c === ',' && hondo === 0) { trozos.push(trozo); trozo = ''; } else trozo += c;
      }
      trozos.push(trozo);
      trozos.forEach(t => { const n = /^\s*([A-Za-z_$][\w$]*)\s*(=|;|$)/.exec(t); if (n) apuntar(n[1], i + 1); });
    }
  }
  s = s.replace(/\/(?:\\.|[^\/\\\n])+\/[gimuy]*/g, '0');
  for (const c of s) { if (c === '{') prof++; else if (c === '}') prof--; }
});

const repetidos = Object.entries(vistos).filter(([, v]) => v.length > 1);
if (Object.keys(vistos).length < 300) {
  console.error('  ✗ solo veo ' + Object.keys(vistos).length + ' nombres: la prueba ha dejado de leer bien app.js');
  process.exit(1);
}
if (repetidos.length) {
  repetidos.forEach(([n, v]) => console.error('  ✗ «' + n + '» está declarado ' + v.length + ' veces: líneas ' + v.join(', ')));
  process.exit(1);
}
console.log('ámbito: ' + Object.keys(vistos).length + ' nombres, ninguno repetido');
