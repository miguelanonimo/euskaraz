// Los dos reinicios de Tu cuenta: el que lo borra todo y el que conserva la
// racha. Se saca reiniciarProgreso() de app.js y se le pone alrededor un
// progreso con de todo, para comprobar qué se queda y qué se va.
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
}
function montar() {
  return new Function(`
    var CLAVE = 'c2', CLAVE_VIEJA = 'c1', HOY_LECCION_KEY = 'hoy', guardarTimer = null;
    var estado = { homeActiva: 'u3' }, progresoActualizadoEn = '2026-11-14T10:00:00Z';
    var pasos = [], almacen = { c2: 'x', c1: 'x', local: 'x', hoy: 'x' };
    var localStorage = { removeItem: function (k) { pasos.push('borra ' + k); delete almacen[k]; } };
    function claveLocal() { return 'local'; }
    function clearTimeout() {}
    // como en la app sin cuenta: el guardado escribe el progreso en el navegador
    function guardarProgresoAhora() {
      pasos.push('guarda' + (progresoActualizadoEn === null ? ' sin condición' : ' con condición'));
      almacen.local = JSON.stringify(progreso);
    }
    var progreso;
    ${['progresoVacio', 'hoy', 'diaActivo', 'rachaActual', 'reiniciarProgreso'].map(sacar).join('\n')}
    return { hoy, rachaActual, reiniciarProgreso, pasos, almacen,
             poner: function (p) { progreso = p; }, ver: function () { return progreso; } };
  `)();
}
function progresoLleno(api) {
  const d = api.hoy();
  return {
    version: 2,
    unidades: { u1: { visitada: true, completada: true, mejor: 1, intentos: 2, subs: { '1.1': { desbloqueado: true, mejor: 1 } } } },
    ultimas: { 'u1-g01': 3 },
    srs: { 'g:u1-g01': { paso: 4, toca: d + 30, aciertos: 5, fallos: 0, visto: d }, 'v:kaixo': { paso: 2, toca: d, aciertos: 2, fallos: 1, visto: d - 3 } },
    estreno: { dia: d, g: 4, v: 9 }, repartido: d,
    dias: { [d]: [8, 10], [d - 1]: [5, 5], [d - 2]: [1, 4], [d - 9]: [3, 3] },
    palabras: { [d]: 'hostoa', [d - 1]: 'lainoa' }
  };
}

let fallos = 0;
function comprobar(que, cond, detalle) {
  if (cond) return;
  fallos++;
  console.error('  ✗ ' + que + (detalle ? '\n      ' + detalle : ''));
}
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ── Conservando la racha ────────────────────────────────────────────────
let api = montar(), antes = progresoLleno(api);
api.poner(JSON.parse(JSON.stringify(antes)));
comprobar('el progreso de prueba trae racha de 3', api.rachaActual() === 3, 'racha ' + api.rachaActual());
api.reiniciarProgreso(true);
let p = api.ver();
comprobar('se queda la actividad de cada día', igual(p.dias, antes.dias));
comprobar('la racha es la misma que antes', api.rachaActual() === 3, 'racha ' + api.rachaActual());
comprobar('se quedan las palabras del día abiertas', igual(p.palabras, antes.palabras));
comprobar('se vacían las unidades', igual(p.unidades, {}), JSON.stringify(p.unidades));
comprobar('se vacía el calendario de repaso', igual(p.srs, {}), JSON.stringify(p.srs));
comprobar('se vacía la última variante de cada grupo', igual(p.ultimas, {}));
comprobar('el cupo de estrenos de hoy vuelve a cero', p.estreno === null && p.repartido === 0);
comprobar('se guarda sin la condición de updated_at', api.pasos.indexOf('guarda sin condición') >= 0, api.pasos.join(' · '));
comprobar('lo local se borra ANTES de guardar',
  api.pasos.indexOf('borra local') >= 0 && api.pasos.indexOf('borra local') < api.pasos.indexOf('guarda sin condición'),
  api.pasos.join(' · '));
comprobar('probando sin cuenta, la racha sobrevive a recargar',
  !!api.almacen.local && igual(JSON.parse(api.almacen.local).dias, antes.dias), String(api.almacen.local).slice(0, 80));
comprobar('se olvida «la lección de hoy ya está hecha»', api.pasos.indexOf('borra hoy') >= 0);

// ── Borrándolo todo ─────────────────────────────────────────────────────
api = montar();
api.poner(progresoLleno(api));
api.reiniciarProgreso(false);
p = api.ver();
comprobar('el reinicio total no deja actividad', igual(p.dias, {}));
comprobar('el reinicio total deja la racha a cero', api.rachaActual() === 0, 'racha ' + api.rachaActual());
comprobar('el reinicio total no deja palabras del día', igual(p.palabras, {}));
comprobar('el reinicio total vacía unidades y calendario', igual(p.unidades, {}) && igual(p.srs, {}));

if (fallos) { console.error(fallos + ' comprobación(es) fallida(s)'); process.exit(1); }
console.log('reinicio: los dos, bien');
