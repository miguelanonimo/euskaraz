// Los ejercicios de ordenar no deben delatar la solución por la ortografía:
// sin mayúscula inicial (salvo nombres propios), sin signos pegados, con el
// «?» como ficha suelta, y con distractores que no formen parte de la frase.
const fs = require('fs'), path = require('path');
const raiz = require('path').join(__dirname, '..', 'data') + '/';
const idx = JSON.parse(fs.readFileSync(raiz + 'curso-v2.json', 'utf8'));
const unidades = idx.unidades.map(r => JSON.parse(fs.readFileSync(raiz + r, 'utf8')));

const PROPIOS = ['bilbo','donostia','gasteiz','iruñea','gernika','madril','ane','mikel','jon','miren'];
const esPropio = w => PROPIOS.some(r => w.toLowerCase().startsWith(r));
const norm = s => s.toLowerCase().replace(/[¿?¡!.,;:«»"']/g,' ').split(/\s+/).filter(Boolean).join(' ');

let n = 0, fallos = [];
for (const u of unidades) for (const g of u.ejercicios) g.variantes.forEach((v, i) => {
  if (v.tipo !== 'orden') return;
  n++;
  const id = `${g.id} v${i+1}`;
  // 1 · nada en mayúscula que no sea nombre propio
  v.palabras.filter(p => /^[A-ZÁÉÍÓÚÑ]/.test(p) && !esPropio(p))
    .forEach(p => fallos.push(`${id}: «${p}» en mayúscula sin ser nombre propio`));
  // 2 · sin signos pegados (el «?» suelto sí vale)
  v.palabras.filter(p => p.length > 1 && /[.,;:!?]/.test(p))
    .forEach(p => fallos.push(`${id}: «${p}» lleva un signo pegado`));
  // 3 · si la frase es pregunta, el «?» va como ficha aparte
  if (/\?\s*$/.test(v.eu) && !v.palabras.includes('?'))
    fallos.push(`${id}: es pregunta y no tiene la ficha «?»`);
  // 4 · las fichas siguen reconstruyendo la frase
  if (norm(v.palabras.join(' ')) !== norm(v.eu))
    fallos.push(`${id}: las fichas ya no reconstruyen «${v.eu}»`);
  // 5 · distractores: existen y no están en la solución
  const dis = v.distractores || [];
  if (!dis.length) fallos.push(`${id}: sin distractores`);
  const dentro = new Set(norm(v.eu).split(' '));
  dis.filter(d => dentro.has(norm(d))).forEach(d =>
    fallos.push(`${id}: el distractor «${d}» está en la solución`));
});

console.log(`${n} ejercicios de ordenar revisados`);
if (fallos.length) { fallos.slice(0,15).forEach(f => console.log('  ✗', f));
  if (fallos.length > 15) console.log(`  … y ${fallos.length-15} más`);
  console.log(`\n${fallos.length} FALLOS`); process.exit(1); }
console.log('\nNinguno delata la solución por la ortografía.');
