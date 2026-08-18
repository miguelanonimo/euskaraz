/* ═══════════════════════════════════════════════════════════
   Euskaraz — lógica de la aplicación
   Sin dependencias. Funciona en cualquier navegador moderno.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────── Estado ───────────

  var CURSO = null;

  // Variante dialectal: 'bizkaiera' (Bilbao, revisado y con audio) o
  // 'gernikes' (contenido original de Ric, Busturialdea/Gernika, sin
  // audio todavía). Es preferencia de aparato, no de progreso — vive en
  // localStorage, no en Supabase.
  var CLAVE_DIALECTO = 'euskaraz.dialecto';
  var MODO_DIALECTO = localStorage.getItem(CLAVE_DIALECTO) === 'gernikes' ? 'gernikes' : 'bizkaiera';
  var CLAVE = 'euskaraz.progreso.v2';
  var CLAVE_VIEJA = 'euskaraz.progreso.v1';

  // ─────────── Supabase ───────────
  // Proyecto compartido con Ippo (mismo org); tabla propia euskaraz_progreso,
  // aislada por RLS (auth.uid() = user_id). Ver docs/brief.md sección 4.
  var SUPABASE_URL = 'https://teoyketwfyxjhkoympcj.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb3lrZXR3Znl4amhrb3ltcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzU1NTksImV4cCI6MjA5NDYxMTU1OX0._ilcBB8IakFz4-iDwWXdXArL2h2Nz00OSMnc6a1jBjg';
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  var usuarioId = null;

  // Bucket público de pronunciaciones (Cloud TTS, ver docs/brief.md sección 6).
  var AUDIO_BASE = SUPABASE_URL + '/storage/v1/object/public/euskaraz-audio/';
  var GUARDAR_ESPERA_MS = 1500;
  var guardarTimer = null;

  var LARGO_REPASO = 15;   // ejercicios por sesión de repaso mezclado
  var LARGO_VOCAB  = 20;   // palabras por sesión de repaso de vocabulario

  /* Repaso espaciado. Cada ítem —un grupo de ejercicios o una palabra—
     lleva un paso dentro de esta escala, en días. Aciertas: subes un
     peldaño y no vuelve hasta entonces. Fallas: vuelves al principio y
     te sale mañana. La escala es corta al principio, que es donde se
     olvida, y se abre deprisa cuando algo ya está asentado. */
  var PASOS = [1, 2, 4, 8, 16, 32, 64, 120];

  var estado = {
    pantalla: 'home',
    unidad: null,       // objeto unidad actual (null fuera de la práctica de unidad)
    modo: 'unidad',     // 'unidad' | 'repaso' | 'vocab'
    ejercicios: [],     // cola barajada de la sesión
    indice: 0,
    aciertos: 0,
    fallos: 0,
    falladas: [],       // palabras erradas en la sesión de vocabulario
    resuelto: false,    // el ejercicio actual ya se ha comprobado
    sel: null           // selección temporal del ejercicio en curso
  };

  var progreso = progresoVacio();  // placeholder hasta que arrancarApp() lo sustituye con lo cargado de Supabase

  // ─────────── Atajos al DOM ───────────

  function $(id) { return document.getElementById(id); }

  var el = {
    topbarTitle: $('topbarTitle'),
    btnBack: $('btnBack'),
    progressbar: $('progressbar'),
    progressbarFill: $('progressbarFill'),
    hearts: $('hearts'),
    btnDialecto: $('btnDialecto'),
    screenAuth: $('screenAuth'),
    authForm:   $('authForm'),
    authEmail:  $('authEmail'),
    authSubmit: $('authSubmit'),
    authMsg:    $('authMsg'),
    screens: {
      home:   $('screenHome'),
      unit:   $('screenUnit'),
      gram:   $('screenGram'),
      vocab:  $('screenVocab'),
      dict:   $('screenDict'),
      quiz:   $('screenQuiz'),
      result: $('screenResult')
    },
    unitList:        $('unitList'),
    repasoCount:     $('repasoCount'),
    repasoDue:       $('repasoDue'),
    vocabRepasoCount:$('vocabRepasoCount'),
    vocabRepasoDue:  $('vocabRepasoDue'),
    diccCount:       $('diccCount'),
    dictInput:     $('dictInput'),
    dictCount:     $('dictCount'),
    dictContent:   $('dictContent'),
    heroSub:       $('heroSub'),
    statUnidades:  $('statUnidades'),
    statPalabras:  $('statPalabras'),
    statRacha:     $('statRacha'),
    unitHeroNum:   $('unitHeroNum'),
    unitHeroTitle: $('unitHeroTitle'),
    unitHeroSub:   $('unitHeroSub'),
    unitHeroGoal:  $('unitHeroGoal'),
    gramCount:     $('gramCount'),
    vocabCount:    $('vocabCount'),
    practiceCount: $('practiceCount'),
    gramContent:   $('gramContent'),
    vocabContent:  $('vocabContent'),
    quizContent:   $('quizContent'),
    resultContent: $('resultContent'),
    feedback:      $('feedback'),
    feedbackIcon:  $('feedbackIcon'),
    feedbackTitle: $('feedbackTitle'),
    feedbackBody:  $('feedbackBody'),
    feedbackNext:  $('feedbackNext'),
    actionbar:     $('actionbar'),
    btnCheck:      $('btnCheck')
  };

  // ─────────── Utilidades ───────────

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // La gramática admite <b> e <i> escritos a mano en el JSON.
  function richText(s) {
    return esc(s)
      .replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>')
      .split('\n\n').map(function (p) {
        return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
      }).join('');
  }

  function normalizar(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[¿?¡!.,;:«»"'()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Para el buscador: además quita tildes, para que «musica»
     encuentre «música» y «que» encuentre «qué». La eñe se
     conserva, porque en euskera distingue palabras. */
  function plegar(s) {
    var t = normalizar(s).replace(/\u00f1/g, '\u0001');
    if (t.normalize) t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return t.replace(/\u0001/g, '\u00f1');
  }

  function barajar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function alAzar(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* Cada ejercicio del JSON es un grupo con varias variantes. En cada
     sesión se elige una al azar, para que no se memorice la solución.
     Se evita repetir la misma variante que salió la vez anterior,
     siempre que haya más de una disponible. */
  function elegirVariante(grupo) {
    var vs = grupo.variantes || [grupo];
    if (vs.length === 1) return vs[0];
    var previa = progreso.ultimas ? progreso.ultimas[grupo.id] : undefined;
    var opciones = vs.map(function (v, i) { return i; });
    if (previa !== undefined) {
      opciones = opciones.filter(function (i) { return i !== previa; });
    }
    var elegida = alAzar(opciones);
    if (!progreso.ultimas) progreso.ultimas = {};
    progreso.ultimas[grupo.id] = elegida;
    return vs[elegida];
  }

  /* La variante se copia antes de usarla: así se le puede colgar de qué
     grupo y de qué unidad viene sin ensuciar el objeto del JSON, que se
     comparte entre sesiones. `__clave` es lo que enlaza el ejercicio con
     su ficha del calendario de repaso. */
  function prepararVariante(grupo, unidad) {
    var v = elegirVariante(grupo);
    var copia = {};
    for (var k in v) copia[k] = v[k];
    copia.__clave = claveGrupo(grupo.id);
    if (unidad) copia.__unidad = unidad.numero + '. ' + unidad.titulo;
    return copia;
  }

  function vibrar(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
  }

  // ─────────── Audio (pronunciación) ───────────

  var reproductor = new Audio();

  function botonAudio(v) {
    if (!v.audio) return '';
    return '<button class="vitem__play" type="button" data-audio="' + esc(v.audio) + '" aria-label="Escuchar «' + esc(v.eu) + '»">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 010 8"/></svg>' +
      '</button>';
  }

  function reproducir(ruta) {
    reproductor.src = AUDIO_BASE + ruta;
    reproductor.currentTime = 0;
    reproductor.play().catch(function () {});
  }

  // Un solo listener delegado sirve a vocabulario y diccionario, que
  // comparten la misma estructura .vitem.
  function activarAudioEnLista(nodo) {
    nodo.addEventListener('click', function (e) {
      var btn = e.target.closest('.vitem__play');
      if (btn) reproducir(btn.dataset.audio);
    });
  }

  // ─────────── Persistencia ───────────

  function progresoVacio() {
    return { version: 2, unidades: {}, ultimas: {}, srs: {} };
  }

  /* La v2 añade `srs`: el calendario de repaso, una entrada por ítem.
     Se copian solo las claves conocidas del objeto de origen (fila de
     Supabase, o semilla de localStorage en la migración de la fila
     nueva) — así una fila corrupta o de una versión futura no puede
     colar campos inesperados en el estado en memoria. */
  function normalizarProgreso(viejo) {
    var p = progresoVacio();
    if (viejo) {
      if (viejo.unidades) p.unidades = viejo.unidades;
      if (viejo.ultimas) p.ultimas = viejo.ultimas;
      if (viejo.srs) p.srs = viejo.srs;
    }
    return p;
  }

  /* Semilla de una sola vez para cuando este navegador ya tenía progreso
     en localStorage (de antes de existir Supabase) y la fila en la base
     de datos todavía no existe: así el primer login no empieza de cero. */
  function progresoLocalPrevio() {
    try {
      var raw = localStorage.getItem(CLAVE) || localStorage.getItem(CLAVE_VIEJA);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function crearFilaProgreso(datos) {
    return sb.from('euskaraz_progreso').insert({ user_id: usuarioId, data: datos })
      .then(function (r) {
        if (r.error) throw r.error;
        return datos;
      });
  }

  /* Requiere que usuarioId ya esté fijado (ver onAuthStateChange). */
  function cargarProgreso() {
    return sb.from('euskaraz_progreso').select('data').eq('user_id', usuarioId).maybeSingle()
      .then(function (r) {
        if (r.error) throw r.error;
        if (r.data) return normalizarProgreso(r.data.data);
        return crearFilaProgreso(normalizarProgreso(progresoLocalPrevio()));
      });
  }

  /* anotar() guarda en cada acierto/fallo; con debounce evitamos un
     upsert por cada respuesta y agrupamos en una sola escritura 1.5s
     después del último cambio (nota de implementación, brief sección 4). */
  function guardarProgreso() {
    if (!usuarioId) return;
    if (guardarTimer) clearTimeout(guardarTimer);
    guardarTimer = setTimeout(guardarProgresoAhora, GUARDAR_ESPERA_MS);
  }

  function guardarProgresoAhora() {
    guardarTimer = null;
    if (!usuarioId) return;
    sb.from('euskaraz_progreso')
      .update({ data: progreso, updated_at: new Date().toISOString() })
      .eq('user_id', usuarioId)
      .then(function (r) { if (r.error) console.error('Error guardando progreso', r.error); });
  }

  // Al cambiar de pantalla o salir, no dejar una escritura pendiente sin mandar.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && guardarTimer) {
      clearTimeout(guardarTimer);
      guardarProgresoAhora();
    }
  });

  function progUnidad(id) {
    if (!progreso.unidades[id]) {
      progreso.unidades[id] = { visitada: false, vocab: false, completada: false, mejor: 0, intentos: 0 };
    }
    return progreso.unidades[id];
  }

  // ─────────── Repaso espaciado ───────────

  /* El calendario cuenta por días enteros, no por horas: lo que toca hoy
     toca todo el día. El día es el local, no el UTC, para que la frontera
     caiga a medianoche de aquí y no a las dos de la madrugada. */
  function hoy() {
    var d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  }

  /* Las claves llevan prefijo porque en el mismo calendario conviven los
     grupos de ejercicios («g:u7-g03») y las palabras («v:kaixo»). */
  function claveGrupo(id)   { return 'g:' + id; }
  function clavePalabra(eu) { return 'v:' + normalizar(eu); }

  function ficha(clave) {
    return progreso.srs[clave] || null;
  }

  /* Un ítem está vencido si le tocaba hoy o antes. Los que nunca se han
     visto no están vencidos: son nuevos, y van en su propio montón. */
  function vencido(clave, dia) {
    var f = ficha(clave);
    return !!f && f.toca <= dia;
  }

  function anotar(clave, ok) {
    if (!clave) return;
    var f = progreso.srs[clave];
    if (!f) f = progreso.srs[clave] = { paso: 0, toca: 0, aciertos: 0, fallos: 0, visto: 0 };
    if (ok) {
      f.aciertos++;
      f.paso = Math.min(f.paso + 1, PASOS.length - 1);
    } else {
      f.fallos++;
      f.paso = 0;   // un fallo devuelve al principio de la escala
    }
    f.visto = hoy();
    f.toca = f.visto + PASOS[f.paso];
    guardarProgreso();
  }

  /* Elige qué entra en una sesión. El orden de preferencia es:
       1. lo vencido, y dentro de eso lo que lleva más tiempo esperando
          y lo que más se ha fallado;
       2. lo que nunca se ha visto, en el orden del curso;
       3. si aún falta para llenar la sesión, lo que vence antes.
     `claveDe` saca la clave de calendario de cada candidato. La lista
     final se baraja: la urgencia decide qué entra, no en qué orden sale. */
  function elegirSesion(candidatos, cuantos, claveDe) {
    var dia = hoy();
    var pendientes = [], nuevos = [], resto = [];

    candidatos.forEach(function (c, orden) {
      var f = ficha(claveDe(c));
      if (!f)                 nuevos.push({ c: c, orden: orden });
      else if (f.toca <= dia) pendientes.push({ c: c, f: f, orden: orden });
      else                    resto.push({ c: c, f: f, orden: orden });
    });

    pendientes.sort(function (a, b) {
      if (a.f.toca !== b.f.toca) return a.f.toca - b.f.toca;      // el más atrasado
      if (a.f.fallos !== b.f.fallos) return b.f.fallos - a.f.fallos; // el más fallado
      return a.orden - b.orden;
    });
    nuevos.sort(function (a, b) { return a.orden - b.orden; });
    resto.sort(function (a, b) { return a.f.toca - b.f.toca; });

    var cola = pendientes.concat(nuevos, resto).map(function (x) { return x.c; });
    return barajar(cola.slice(0, cuantos));
  }

  /* Para la portada: cuántos vencen hoy y cuántos no se han visto nunca.
     Se cuentan aparte porque no significan lo mismo. «12 pendientes» es
     una deuda; «144 sin ver» solo es el curso entero esperando. */
  function recuento(candidatos, claveDe) {
    var dia = hoy(), r = { vencidos: 0, nuevos: 0, total: candidatos.length };
    candidatos.forEach(function (c) {
      var f = ficha(claveDe(c));
      if (!f) r.nuevos++;
      else if (f.toca <= dia) r.vencidos++;
    });
    return r;
  }

  /* «12 pendientes hoy», «todo al día · 30 palabras nuevas», etc. */
  function frasePendientes(r, singular, plural) {
    if (!r.total) return '';
    if (r.vencidos) {
      return r.vencidos + (r.vencidos === 1 ? ' ' + singular + ' te toca hoy' : ' ' + plural + ' te tocan hoy');
    }
    if (r.nuevos) {
      return 'Al día · ' + r.nuevos + ' sin estrenar';
    }
    return 'Al día · vuelve cuando quieras';
  }

  // ─────────── Navegación ───────────

  function mostrar(nombre) {
    estado.pantalla = nombre;
    for (var k in el.screens) {
      el.screens[k].hidden = (k !== nombre);
    }
    el.btnBack.hidden = (nombre === 'home');
    el.actionbar.hidden = (nombre !== 'quiz');
    el.progressbar.hidden = (nombre !== 'quiz');
    el.hearts.hidden = (nombre !== 'quiz');
    el.btnDialecto.hidden = (nombre !== 'home');
    ocultarFeedback();
    window.scrollTo(0, 0);
  }

  function atras() {
    switch (estado.pantalla) {
      case 'unit':
        pantallaHome();
        break;
      case 'gram':
      case 'vocab':
        pantallaUnidad(estado.unidad);
        break;
      case 'dict':
        pantallaHome();
        break;
      case 'result':
        salirDeSesion();
        break;
      case 'quiz':
        if (confirm('¿Salir de la práctica? Perderás el avance de esta sesión.')) {
          salirDeSesion();
        }
        break;
      default:
        pantallaHome();
    }
  }

  /* Los dos repasos salen al inicio; la práctica de una unidad, a su
     portada, que es de donde se entró. */
  function salirDeSesion() {
    if (estado.modo === 'unidad' && estado.unidad) pantallaUnidad(estado.unidad);
    else pantallaHome();
  }

  // ─────────── Pantalla: inicio ───────────

  function pantallaHome() {
    el.topbarTitle.textContent = 'Euskaraz';
    el.heroSub.textContent = CURSO.meta.subtitulo;

    var hechas = 0, palabras = 0;
    CURSO.unidades.forEach(function (u) {
      var p = progUnidad(u.id);
      if (p.completada) hechas++;
      if (p.vocab) palabras += u.vocabulario.length;
    });
    el.statUnidades.textContent = hechas;
    el.statPalabras.textContent = palabras;
    el.statRacha.innerHTML = Math.round(hechas / CURSO.unidades.length * 100) + '<small>%</small>';

    var tickSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
    var chevSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

    el.unitList.innerHTML = CURSO.unidades.map(function (u) {
      var p = progUnidad(u.id);
      var badge = p.completada ? tickSvg : esc(u.numero);
      /* El número de la unidad marca su progreso, no un color de
         contenido: gris sin empezar, ámbar empezada, rojo completada. */
      var badgeClase = p.completada ? ' unitcard__badge--ok' : (p.visitada ? ' unitcard__badge--activa' : '');
      var meta = p.completada
        ? '<span class="unitcard__meta">' + tickSvg + 'Completada · ' + Math.round(p.mejor * 100) + '%</span>'
        : (p.visitada
            ? '<span class="unitcard__meta unitcard__meta--pend">Empezada</span>'
            : '<span class="unitcard__meta unitcard__meta--pend">' + u.ejercicios.length + ' ejercicios</span>');

      return '<li>' +
        '<button class="unitcard" data-unidad="' + esc(u.id) + '">' +
          '<span class="unitcard__badge' + badgeClase + '">' + badge + '</span>' +
          '<span class="unitcard__body">' +
            '<span class="unitcard__title">' + esc(u.titulo) + '</span>' +
            '<span class="unitcard__sub">' + esc(u.subtitulo) + '</span>' +
            meta +
          '</span>' +
          '<span class="unitcard__chev">' + chevSvg + '</span>' +
        '</button></li>';
    }).join('');

    var fondo = fondoRepaso();
    if (fondo.length) {
      var rEj = recuento(fondo, claveDeFondo);
      el.repasoCount.textContent = frasePendientes(rEj, 'ejercicio', 'ejercicios');
      pintarPendiente(el.repasoDue, rEj.vencidos);
    } else {
      el.repasoCount.textContent = 'Abre una unidad y aquí tendrás repaso';
      pintarPendiente(el.repasoDue, 0);
    }

    var vocab = fondoVocabulario();
    if (vocab.length >= 4) {
      var rVo = recuento(vocab, claveDeVocab);
      el.vocabRepasoCount.textContent = frasePendientes(rVo, 'palabra', 'palabras');
      pintarPendiente(el.vocabRepasoDue, rVo.vencidos);
    } else {
      el.vocabRepasoCount.textContent = 'Abre una unidad y aquí tendrás palabras';
      pintarPendiente(el.vocabRepasoDue, 0);
    }

    el.diccCount.textContent = diccionario().length + ' palabras de todo el curso';

    mostrar('home');
  }

  /* La cifra de pendientes solo aparece si hay deuda. Sin nada vencido,
     la tarjeta se queda limpia: no hay que inventar urgencia. */
  function pintarPendiente(nodo, n) {
    if (!nodo) return;
    nodo.textContent = n ? String(n) : '';
    nodo.hidden = !n;
  }

  // ─────────── Pantalla: portada de unidad ───────────

  function pantallaUnidad(u) {
    estado.unidad = u;
    progUnidad(u.id).visitada = true;
    guardarProgreso();

    el.topbarTitle.textContent = u.titulo;
    el.unitHeroNum.textContent = u.numero + '. unitatea';
    el.unitHeroTitle.textContent = u.titulo;
    el.unitHeroSub.textContent = u.subtitulo;
    el.unitHeroGoal.textContent = u.objetivo;

    el.gramCount.textContent = u.gramatica.length + ' explicaciones';
    el.vocabCount.textContent = u.vocabulario.length + ' palabras';
    var variantes = u.ejercicios.reduce(function (n, g) {
      return n + ((g.variantes && g.variantes.length) || 1);
    }, 0);
    el.practiceCount.textContent = u.ejercicios.length + ' ejercicios · ' + variantes + ' variantes';

    mostrar('unit');
  }

  // ─────────── Pantalla: gramática ───────────

  function pantallaGramatica() {
    var u = estado.unidad;
    el.topbarTitle.textContent = 'Gramática · ' + u.titulo;

    el.gramContent.innerHTML = u.gramatica.map(function (g) {
      var ejemplos = '';
      if (g.ejemplos && g.ejemplos.length) {
        ejemplos = '<ul class="exlist">' + g.ejemplos.map(function (e) {
          return '<li><span class="eu">' + esc(e.eu) + botonAudio(e) + '</span>' +
                 '<span class="es">' + esc(e.es) + '</span></li>';
        }).join('') + '</ul>';
      }
      return '<article class="gcard">' +
        '<h2 class="gcard__title">' + esc(g.titulo) + '</h2>' +
        '<div class="gcard__body">' + richText(g.cuerpo) + '</div>' +
        ejemplos +
      '</article>';
    }).join('');

    mostrar('gram');
  }

  // ─────────── Pantalla: vocabulario ───────────

  /* Etiqueta de registro (sección 5.1 del brief): ninguna forma se oculta,
     batua y bizkaiera se enseñan juntas, marcadas para no mezclarlas sin
     querer. Solo se pinta si el ítem trae `registro` explícito. */
  function etiquetaRegistro(v) {
    return v.registro ? '<span class="vitem__registro vitem__registro--' + esc(v.registro) + '">' + esc(v.registro) + '</span>' : '';
  }

  function filaVariante(v) {
    var nota = v.nota ? '<span class="vitem__nota">' + esc(v.nota) + '</span>' : '';
    return '<div class="vitem vitem--variante">' +
      '<span class="vitem__row">' +
        '<span class="vitem__eu">' + esc(v.eu) + botonAudio(v) + etiquetaRegistro(v) + '</span>' +
      '</span>' + nota +
    '</div>';
  }

  function fichaVocabulario(v) {
    var nota = v.nota ? '<span class="vitem__nota">' + esc(v.nota) + '</span>' : '';
    var variantes = (v.variantes || []).map(filaVariante).join('');
    return '<div class="vitem">' +
      '<span class="vitem__row">' +
        '<span class="vitem__eu">' + esc(v.eu) + botonAudio(v) + etiquetaRegistro(v) + '</span>' +
        '<span class="vitem__es">' + esc(v.es) + '</span>' +
      '</span>' + nota + variantes +
    '</div>';
  }

  function pantallaVocabulario() {
    var u = estado.unidad;
    progUnidad(u.id).vocab = true;
    guardarProgreso();
    el.topbarTitle.textContent = 'Vocabulario · ' + u.titulo;

    el.vocabContent.innerHTML = '<div class="vocabgroup">' + u.vocabulario.map(fichaVocabulario).join('') + '</div>';

    mostrar('vocab');
  }

  // ─────────── Repaso mezclado ───────────

  /* El repaso solo tira de las unidades que has abierto alguna vez.
     Así no te salen ejercicios de gramática que todavía no has leído.
     Si no has abierto ninguna, no hay repaso que hacer. */
  function fondoRepaso() {
    var fondo = [];
    CURSO.unidades.forEach(function (u) {
      if (!progUnidad(u.id).visitada) return;
      u.ejercicios.forEach(function (gr) {
        fondo.push({ grupo: gr, unidad: u });
      });
    });
    return fondo;
  }

  function claveDeFondo(x) { return claveGrupo(x.grupo.id); }

  /* Ya no se baraja el fondo entero: el calendario decide qué entra en la
     sesión —primero lo vencido, luego lo nuevo— y el azar solo decide en
     qué orden sale. */
  function empezarRepaso() {
    var fondo = fondoRepaso();
    if (!fondo.length) {
      alert('Todavía no has abierto ninguna unidad. Empieza por la primera y luego vuelve aquí.');
      return;
    }
    estado.unidad = null;
    estado.modo = 'repaso';
    estado.ejercicios = elegirSesion(fondo, LARGO_REPASO, claveDeFondo)
      .map(function (x) { return prepararVariante(x.grupo, x.unidad); });
    guardarProgreso();
    estado.indice = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    el.topbarTitle.textContent = 'Repaso mezclado';
    mostrar('quiz');
    pintarEjercicio();
  }

  // ─────────── Repaso de vocabulario ───────────

  /* Solo palabras de unidades cuyo vocabulario ya has abierto (no basta
     con haber entrado a la portada), sin repetir la misma palabra en
     euskera aunque salga en dos unidades. Se guarda la unidad de origen
     para poder sacar distractores de la misma lección. */
  function fondoVocabulario() {
    var vistas = {}, fondo = [];
    CURSO.unidades.forEach(function (u) {
      if (!progUnidad(u.id).vocab) return;
      u.vocabulario.forEach(function (v) {
        var k = normalizar(v.eu);
        if (vistas[k]) return;
        vistas[k] = true;
        fondo.push({ eu: v.eu, es: v.es, nota: v.nota, unidad: u.numero, titulo: u.titulo });
      });
    });
    return fondo;
  }

  function claveDeVocab(v) { return clavePalabra(v.eu); }

  /* Monta una pregunta de opción múltiple a partir de una palabra.

     La dirección se sortea: unas veces se da el euskera y se pide el
     castellano (reconocer), otras al revés (producir). Con una excepción
     necesaria: si dos palabras en euskera comparten traducción —«ikusi
     arte» y «gero arte» son las dos «hasta luego»— preguntar del
     castellano al euskera tendría dos respuestas buenas y solo una
     contaría. En ese caso se fuerza la dirección segura.

     Los distractores salen preferentemente de la misma unidad, que es
     donde el parecido hace daño y por tanto donde se aprende algo. Se
     descartan los que coinciden con la respuesta una vez normalizados,
     para no ofrecer dos opciones que dicen lo mismo. */
  function preguntaVocab(entrada, fondo, ambiguas) {
    var aEuskera = Math.random() < 0.5 && !ambiguas[normalizar(entrada.es)];
    var campo    = aEuskera ? 'eu' : 'es';
    var correcta = entrada[campo];
    var yaPuesto = {};
    yaPuesto[normalizar(correcta)] = true;

    var mismos = [], otros = [];
    fondo.forEach(function (v) {
      if (v === entrada) return;
      var txt = normalizar(v[campo]);
      if (yaPuesto[txt]) return;
      (v.unidad === entrada.unidad ? mismos : otros).push(v);
    });

    var opciones = [correcta];
    barajar(mismos).concat(barajar(otros)).some(function (v) {
      var txt = normalizar(v[campo]);
      if (yaPuesto[txt]) return false;
      yaPuesto[txt] = true;
      opciones.push(v[campo]);
      return opciones.length === 4;
    });

    return {
      tipo: 'opcion',
      instruccion: aEuskera ? 'Vocabulario · ¿cómo se dice?' : 'Vocabulario · ¿qué significa?',
      pregunta: aEuskera ? entrada.es : entrada.eu,
      opciones: opciones,
      correcta: 0,
      explicacion: entrada.nota || '',
      __clave: clavePalabra(entrada.eu),
      __unidad: entrada.unidad + '. ' + entrada.titulo,
      __palabra: entrada
    };
  }

  function empezarVocab() {
    var fondo = fondoVocabulario();
    if (fondo.length < 4) {
      alert('Todavía no hay vocabulario suficiente. Abre alguna unidad y luego vuelve aquí.');
      return;
    }

    // Traducciones que sirven para más de una palabra: no se pueden
    // preguntar del castellano al euskera. Se calcula una vez por sesión.
    var cuantas = {}, ambiguas = {};
    fondo.forEach(function (v) {
      var k = normalizar(v.es);
      cuantas[k] = (cuantas[k] || 0) + 1;
      if (cuantas[k] > 1) ambiguas[k] = true;
    });

    estado.unidad = null;
    estado.modo = 'vocab';
    estado.ejercicios = elegirSesion(fondo, Math.min(LARGO_VOCAB, fondo.length), claveDeVocab)
      .map(function (v) { return preguntaVocab(v, fondo, ambiguas); });
    estado.indice = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    el.topbarTitle.textContent = 'Vocabulario';
    mostrar('quiz');
    pintarEjercicio();
  }

  // ─────────── Pantalla: diccionario ───────────

  var DICC = null;

  /* Todo el vocabulario del curso en una sola lista, ordenada
     alfabéticamente por la palabra en euskera. Si la misma palabra
     aparece en dos unidades, se queda la primera vez que salió. */
  function diccionario() {
    if (DICC) return DICC;
    var vistas = {};
    DICC = [];
    function anadir(v, es, unidad) {
      var clave = normalizar(v.eu);
      if (vistas[clave]) return;
      vistas[clave] = true;
      DICC.push({
        eu: v.eu, es: es, nota: v.nota, audio: v.audio, registro: v.registro,
        unidad: unidad,
        busca: plegar(v.eu) + ' ' + plegar(es) + ' ' + plegar(v.nota || '')
      });
    }
    CURSO.unidades.forEach(function (u) {
      u.vocabulario.forEach(function (v) {
        anadir(v, v.es, u.numero);
        (v.variantes || []).forEach(function (variante) { anadir(variante, v.es, u.numero); });
      });
    });
    DICC.sort(function (a, b) {
      return plegar(a.eu) < plegar(b.eu) ? -1 : (plegar(a.eu) > plegar(b.eu) ? 1 : 0);
    });
    return DICC;
  }

  function pintarDiccionario(filtro) {
    var q = plegar(filtro || '');
    var lista = diccionario().filter(function (v) {
      return !q || v.busca.indexOf(q) !== -1;
    });

    el.dictCount.textContent = lista.length === 0
      ? 'Ninguna palabra coincide'
      : (lista.length === 1 ? '1 palabra' : lista.length + ' palabras');

    if (!lista.length) {
      el.dictContent.innerHTML = '';
      return;
    }

    el.dictContent.innerHTML = '<div class="vocabgroup">' + lista.map(function (v) {
      var nota = v.nota ? '<span class="vitem__nota">' + esc(v.nota) + '</span>' : '';
      return '<div class="vitem">' +
        '<span class="vitem__row">' +
          '<span class="vitem__eu">' + esc(v.eu) + botonAudio(v) + etiquetaRegistro(v) + '</span>' +
          '<span class="vitem__es">' + esc(v.es) + '</span>' +
        '</span>' +
        '<span class="vitem__unidad">unidad ' + esc(v.unidad) + '</span>' +
        nota +
      '</div>';
    }).join('') + '</div>';
  }

  function pantallaDiccionario() {
    el.topbarTitle.textContent = 'Diccionario';
    pintarDiccionario(el.dictInput.value);
    mostrar('dict');
  }

  // ─────────── Práctica ───────────

  /* La práctica de unidad sigue siendo la unidad entera y en orden
     barajado: es la primera pasada, aquí no hay nada que dosificar.
     Lo que sí hace es alimentar el calendario, para que el repaso
     posterior sepa qué se falló. */
  function empezarPractica() {
    var u = estado.unidad;
    estado.modo = 'unidad';
    estado.ejercicios = barajar(u.ejercicios).map(function (g) {
      return prepararVariante(g, null);
    });
    guardarProgreso();
    estado.indice = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    el.topbarTitle.textContent = u.titulo;
    mostrar('quiz');
    pintarEjercicio();
  }

  function actualizarBarra() {
    var total = estado.ejercicios.length;
    var pct = (estado.indice / total) * 100;
    el.progressbarFill.style.width = pct + '%';
    el.hearts.innerHTML = '<b>' + estado.aciertos + '</b>/' + total;
  }

  function pintarEjercicio() {
    estado.resuelto = false;
    estado.sel = null;
    el.btnCheck.textContent = 'Comprobar';
    el.btnCheck.disabled = true;
    ocultarFeedback();
    actualizarBarra();

    var ej = estado.ejercicios[estado.indice];
    if (!ej) { return pantallaResultado(); }

    switch (ej.tipo) {
      case 'opcion':   pintarOpcion(ej); break;
      case 'pares':    pintarPares(ej); break;
      case 'orden':    pintarOrden(ej); break;
      case 'traducir': pintarTraducir(ej); break;
      default:         siguiente();
    }

    // En los repasos conviene saber de qué unidad sale cada pregunta.
    if (estado.modo !== 'unidad' && ej.__unidad) {
      var marca = document.createElement('p');
      marca.className = 'q__from';
      marca.textContent = ej.__unidad;
      el.quizContent.insertBefore(marca, el.quizContent.firstChild);
    }

    window.scrollTo(0, 0);
  }

  // — Opción múltiple —

  function pintarOpcion(ej) {
    var letras = ['A', 'B', 'C', 'D', 'E', 'F'];
    var orden = barajar(ej.opciones.map(function (txt, i) { return { txt: txt, i: i }; }));

    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      '<h2 class="q__prompt q__prompt--es">' + esc(ej.pregunta) + '</h2>' +
      '<div class="opts" id="opts">' + orden.map(function (o, n) {
        return '<button class="opt" type="button" aria-pressed="false" data-i="' + o.i + '">' +
          '<span class="opt__key">' + letras[n] + '</span>' +
          '<span>' + esc(o.txt) + '</span>' +
        '</button>';
      }).join('') + '</div>';

    $('opts').addEventListener('click', function (e) {
      var btn = e.target.closest('.opt');
      if (!btn || estado.resuelto) return;
      Array.prototype.forEach.call(this.children, function (b) {
        b.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('aria-pressed', 'true');
      estado.sel = parseInt(btn.dataset.i, 10);
      el.btnCheck.disabled = false;
    });
  }

  function corregirOpcion(ej) {
    var ok = estado.sel === ej.correcta;
    Array.prototype.forEach.call($('opts').children, function (b) {
      var i = parseInt(b.dataset.i, 10);
      b.disabled = true;
      if (i === ej.correcta) b.classList.add('is-ok');
      else if (i === estado.sel) b.classList.add('is-mal');
    });
    var cuerpo = ej.explicacion ? ej.explicacion : '';
    if (!ok) {
      cuerpo = '<span class="sol">' + esc(ej.opciones[ej.correcta]) + '</span>' +
               (ej.explicacion ? '<br>' + ej.explicacion : '');
    }
    return { ok: ok, cuerpo: cuerpo };
  }

  // — Emparejar —

  function pintarPares(ej) {
    var eus = barajar(ej.pares.map(function (p, i) { return { txt: p.eu, i: i }; }));
    var ess = barajar(ej.pares.map(function (p, i) { return { txt: p.es, i: i }; }));

    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      '<h2 class="q__prompt q__prompt--es">Toca las parejas</h2>' +
      '<div class="pairs">' +
        '<div class="paircol" id="colEu">' + eus.map(function (o) {
          return '<button class="pair pair--eu" type="button" aria-pressed="false" data-i="' + o.i + '">' + esc(o.txt) + '</button>';
        }).join('') + '</div>' +
        '<div class="paircol" id="colEs">' + ess.map(function (o) {
          return '<button class="pair pair--es" type="button" aria-pressed="false" data-i="' + o.i + '">' + esc(o.txt) + '</button>';
        }).join('') + '</div>' +
      '</div>';

    var selEu = null, selEs = null, resueltas = 0, errores = 0;
    var total = ej.pares.length;

    function limpiarSel() {
      if (selEu) selEu.setAttribute('aria-pressed', 'false');
      if (selEs) selEs.setAttribute('aria-pressed', 'false');
      selEu = null; selEs = null;
    }

    function intentar() {
      if (!selEu || !selEs) return;
      var a = selEu, b = selEs;
      if (a.dataset.i === b.dataset.i) {
        a.classList.add('is-ok'); b.classList.add('is-ok');
        a.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-pressed', 'false');
        selEu = null; selEs = null;
        resueltas++;
        if (resueltas === total) {
          resolver(errores === 0,
            errores === 0 ? '¡Todas bien!' : 'Completado',
            errores === 0 ? '' : 'Has necesitado ' + errores + (errores === 1 ? ' intento extra.' : ' intentos extra.'));
        }
      } else {
        errores++;
        vibrar(35);
        a.classList.add('is-mal'); b.classList.add('is-mal');
        setTimeout(function () {
          a.classList.remove('is-mal'); b.classList.remove('is-mal');
        }, 320);
        limpiarSel();
      }
    }

    function handler(esEu) {
      return function (e) {
        var btn = e.target.closest('.pair');
        if (!btn || btn.classList.contains('is-ok') || estado.resuelto) return;
        var actual = esEu ? selEu : selEs;
        if (actual === btn) { btn.setAttribute('aria-pressed', 'false'); if (esEu) selEu = null; else selEs = null; return; }
        if (actual) actual.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-pressed', 'true');
        if (esEu) selEu = btn; else selEs = btn;
        intentar();
      };
    }

    $('colEu').addEventListener('click', handler(true));
    $('colEs').addEventListener('click', handler(false));

    // Este tipo se autocorrige al emparejar las cuatro; no hay botón que pulsar.
    el.btnCheck.disabled = true;
    el.btnCheck.textContent = 'Empareja las cuatro parejas';
  }

  // — Ordenar palabras —

  function pintarOrden(ej) {
    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      '<h2 class="q__prompt q__prompt--es">' + esc(ej.es) + '</h2>' +
      '<div class="build" id="build"></div>' +
      '<div class="bank" id="bank">' + barajar(ej.palabras).map(function (p, i) {
        return '<button class="chip" type="button" data-p="' + esc(p) + '" data-k="' + i + '">' + esc(p) + '</button>';
      }).join('') + '</div>';

    var build = $('build'), bank = $('bank');

    function refrescar() {
      el.btnCheck.disabled = build.children.length === 0;
    }

    bank.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c || c.classList.contains('is-used') || estado.resuelto) return;
      c.classList.add('is-used');
      var clon = document.createElement('button');
      clon.type = 'button';
      clon.className = 'chip chip--in';
      clon.textContent = c.dataset.p;
      clon.dataset.k = c.dataset.k;
      build.appendChild(clon);
      refrescar();
    });

    build.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c || estado.resuelto) return;
      var origen = bank.querySelector('.chip[data-k="' + c.dataset.k + '"]');
      if (origen) origen.classList.remove('is-used');
      c.remove();
      refrescar();
    });
  }

  function corregirOrden(ej) {
    var construido = Array.prototype.map.call($('build').children, function (c) { return c.textContent; }).join(' ');
    var ok = normalizar(construido) === normalizar(ej.eu);
    return {
      ok: ok,
      cuerpo: ok ? '' : '<span class="sol">' + esc(ej.eu) + '</span>'
    };
  }

  // — Escribir la traducción —

  function pintarTraducir(ej) {
    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      '<h2 class="q__prompt q__prompt--es">' + esc(ej.es) + '</h2>' +
      (ej.pista ? '<p class="q__hint">' + esc(ej.pista) + '</p>' : '') +
      '<textarea class="typebox" id="typebox" rows="2" autocomplete="off" autocorrect="off" ' +
      'autocapitalize="off" spellcheck="false" placeholder="Escribe aquí en euskera…"></textarea>';

    var ta = $('typebox');
    ta.addEventListener('input', function () {
      el.btnCheck.disabled = ta.value.trim().length === 0;
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (!el.btnCheck.disabled) el.btnCheck.click(); }
    });
  }

  function corregirTraducir(ej) {
    var dado = normalizar($('typebox').value);
    var ok = ej.respuestas.some(function (r) { return normalizar(r) === dado; });
    $('typebox').blur();
    return {
      ok: ok,
      cuerpo: ok ? '' : 'La respuesta correcta era:<span class="sol">' + esc(ej.respuestas[0]) + '</span>'
    };
  }

  // — Comprobar —

  function comprobar() {
    var ej = estado.ejercicios[estado.indice];
    if (estado.resuelto) return siguiente();

    var r;
    if (ej.tipo === 'opcion')        r = corregirOpcion(ej);
    else if (ej.tipo === 'orden')    r = corregirOrden(ej);
    else if (ej.tipo === 'traducir') r = corregirTraducir(ej);
    else return;

    resolver(r.ok, r.ok ? 'Oso ondo!' : 'No exactamente', r.cuerpo);
  }

  /* Único punto por el que pasa toda respuesta, venga del botón de
     comprobar o del emparejado, que se autocorrige. Es aquí donde el
     calendario se entera de si se ha acertado. */
  function resolver(ok, titulo, cuerpo) {
    var ej = estado.ejercicios[estado.indice];
    estado.resuelto = true;
    if (ej && ej.__clave) anotar(ej.__clave, ok);
    if (!ok && ej && ej.__palabra) estado.falladas.push(ej.__palabra);
    registrar(ok);
    feedback(ok, titulo, cuerpo);
  }

  function registrar(ok) {
    if (ok) { estado.aciertos++; } else { estado.fallos++; vibrar(45); }
    actualizarBarra();
  }

  function siguiente() {
    estado.indice++;
    if (estado.indice >= estado.ejercicios.length) {
      pantallaResultado();
    } else {
      pintarEjercicio();
    }
  }

  // ─────────── Feedback ───────────

  function feedback(ok, titulo, cuerpo) {
    el.feedback.className = 'feedback ' + (ok ? 'is-ok-fb' : 'is-mal-fb');
    el.feedback.hidden = false;
    el.feedbackIcon.textContent = ok ? '✓' : '✕';
    el.feedbackTitle.textContent = titulo;
    el.feedbackBody.innerHTML = cuerpo || '';
    el.actionbar.hidden = true;
    el.feedbackNext.textContent =
      (estado.indice === estado.ejercicios.length - 1) ? 'Ver resultado' : 'Continuar';
  }

  function ocultarFeedback() {
    el.feedback.hidden = true;
    if (estado.pantalla === 'quiz') el.actionbar.hidden = false;
  }

  // ─────────── Pantalla: resultado ───────────

  function pantallaResultado() {
    var u = estado.unidad;
    var total = estado.ejercicios.length;
    var ratio = total ? estado.aciertos / total : 0;

    // Los repasos no pertenecen a ninguna unidad, así que no marcan nada
    // como completado: solo te dicen cómo ha ido. Lo que sí han hecho,
    // pregunta a pregunta, es mover el calendario.
    if (estado.modo === 'unidad') {
      var p = progUnidad(u.id);
      p.intentos++;
      p.mejor = Math.max(p.mejor, ratio);
      if (ratio >= 0.7) p.completada = true;
      guardarProgreso();
    }

    var titulo, sub;
    if (estado.modo === 'repaso') {
      if (ratio === 1)       { titulo = 'Bikain!';   sub = 'Perfecto. No se te ha escapado nada.'; }
      else if (ratio >= 0.8) { titulo = 'Oso ondo!'; sub = 'Muy bien. Lo de atrás sigue en su sitio.'; }
      else if (ratio >= 0.5) { titulo = 'Ondo!';     sub = 'Bien. Alguna unidad pide una segunda vuelta.'; }
      else                   { titulo = 'Ia-ia…';    sub = 'Vuelve a las unidades que más se te han atragantado.'; }
    }
    else if (estado.modo === 'vocab') {
      if (ratio === 1)       { titulo = 'Bikain!';   sub = 'Perfecto. Te las sabes todas.'; }
      else if (ratio >= 0.8) { titulo = 'Oso ondo!'; sub = 'Muy bien. Las falladas volverán pronto.'; }
      else if (ratio >= 0.5) { titulo = 'Ondo!';     sub = 'Bien. Date una vuelta por el diccionario.'; }
      else                   { titulo = 'Ia-ia…';    sub = 'Estas palabras piden otra lectura del vocabulario.'; }
    }
    else if (ratio === 1)   { titulo = 'Bikain!';   sub = 'Perfecto. Todas correctas.'; }
    else if (ratio >= 0.8)  { titulo = 'Oso ondo!'; sub = 'Muy bien. Dominas esta unidad.'; }
    else if (ratio >= 0.7)  { titulo = 'Ondo!';     sub = 'Bien. Unidad superada.'; }
    else                    { titulo = 'Ia-ia…';    sub = 'Casi. Repasa la gramática y vuelve a intentarlo.'; }

    // Tras el vocabulario, la lista de lo fallado: es lo único que hay
    // que mirar antes de cerrar, y evita ir a buscarlo al diccionario.
    var repaso = '';
    if (estado.modo === 'vocab' && estado.falladas.length) {
      repaso = '<div class="result__miss">' +
        '<p class="footnav__head">Se te han escapado</p>' +
        '<div class="vocabgroup">' + estado.falladas.map(function (v) {
          return '<div class="vitem"><span class="vitem__row">' +
            '<span class="vitem__eu">' + esc(v.eu) + '</span>' +
            '<span class="vitem__es">' + esc(v.es) + '</span>' +
          '</span></div>';
        }).join('') + '</div></div>';
    }

    var acciones;
    if (estado.modo === 'repaso') {
      acciones = '<button class="btn btn--primary" id="rRepetir">Otra ronda de repaso</button>' +
                 '<button class="btn btn--ghost" id="rHome">Volver al inicio</button>';
    } else if (estado.modo === 'vocab') {
      acciones = '<button class="btn btn--primary" id="rRepetir">Otras palabras</button>' +
                 '<button class="btn btn--ghost" id="rDicc">Abrir el diccionario</button>' +
                 '<button class="btn btn--ghost" id="rHome">Volver al inicio</button>';
    } else {
      acciones = '<button class="btn btn--primary" id="rRepetir">Repetir la unidad</button>' +
                 '<button class="btn btn--ghost" id="rGram">Repasar la gramática</button>' +
                 '<button class="btn btn--ghost" id="rHome">Volver al inicio</button>';
    }

    el.topbarTitle.textContent = 'Resultado';
    el.resultContent.innerHTML =
      '<div class="result__mark"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<h1 class="result__title">' + esc(titulo) + '</h1>' +
      '<p class="result__sub">' + esc(sub) + '</p>' +
      '<div class="result__score">' +
        '<div class="scorebox scorebox--ok"><span class="scorebox__num">' + estado.aciertos + '</span><span class="scorebox__lbl">aciertos</span></div>' +
        '<div class="scorebox scorebox--mal"><span class="scorebox__num">' + estado.fallos + '</span><span class="scorebox__lbl">fallos</span></div>' +
        '<div class="scorebox"><span class="scorebox__num">' + Math.round(ratio * 100) + '</span><span class="scorebox__lbl">por ciento</span></div>' +
      '</div>' +
      repaso +
      '<div class="result__actions">' + acciones + '</div>';

    mostrar('result');

    var otra = estado.modo === 'repaso' ? empezarRepaso
             : estado.modo === 'vocab'  ? empezarVocab
             : empezarPractica;
    $('rRepetir').addEventListener('click', otra);
    if ($('rGram')) $('rGram').addEventListener('click', pantallaGramatica);
    if ($('rDicc')) $('rDicc').addEventListener('click', pantallaDiccionario);
    $('rHome').addEventListener('click', pantallaHome);
  }

  // ─────────── Eventos globales ───────────

  el.btnBack.addEventListener('click', atras);
  el.btnCheck.addEventListener('click', comprobar);
  el.feedbackNext.addEventListener('click', siguiente);

  $('goRepaso').addEventListener('click', empezarRepaso);
  $('goVocabRepaso').addEventListener('click', empezarVocab);
  $('goDicc').addEventListener('click', pantallaDiccionario);
  el.dictInput.addEventListener('input', function () {
    pintarDiccionario(this.value);
  });
  activarAudioEnLista(el.vocabContent);
  activarAudioEnLista(el.dictContent);
  activarAudioEnLista(el.gramContent);

  $('goGramatica').addEventListener('click', pantallaGramatica);
  $('goVocab').addEventListener('click', pantallaVocabulario);
  $('goPractica').addEventListener('click', empezarPractica);

  // Al pie de cada lectura, las dos salidas posibles
  $('gramPractica').addEventListener('click', empezarPractica);
  $('gramVocab').addEventListener('click', pantallaVocabulario);
  $('vocabPractica').addEventListener('click', empezarPractica);
  $('vocabGram').addEventListener('click', pantallaGramatica);

  $('btnReset').addEventListener('click', function () {
    if (confirm('¿Borrar todo tu progreso? Se pierden también las fechas de repaso. No se puede deshacer.')) {
      progreso = progresoVacio();
      if (guardarTimer) { clearTimeout(guardarTimer); guardarTimer = null; }
      guardarProgresoAhora();
      try { localStorage.removeItem(CLAVE); localStorage.removeItem(CLAVE_VIEJA); } catch (e) {}
      pantallaHome();
    }
  });

  el.unitList.addEventListener('click', function (e) {
    var btn = e.target.closest('.unitcard');
    if (!btn) return;
    var u = CURSO.unidades.filter(function (x) { return x.id === btn.dataset.unidad; })[0];
    if (u) pantallaUnidad(u);
  });

  // Atajos de teclado para quien use ordenador
  document.addEventListener('keydown', function (e) {
    if (estado.pantalla !== 'quiz') return;
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!el.feedback.hidden) el.feedbackNext.click();
      else if (!el.btnCheck.disabled) el.btnCheck.click();
    }
    var opts = document.getElementById('opts');
    if (opts && /^[1-4]$/.test(e.key)) {
      var b = opts.children[parseInt(e.key, 10) - 1];
      if (b && !b.disabled) b.click();
    }
  });

  // ─────────── Arranque ───────────

  function errorDeCarga(msg) {
    el.screenAuth.hidden = true;
    document.getElementById('screenHome').innerHTML =
      '<div class="gcard" style="margin-top:40px">' +
      '<h2 class="gcard__title">No se ha podido cargar el curso</h2>' +
      '<div class="gcard__body"><p>' + esc(msg) + '</p>' +
      '<p>Si has abierto <b>index.html</b> haciendo doble clic, el navegador bloquea la lectura de los archivos de <b>data/</b> por seguridad. ' +
      'Sube la carpeta a tu servidor, o arranca uno local desde la carpeta del proyecto:</p>' +
      '<p><i>python3 -m http.server 8000</i></p>' +
      '<p>y abre <i>http://localhost:8000</i>.</p></div></div>';
    document.getElementById('screenHome').hidden = false;
  }

  function traer(ruta) {
    return fetch(ruta, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' al pedir ' + ruta);
      return r.json();
    });
  }

  /* El índice (data/curso.json) lista los archivos de cada unidad, que
     viven en data/unidades/. Así se puede añadir o reordenar temario sin
     tocar un archivo gigante. En modo gernikes se lee data/curso-gernikes.json,
     que apunta a data/unidades-gernikes/ — el contenido original de Ric.
     La versión de un solo archivo deja el curso ya montado en
     window.__CURSO__, y entonces no hace falta pedir nada (no se usa en
     modo gernikes). */
  function cargarCurso() {
    if (window.__CURSO__ && MODO_DIALECTO === 'bizkaiera') return Promise.resolve(window.__CURSO__);
    var indicePath = MODO_DIALECTO === 'gernikes' ? 'data/curso-gernikes.json' : 'data/curso.json';
    return traer(indicePath).then(function (indice) {
      return Promise.all(indice.unidades.map(function (ruta) {
        return traer('data/' + ruta);
      })).then(function (unidades) {
        return { meta: indice.meta, unidades: unidades };
      });
    });
  }

  /* Cambia de variante dialectal, recarga el curso entero y refresca la
     pantalla actual (con progreso intacto: la variante no toca `progreso`,
     solo qué vocabulario/gramática se muestra). */
  function cambiarDialecto(modo) {
    if (modo === MODO_DIALECTO) return;
    MODO_DIALECTO = modo;
    try { localStorage.setItem(CLAVE_DIALECTO, modo); } catch (e) {}
    pintarDialecto();
    DICC = null; // el diccionario se reconstruye del CURSO nuevo
    cargarCurso().then(function (curso) {
      CURSO = curso;
      var pantallaActual = estado.pantalla;
      if (pantallaActual === 'unit' && estado.unidad) {
        var u = CURSO.unidades.filter(function (x) { return x.id === estado.unidad.id; })[0];
        if (u) { pantallaUnidad(u); return; }
      }
      pantallaHome();
    });
  }

  function pintarDialecto() {
    var spans = el.btnDialecto.querySelectorAll('.dialecto__opt');
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.toggle('is-activo', spans[i].dataset.modo === MODO_DIALECTO);
    }
  }

  el.btnDialecto.addEventListener('click', function () {
    cambiarDialecto(MODO_DIALECTO === 'bizkaiera' ? 'gernikes' : 'bizkaiera');
  });
  pintarDialecto();

  // ─────────── Acceso (magic link) ───────────

  function mostrarAuth() {
    el.screenAuth.hidden = false;
    for (var k in el.screens) el.screens[k].hidden = true;
  }

  function mensajeAuth(texto, esError) {
    el.authMsg.textContent = texto;
    el.authMsg.hidden = !texto;
    el.authMsg.classList.toggle('is-mal', !!esError);
  }

  el.authForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = el.authEmail.value.trim();
    if (!email) return;
    el.authSubmit.disabled = true;
    mensajeAuth('Enviando…', false);
    sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    }).then(function (r) {
      el.authSubmit.disabled = false;
      if (r.error) { mensajeAuth(r.error.message, true); return; }
      mensajeAuth('Enlace enviado a ' + email + '. Revisa tu correo.', false);
    });
  });

  var arrancado = false;

  function arrancarApp() {
    if (arrancado) return;
    arrancado = true;
    el.screenAuth.hidden = true;
    Promise.all([cargarCurso(), cargarProgreso()])
      .then(function (r) {
        CURSO = r[0];
        progreso = r[1];
        document.title = CURSO.meta.titulo + ' · Aprende euskera desde cero';
        pantallaHome();
      })
      .catch(function (err) {
        errorDeCarga(String(err.message || err));
      });
  }

  // onAuthStateChange dispara una vez con la sesión inicial (o null) al
  // registrar el listener, y luego en cada login/logout/refresco de token.
  sb.auth.onAuthStateChange(function (event, session) {
    if (session) {
      usuarioId = session.user.id;
      arrancarApp();
    } else if (event !== 'INITIAL_SESSION' || !arrancado) {
      arrancado = false;
      usuarioId = null;
      mostrarAuth();
    }
  });

})();
