// Busca ejercicios que usan una construcción gramatical antes de que el curso
// la enseñe. Nació de un aviso de Ric: en el 7.1 aparecía «no como carne»,
// pero la negación no se explica hasta el 7.2.
//
// Ojo con los homógrafos, que dan muchos falsos positivos:
//   · «nago»/«dago» (egon) NO son comparativos en -ago
//   · «zuen» en la 2.2 es «vuestro», no el pasado de ukan
//   · «ez» suelto es el «no» de la 1.2; solo «ez» + auxiliar es la negación
//     de frase, que es lo que se enseña en el 7.2
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'data', 'unidades-v2');

function orden(s) {
  const m = /^(\d+)\.(\d+)$/.exec(String(s || ''));
  return m ? Number(m[1]) * 100 + Number(m[2]) : 9999;
}

const AUX = 'dut|duzu|du|dugu|duzue|dute|ditut|dituzu|ditu|naiz|zara|da|gara|zarete|dira|nago|zaude|dago|gaude|daude|dakit|zait|zaizkit';

// Frases hechas que el curso enseña enteras y a propósito mucho antes de
// explicar su gramática (la ficha 3.4, «Cuatro respuestas que salvan cualquier
// apuro»). No son adelantos: son bloques que se memorizan tal cual.
const EXENTAS = ['ez horregatik', 'ez dakit', 'ez dut ulertzen'];
const exento = t => EXENTAS.reduce((s, x) => s.split(x).join(' '), t.toLowerCase());

const REGLAS = [
  { id: 'negación de frase («ez» + auxiliar)', desde: '7.2',
    re: new RegExp('(^|[^a-záéíóúñ])ez\\s+(' + AUX + ')(?![a-záéíóúñ])', 'i') },
  { id: 'partitivo -(r)ik', desde: '7.2',
    re: /\b(ogirik|haragirik|urik|dirurik|ardorik|esnerik|lanik|denborarik|arazorik|kotxerik)\b/i },
  { id: 'progresivo «ari»', desde: '7.4',
    re: new RegExp('(^|[^a-záéíóúñ])ari\\s+(naiz|zara|da|gara|zarete|dira)(?![a-záéíóúñ])', 'i') },
  { id: '«gustatzen» / NOR-NORI', desde: '9.1',
    re: /\b(gustatzen|zait|zaizkit|zaizu|zaizkizu|zaio|zaizkio)\b/i },
  // El pasado NO es una sola cosa: la unidad 10 lo reparte en tres temas, un
  // auxiliar por tema. Mientras esto era una regla única «desde 10.1», un
  // ejercicio del 10.1 podía pedir «nuen» o «nengoen» y nadie se quejaba. Lo
  // cazó Ric usando la app: en el 10.1 le salió «Joan den astean etxean
  // nengoen», que necesita egon (10.3) y un marcador de 10.5.
  // «zuen» se queda fuera a propósito: en la 2.2 es «vuestro», no el pasado
  // de ukan. Y «zen» suelto da demasiados falsos positivos.
  { id: 'pasado de «izan»', desde: '10.1',
    re: /\b(nintzen|zinen|ginen|zineten|ziren)\b/i },
  { id: 'pasado de «ukan»', desde: '10.2',
    re: /\b(nuen|zenuen|genuen|zenuten|zuten|nituen|zenituen|zituen|genituen|zenituzten|zituzten)\b/i },
  { id: 'pasado de «egon»', desde: '10.3',
    re: /\b(nengoen|zeunden|zegoen|geunden|zeundeten|zeuden)\b/i },
  // Estos dos «desde» se quedaron viejos al partir la unidad 10 en tres: la
  // partícula «al» se fue al 12.1 y los comparativos al 11.3, así que las
  // reglas estaban dejando pasar cosas. Si vuelves a mover temas, repásalas.
  { id: 'partícula «al»', desde: '12.1',
    re: new RegExp('(^|[^a-záéíóúñ])(ba\\s+)?al\\s+(' + AUX + ')(?![a-záéíóúñ])', 'i') },
  { id: '«ezin»', desde: '8.3', re: /\bezin\b/i },
  { id: '«behar»', desde: '8.3', re: /\bbehar\s+(dut|duzu|du|dugu|duzue|dute|izan)\b/i },
  { id: 'comparativo / superlativo', desde: '11.3',
    re: /\b(gehiago|gutxiago|handiago|txikiago|politago|hobea|hoberena|gehien|handiena|onena)\b/i },
];

function textos(v) {
  const out = [];
  const push = (campo, x) => { if (x) out.push({ campo, t: String(x) }); };
  ['instruccion', 'pregunta', 'enunciado', 'frase', 'pista', 'explicacion'].forEach(k => push(k, v[k]));
  ['palabras', 'respuestas'].forEach(k => (v[k] || []).forEach(x => push(k, x)));
  // Solo la opción BUENA. Las falsas y los distractores son, a propósito, lo
  // que el alumno tiene que descartar: el 10.1 ofrece «naiz / nintzen /
  // nengoen / nuen» justamente para que separe el presente del pasado, y
  // rechazar «nengoen» no exige haberlo estudiado. Mirarlos todos hacía que
  // el test se quejara de sus propios ejercicios bien hechos.
  if (Number.isInteger(v.correcta) && Array.isArray(v.opciones) &&
      v.correcta >= 0 && v.correcta < v.opciones.length) {
    push('opciones', v.opciones[v.correcta]);
  }
  (v.pares || []).forEach(p => {
    if (p && typeof p === 'object' && !Array.isArray(p)) {
      Object.keys(p).forEach(k => { if (k !== 'es') push('pares.' + k, p[k]); });
    } else if (Array.isArray(p)) p.forEach(x => push('pares', x));
  });
  if (typeof v.correcta === 'string') push('correcta', v.correcta);
  return out;
}

const fallos = [];
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const e of d.ejercicios || []) {
    const aqui = orden(e.subnivel);
    if (aqui === 9999) continue;
    (e.variantes || []).forEach((v, iv) => {
      for (const r of REGLAS) {
        if (aqui >= orden(r.desde)) continue;
        for (const { campo, t } of textos(v)) {
          if (!r.re.test(exento(t))) continue;
          fallos.push({ sub: e.subnivel, id: e.id, iv, regla: r.id, desde: r.desde, campo, t });
          return;
        }
      }
    });
  }
}

if (!fallos.length) { console.log('probar_adelantos    OK'); process.exit(0); }
console.log('probar_adelantos    ' + fallos.length + ' variantes usan algo aún no enseñado\n');
const porRegla = {};
fallos.forEach(x => (porRegla[x.regla] = porRegla[x.regla] || []).push(x));
Object.keys(porRegla).sort().forEach(k => {
  console.log('  ── ' + k + ' (se enseña en ' + porRegla[k][0].desde + ') ──');
  porRegla[k].sort((a, b) => orden(a.sub) - orden(b.sub)).forEach(x =>
    console.log('     ' + x.sub.padEnd(5) + ' ' + x.id.padEnd(10) + ' v' + x.iv +
                '  ' + x.campo.padEnd(12) + ' ' + x.t.slice(0, 66)));
  console.log('');
});
process.exit(1);
