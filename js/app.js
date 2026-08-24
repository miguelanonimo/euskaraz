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
  var LARGO_VOCAB  = 14;   // palabras por sesión de repaso de vocabulario
  var ESCUCHAR_PRACTICA = 2;  // preguntas de escuchar que se cuelan en la práctica de una unidad
  var ESCUCHAR_REPASO   = 3;  // preguntas de escuchar que se cuelan en el repaso mezclado

  // Motor de repaso de vocabulario (aportado por Ric): la sesión es una
  // cola que no se vacía hasta que cada palabra se acierta dos veces, la
  // segunda a distancia — ver empezarVocab/resolverVocab/avanzarVocab.
  var DIST_CERCA = [2, 3, 4];  // tras fallar, a cuántos ejercicios vuelve
  var DIST_LEJOS = [6, 7, 8];  // tras acertar una vez, la comprobación final
  var MAX_FALLOS = 6;          // tope de piedad: a la séptima, la palabra sale igual

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
  var progresoActualizadoEn = null;  // updated_at de la fila tal como la leímos, para no pisar un guardado más reciente de otro aparato

  // ─────────── Atajos al DOM ───────────

  function $(id) { return document.getElementById(id); }

  var el = {
    topbarTitle: $('topbarTitle'),
    btnBack: $('btnBack'),
    progressbar: $('progressbar'),
    progressbarFill: $('progressbarFill'),
    hearts: $('hearts'),
    btnDialecto: $('btnDialecto'),
    btnCuenta:  $('btnCuenta'),
    screenAuth: $('screenAuth'),
    authForm:   $('authForm'),
    authEmail:  $('authEmail'),
    authPassword: $('authPassword'),
    authSubmit: $('authSubmit'),
    authToggle: $('authToggle'),
    authOlvido: $('authOlvido'),
    authSub:    $('authSub'),
    authMsg:    $('authMsg'),
    cuentaEmail:  $('cuentaEmail'),
    formPassword: $('formPassword'),
    nuevaPassword: $('nuevaPassword'),
    cuentaMsg:    $('cuentaMsg'),
    btnCerrarSesion: $('btnCerrarSesion'),
    modoSilencioso: $('modoSilencioso'),
    incluirDialectales: $('incluirDialectales'),
    screens: {
      home:   $('screenHome'),
      unit:   $('screenUnit'),
      gram:   $('screenGram'),
      vocab:  $('screenVocab'),
      dict:   $('screenDict'),
      quiz:   $('screenQuiz'),
      result: $('screenResult'),
      cuenta: $('screenCuenta')
    },
    unitList:        $('unitList'),
    todayCount:      $('todayCount'),
    goLeccion:       $('goLeccion'),
    leccionTitulo:   $('leccionTitulo'),
    leccionSub:      $('leccionSub'),
    repasoCount:     $('repasoCount'),
    repasoDue:       $('repasoDue'),
    vocabRepasoCount:$('vocabRepasoCount'),
    vocabRepasoDue:  $('vocabRepasoDue'),
    diccCount:       $('diccCount'),
    dictInput:     $('dictInput'),
    dictLetras:    $('dictLetras'),
    dictCat:       $('dictCat'),
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
    vocabUnitCat:  $('vocabUnitCat'),
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

  /* Modo silencioso: preferencia de este aparato, no de la cuenta (no
     viaja con progreso a Supabase) — se puede querer sonido en el
     ordenador y silencio en el móvil. reproducir() es el único sitio
     por el que pasa TODO el audio de la app (botones de Vocabulario/
     Diccionario/Gramática, toca las parejas, el prompt de escuchar, el
     audio al acertar) — cortarlo aquí basta para silenciar de verdad,
     sin tener que acordarse de cada llamante. Los iconos de play se
     esconden aparte, por CSS (clase `silencioso` en <body>). */
  var MODO_SILENCIOSO_KEY = 'euskaraz_modo_silencioso';
  var modoSilencioso = false;
  try { modoSilencioso = localStorage.getItem(MODO_SILENCIOSO_KEY) === '1'; } catch (e) {}

  function aplicarModoSilencioso() {
    document.body.classList.toggle('silencioso', modoSilencioso);
  }

  function setModoSilencioso(on) {
    modoSilencioso = !!on;
    try { localStorage.setItem(MODO_SILENCIOSO_KEY, modoSilencioso ? '1' : '0'); } catch (e) {}
    aplicarModoSilencioso();
  }

  /* Incluir variantes dialectales en el repaso: preferencia de este
     aparato, igual que el modo silencioso. Por defecto apagado —el
     repaso solo prueba la forma batua de cada palabra, y las variantes
     (aupa, zelan zagoz…) se quedan como lo que son en Vocabulario/
     Diccionario, formas para leer, no para que te examinen de ellas—
     hasta que el usuario decide activamente que también quiere que le
     pregunten en bizkaiera. */
  var INCLUIR_DIALECTALES_KEY = 'euskaraz_incluir_dialectales';
  var incluirDialectales = false;
  try { incluirDialectales = localStorage.getItem(INCLUIR_DIALECTALES_KEY) === '1'; } catch (e) {}

  function setIncluirDialectales(on) {
    incluirDialectales = !!on;
    try { localStorage.setItem(INCLUIR_DIALECTALES_KEY, incluirDialectales ? '1' : '0'); } catch (e) {}
  }

  /* Todas las formas de una entrada de vocabulario que entran en juego
     para el repaso: solo la batua, o la batua más sus variantes cuando
     el switch está activado. La variante hereda `es`/`unidad`/`titulo`
     del padre —significa lo mismo, solo cambia la forma euskera—, y se
     le añade `categoria` por si falta, para no romper el filtro de
     Vocabulario. */
  function formasDe(v, unidad, titulo) {
    var base = { eu: v.eu, es: v.es, nota: v.nota, audio: v.audio, registro: v.registro,
                 categoria: v.categoria || 'otros', unidad: unidad, titulo: titulo };
    if (!incluirDialectales || !v.variantes || !v.variantes.length) return [base];
    return [base].concat(v.variantes.map(function (variante) {
      return { eu: variante.eu, es: v.es, nota: variante.nota, audio: variante.audio,
               registro: variante.registro, categoria: variante.categoria || base.categoria,
               unidad: unidad, titulo: titulo };
    }));
  }

  /* "Qué toca hoy" (home) necesita saber si ya se practicó la lección
     de turno HOY — algo que el progreso por unidad no guarda (solo
     sabe cuántos intentos y la mejor nota, nunca cuándo). Un aparato,
     una sola fecha guardada: basta con comparar contra `hoy()`, así
     que no hace falta limpiar nada al cambiar de día, simplemente deja
     de coincidir. No cuenta la nota — practicar hoy vale, acierte lo
     que acierte; para eso ya está `completada` aparte. */
  var HOY_LECCION_KEY = 'euskaraz_hoy_leccion';

  function marcarLeccionHoy(unidadId) {
    try { localStorage.setItem(HOY_LECCION_KEY, hoy() + ':' + unidadId); } catch (e) {}
  }

  function leccionHechaHoy(unidadId) {
    var v;
    try { v = localStorage.getItem(HOY_LECCION_KEY); } catch (e) { return false; }
    return v === (hoy() + ':' + unidadId);
  }

  function botonAudio(v) {
    if (!v.audio) return '';
    return botonAudioTexto(v.eu, v.audio);
  }

  function botonAudioTexto(texto, audio) {
    return '<button class="vitem__play" type="button" data-audio="' + esc(audio) + '" aria-label="Escuchar «' + esc(texto) + '»">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 010 8"/></svg>' +
      '</button>';
  }

  /* En la gramática, las listas de vocabulario nuevo se escriben a mano
     como prosa con <b>palabra</b> — no como `ejemplos` estructurados,
     que llevan otro layout. En vez de tocar los 12 JSON a mano, se
     detecta cada <b> cuyo texto coincide con una palabra narrada
     (audioDePalabra) y se le cuelga el mismo botón de audio que ya usa
     vocabulario/diccionario. Si el <b> es énfasis de una regla, no de
     una palabra, no hay match y no se toca nada. */
  function enriquecerCuerpoConAudio(html) {
    return html.replace(/<b>([^<]+)<\/b>/g, function (m, texto) {
      var audio = audioDePalabra(texto);
      return audio ? m + botonAudioTexto(texto, audio) : m;
    });
  }

  /* Solo se rebobina si es la MISMA pista que ya estaba puesta —para
     que tocar dos veces seguidas la misma palabra la reinicie—. Con una
     pista nueva no hace falta: ya empieza en 0. Ponerlo siempre, sin
     esta condición, provocaba un recorte audible al principio la
     primera vez que sonaba cada palabra (el audio aún no tiene
     metadata cargada — readyState 0— cuando se le pide el seek a 0, así
     que el navegador lo deja pendiente y lo aplica de golpe justo
     cuando arranca a sonar). A partir de la segunda vez el archivo ya
     está en caché y el fallo no se nota, lo que despistaba. */
  function reproducir(ruta) {
    if (modoSilencioso) return;
    var url = AUDIO_BASE + ruta;
    if (reproductor.src === url) reproductor.currentTime = 0;
    else reproductor.src = url;
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
      .select('data, updated_at').single()
      .then(function (r) {
        if (r.error) throw r.error;
        progresoActualizadoEn = r.data.updated_at;
        return datos;
      });
  }

  /* Requiere que usuarioId ya esté fijado (ver onAuthStateChange). */
  function cargarProgreso() {
    return sb.from('euskaraz_progreso').select('data, updated_at').eq('user_id', usuarioId).maybeSingle()
      .then(function (r) {
        if (r.error) throw r.error;
        if (r.data) {
          progresoActualizadoEn = r.data.updated_at;
          return normalizarProgreso(r.data.data);
        }
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

  /* Escritura optimista: solo pisa la fila si sigue teniendo el
     updated_at que leímos por última vez. Si otro aparato/pestaña guardó
     entretanto (nunca a la vez, pero sí una detrás de otra dejando algo
     abierto de fondo), la condición del WHERE no encuentra fila que
     actualizar — en vez de pisarlo a ciegas, recargamos lo que de verdad
     hay en el servidor y adoptamos eso como bueno. */
  function guardarProgresoAhora() {
    guardarTimer = null;
    if (!usuarioId) return;
    var ahora = new Date().toISOString();
    var query = sb.from('euskaraz_progreso').update({ data: progreso, updated_at: ahora }).eq('user_id', usuarioId);
    if (progresoActualizadoEn) query = query.eq('updated_at', progresoActualizadoEn);
    query.select('updated_at').then(function (r) {
      if (r.error) { console.error('Error guardando progreso', r.error); return; }
      if (r.data && r.data.length) { progresoActualizadoEn = ahora; return; }
      // No se actualizó ninguna fila: alguien más guardó primero. Adoptamos su versión.
      cargarProgreso().then(function (p) { progreso = p; });
    });
  }

  // Al cambiar de pantalla o salir, no dejar una escritura pendiente sin mandar.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && guardarTimer) {
      clearTimeout(guardarTimer);
      guardarProgresoAhora();
    }
    // Al volver a una pestaña que llevaba un rato en segundo plano, puede
    // que en otro aparato se haya avanzado desde entonces — adoptamos lo
    // último del servidor antes de que esta pestaña, con datos viejos,
    // pueda llegar a guardar y perder ese avance.
    if (document.visibilityState === 'visible' && usuarioId && !guardarTimer) {
      cargarProgreso().then(function (p) { progreso = p; });
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
    el.btnCuenta.hidden = (nombre !== 'home');
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
      case 'cuenta':
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
      /* Tramos del porcentaje (acordado con Ric): por debajo del 50% no
         se enseña número —el tanteo inicial no se castiga—, del 50 al
         69% se enseña en ámbar como "casi lo tienes", y de ahí para
         arriba ya es la completada de siempre en verde. */
      var meta = p.completada
        ? '<span class="unitcard__meta">' + tickSvg + 'Completada · ' + Math.round(p.mejor * 100) + '%</span>'
        : (p.mejor >= 0.5
            ? '<span class="unitcard__meta unitcard__meta--medio">Mejor intento · ' + Math.round(p.mejor * 100) + '%</span>'
            : (p.visitada
                ? '<span class="unitcard__meta unitcard__meta--pend">Empezada</span>'
                : '<span class="unitcard__meta unitcard__meta--pend">' + u.ejercicios.length + ' ejercicios</span>'));

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

    // ── Qué toca hoy ──
    var checkSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
    var pendientesHoy = 0, totalHoy = 0;

    /* La lección de turno es la primera unidad sin completar (nota
       ≥70% en algún intento) — la que tienes abierta, o si ninguna
       está a medias, la siguiente por hacer. Se acaba el curso cuando
       no queda ninguna: la tarjeta simplemente se oculta. */
    var siguienteUnidad = null;
    for (var iu = 0; iu < CURSO.unidades.length; iu++) {
      if (!progUnidad(CURSO.unidades[iu].id).completada) { siguienteUnidad = CURSO.unidades[iu]; break; }
    }
    if (siguienteUnidad) {
      totalHoy++;
      var leccionHecha = leccionHechaHoy(siguienteUnidad.id);
      if (!leccionHecha) pendientesHoy++;
      el.goLeccion.hidden = false;
      el.goLeccion.dataset.unidad = siguienteUnidad.id;
      el.leccionTitulo.textContent = siguienteUnidad.numero + '. ' + siguienteUnidad.titulo;
      if (leccionHecha) {
        el.leccionSub.innerHTML = checkSvg + '<span>¡Completado!</span>';
        el.leccionSub.className = 'navcard__sub navcard__sub--ok';
      } else if (progUnidad(siguienteUnidad.id).visitada) {
        el.leccionSub.textContent = 'Sigue por donde lo dejaste';
        el.leccionSub.className = 'navcard__sub navcard__sub--progreso';
      } else {
        el.leccionSub.textContent = 'Empieza la lección';
        el.leccionSub.className = 'navcard__sub';
      }
    } else {
      el.goLeccion.hidden = true;
    }

    var vocab = fondoVocabulario();
    if (vocab.length >= 4) {
      totalHoy++;
      var rVo = recuento(vocab, claveDeVocab);
      pintarPendiente(el.vocabRepasoDue, rVo.vencidos);
      if (rVo.vencidos === 0) {
        el.vocabRepasoCount.innerHTML = checkSvg + '<span>¡Completado!</span>';
        el.vocabRepasoCount.className = 'navcard__sub navcard__sub--ok';
      } else {
        pendientesHoy++;
        el.vocabRepasoCount.textContent = frasePendientes(rVo, 'palabra', 'palabras');
        el.vocabRepasoCount.className = 'navcard__sub';
      }
    } else {
      el.vocabRepasoCount.textContent = 'Abre una unidad y aquí tendrás palabras';
      el.vocabRepasoCount.className = 'navcard__sub';
      pintarPendiente(el.vocabRepasoDue, 0);
    }

    var fondo = fondoRepaso();
    if (fondo.length) {
      totalHoy++;
      var rEj = recuento(fondo, claveDeFondo);
      pintarPendiente(el.repasoDue, rEj.vencidos);
      if (rEj.vencidos === 0) {
        el.repasoCount.innerHTML = checkSvg + '<span>¡Completado!</span>';
        el.repasoCount.className = 'navcard__sub navcard__sub--ok';
      } else {
        pendientesHoy++;
        el.repasoCount.textContent = frasePendientes(rEj, 'ejercicio', 'ejercicios');
        el.repasoCount.className = 'navcard__sub';
      }
    } else {
      el.repasoCount.textContent = 'Abre una unidad y aquí tendrás repaso';
      el.repasoCount.className = 'navcard__sub';
      pintarPendiente(el.repasoDue, 0);
    }

    el.todayCount.textContent = totalHoy ? (pendientesHoy + '/' + totalHoy) : '';

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

  /* Calienta la caché del navegador con todo el audio de la unidad en
     cuanto se abre, para que la primera reproducción real (en
     Gramática, Vocabulario o el repaso) no cargue en frío. Sin esperar
     a que termine ni bloquear nada: si una petición falla, no pasa
     nada, simplemente esa palabra tardará como antes la primera vez. */
  function precargarAudio(ruta) {
    if (ruta && !modoSilencioso) fetch(AUDIO_BASE + ruta, { cache: 'force-cache' }).catch(function () {});
  }

  function precargarAudioDeUnidad(u) {
    var rutas = {};
    u.vocabulario.forEach(function (v) {
      if (v.audio) rutas[v.audio] = true;
      (v.variantes || []).forEach(function (variante) { if (variante.audio) rutas[variante.audio] = true; });
    });
    (u.gramatica || []).forEach(function (g) {
      (g.ejemplos || []).forEach(function (e) { if (e.audio) rutas[e.audio] = true; });
    });
    Object.keys(rutas).forEach(precargarAudio);
  }

  function pantallaUnidad(u) {
    estado.unidad = u;
    progUnidad(u.id).visitada = true;
    guardarProgreso();
    precargarAudioDeUnidad(u);

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
        '<div class="gcard__body">' + enriquecerCuerpoConAudio(richText(g.cuerpo)) + '</div>' +
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

  /* Filtro por categoría gramatical del vocabulario de LA unidad
     actual — distinto del "Repasar solo" de la home, que filtra el
     fondo entero del repaso espaciado. Aquí solo cambia qué se ve en
     la lista, no toca el progreso ni el calendario. */
  function pintarVocabulario() {
    var u = estado.unidad;
    var cat = el.vocabUnitCat.value;
    var lista = u.vocabulario.filter(function (v) { return !cat || v.categoria === cat; });
    el.vocabContent.innerHTML = lista.length
      ? '<div class="vocabgroup">' + lista.map(fichaVocabulario).join('') + '</div>'
      : '<p class="q__hint">Ninguna palabra de esta unidad es de ese tipo.</p>';
  }

  function pantallaVocabulario() {
    var u = estado.unidad;
    progUnidad(u.id).vocab = true;
    guardarProgreso();
    el.topbarTitle.textContent = 'Vocabulario · ' + u.titulo;
    el.vocabUnitCat.value = '';
    pintarVocabulario();
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

  /* Las frases de ejemplo de gramática que llevan audio propio también
     entran en el fondo de escuchar — no todo lo que se aprende es una
     palabra suelta, "nire etxe handia" es tan de escuchar como "etxea".
     Mismo shape que fondoVocabulario(), para que candidatosEscuchar()
     no tenga que distinguir de dónde viene cada candidato. */
  function ejemplosConAudio(u) {
    var r = [];
    (u.gramatica || []).forEach(function (g) {
      (g.ejemplos || []).forEach(function (e) {
        if (e.audio) r.push({ eu: e.eu, es: e.es, audio: e.audio, unidad: u.numero, titulo: u.titulo });
      });
    });
    return r;
  }

  function fondoEjemplos() {
    var r = [];
    CURSO.unidades.forEach(function (u) {
      if (!progUnidad(u.id).visitada) return;
      r = r.concat(ejemplosConAudio(u));
    });
    return r;
  }

  /* Qué palabras se convierten en pregunta de escuchar no es azar puro:
     pasa por el mismo elegirSesion() que decide el resto del curso, así
     que prioriza lo vencido y lo nuevo del fondo de vocabulario con
     audio — igual que sortearFormato() ya prioriza por nivel en el
     repaso de vocabulario. Eso sí, nunca compiten por hueco con los
     ejercicios de gramática de la sesión: se añaden aparte, para no
     arriesgar dejar fuera un grupo que tocaría salir igualmente (ver
     discusión: en práctica, unificarlas de verdad podía dejar unidades
     sin cubrir del todo al repetirlas). */
  function candidatosEscuchar(fondo, cuantos) {
    if (modoSilencioso) return [];
    var conAudio = fondo.filter(function (v) { return v.audio; });
    if (conAudio.length < 4) return [];
    var ctx = { fondo: conAudio };
    return elegirSesion(conAudio, cuantos, claveDeVocab).map(function (v) {
      return Math.random() < 0.5 ? preguntaEscucharOpcion(v, ctx) : preguntaEscucharTeclear(v);
    });
  }

  function empezarRepaso() {
    var fondo = fondoRepaso();
    if (!fondo.length) {
      alert('Todavía no has abierto ninguna unidad. Empieza por la primera y luego vuelve aquí.');
      return;
    }
    estado.unidad = null;
    estado.modo = 'repaso';
    var base = elegirSesion(fondo, LARGO_REPASO, claveDeFondo)
      .map(function (x) { return prepararVariante(x.grupo, x.unidad); });
    var extra = candidatosEscuchar(fondoVocabulario().concat(fondoEjemplos()), ESCUCHAR_REPASO);
    estado.ejercicios = barajar(base.concat(extra));
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
  function fondoVocabulario(categoria) {
    var vistas = {}, fondo = [];
    CURSO.unidades.forEach(function (u) {
      if (!progUnidad(u.id).vocab) return;
      u.vocabulario.forEach(function (v) {
        if (categoria && (v.categoria || 'otros') !== categoria) return;
        formasDe(v, u.numero, u.titulo).forEach(function (forma) {
          var k = normalizar(forma.eu);
          if (vistas[k]) return;
          vistas[k] = true;
          fondo.push(forma);
        });
      });
    });
    return fondo;
  }

  function claveDeVocab(v) { return clavePalabra(v.eu); }

  /* ── Los tres formatos (aportado por Ric) ──

     0 · opción múltiple — reconocer la palabra entre cuatro.
     1 · ortografía      — la misma palabra escrita de tres maneras, una
                           buena; hay que ver cuál.
     2 · teclear         — escribirla en euskera desde el castellano.
     3 · escuchar+opción — oír la palabra y elegir qué significa entre
                           cuatro, sin ver el euskera escrito.
     4 · escuchar+teclear— oír la palabra y escribir su traducción al
                           castellano.

     Lo asentada que esté la palabra en el calendario no elige el
     formato: inclina la balanza. Los cinco salen desde el primer día
     —una sesión de un solo formato aburre—, pero una palabra recién
     vista se pregunta sobre todo reconociéndola, y una que ya llevas
     semanas acertando se pregunta sobre todo escribiéndola.

     Cada fila son los pesos de [opción, ortografía, teclear, escuchar
     +opción, escuchar+teclear]. La ortografía va sobreponderada a
     propósito: cerca de la mitad de las palabras del curso no la
     admiten —«ni», «zu», «bai» no tienen dónde equivocarse— y esas
     tiradas se pierden. Los dos formatos de escucha solo se ofrecen a
     palabras con audio narrado (si no lo tienen, caen a opción como el
     resto de formatos sin cumplir requisitos). */
  var MEZCLA = [
    [40, 25, 10, 15, 10],   // nivel 0 · paso 0-1, recién vista
    [20, 35, 15, 15, 15],   // nivel 1 · paso 2-3, en camino
    [10, 25, 35, 15, 15]    // nivel 2 · paso 4 o más, asentada
  ];

  function nivelBase(clave) {
    var f = ficha(clave);
    if (!f) return 0;
    if (f.paso <= 1) return 0;
    if (f.paso <= 3) return 1;
    return 2;
  }

  /* Se evita repetir el formato con el que acabas de fallar: si la
     palabra vuelve, que vuelva preguntada de otra manera. Solo se
     insiste si el sorteo la devuelve dos veces seguidas. */
  function sortearFormato(nivel, evitar) {
    var pesos = MEZCLA[nivel] || MEZCLA[0];
    if (modoSilencioso) pesos = pesos.slice(0, 3);
    var f = tirada(pesos);
    if (f === evitar) f = tirada(pesos);
    return f;
  }

  function tirada(pesos) {
    var suma = 0, i;
    for (i = 0; i < pesos.length; i++) suma += pesos[i];
    var r = Math.random() * suma;
    for (i = 0; i < pesos.length; i++) {
      if (r < pesos[i]) return i;
      r -= pesos[i];
    }
    return pesos.length - 1;
  }

  /* ── Erratas ──

     Reglas de errata: los tropiezos reales de quien escribe euskera
     desde el castellano. La hache que no suena y por eso se cae, las
     tres africadas que se confunden entre sí (tx/tz/ts), z/s/x, la erre
     doble, las sonoras y sordas entre vocales, y la tanda de
     interferencias del castellano —c y qu por k, v por b, ñ por in—.
     El peso es cuántas papeletas mete cada regla en el sorteo.

     Sin lookbehind a propósito: no todos los Safari en uso lo entienden.
     El contexto va en grupos y vuelve por $1/$2. */
  var ERRATAS = [
    [4, /^h/g, ''],                        // hemen → emen
    [4, /([aeiou])h([aeiou])/g, '$1$2'],   // bihar → biar
    [2, /^([aeiou])/g, 'h$1'],             // etorri → hetorri
    [4, /tx/g, 'ts'], [4, /tx/g, 'tz'],
    [4, /tz/g, 'ts'], [4, /tz/g, 'tx'],
    [4, /ts/g, 'tz'], [4, /ts/g, 'tx'],
    [4, /z/g, 's'],
    [4, /s([^t]|$)/g, 'z$1'],
    [2, /x/g, 's'],
    [4, /rr/g, 'r'],                       // ederra → edera
    [3, /([aeiou])r([aeiou])/g, '$1rr$2'], // bera → berra
    [2, /([aeiou])in([aeiou])/g, '$1iñ$2'],
    [1, /([aeiou])il([aeiou])/g, '$1ill$2'],
    [2, /([aeiou])t([aeiou])/g, '$1d$2'],
    [2, /([aeiou])d([aeiou])/g, '$1t$2'],
    [2, /nt/g, 'nd'], [2, /ld/g, 'lt'],
    [2, /([aeiou])g([aeiou])/g, '$1k$2'],
    [2, /([aeiou])k([aeiou])/g, '$1g$2'],
    [2, /([aeiou])p([aeiou])/g, '$1b$2'],
    [2, /([aeiou])b([aeiou])/g, '$1p$2'],
    [2, /([aeiou])l([aeiou])/g, '$1ll$2'],
    [2, /([aeiou])n([aeiou])/g, '$1ñ$2'],
    [1, /k([aou])/g, 'c$1'], [1, /k([ei])/g, 'qu$1'],
    [1, /b/g, 'v']
  ];

  var POOL_ERRATAS = (function () {
    var p = [];
    ERRATAS.forEach(function (r) {
      for (var i = 0; i < r[0]; i++) p.push(r);
    });
    return p;
  })();

  /* La regla se aplica en UNA sola posición, elegida al azar entre las
     que encajan. Cambiar todas las zetas de una palabra a la vez daría
     un adefesio que se descarta de un vistazo; cambiar una sola obliga
     a mirar. */
  function aplicarErrata(w, rx, rep) {
    var ms = [], m;
    rx.lastIndex = 0;
    while ((m = rx.exec(w)) !== null) {
      ms.push(m);
      if (m.index === rx.lastIndex) rx.lastIndex++;
    }
    if (!ms.length) return null;
    var el = ms[Math.floor(Math.random() * ms.length)];
    var sust = rep.replace(/\$(\d)/g, function (_, n) { return el[+n] || ''; });
    return w.slice(0, el.index) + sust + w.slice(el.index + el[0].length);
  }

  /* Todas las grafías buenas del curso, para no ofrecer nunca como
     errata una palabra que existe: «hitz» → «hits» sería una trampa,
     no un error. */
  var GRAFIAS = null;
  function grafiasConocidas() {
    if (GRAFIAS) return GRAFIAS;
    GRAFIAS = {};
    diccionario().forEach(function (v) { GRAFIAS[normalizar(v.eu)] = true; });
    return GRAFIAS;
  }

  function erratasDe(eu, cuantas) {
    var conocidas = grafiasConocidas(), fuera = {}, out = [];
    fuera[normalizar(eu)] = true;
    for (var i = 0; i < 400 && out.length < cuantas; i++) {
      var r = alAzar(POOL_ERRATAS);
      var v = aplicarErrata(eu, r[1], r[2]);
      if (!v || v === eu) continue;
      var k = normalizar(v);
      if (fuera[k] || conocidas[k]) continue;
      fuera[k] = true;
      out.push(v);
    }
    return out;
  }

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
     para no ofrecer dos opciones que dicen lo mismo.

     Y sobre todo: la forma de la respuesta no debe delatarla. Si la
     correcta es «Zer ordu da?» y las otras tres son «el lunes», «la
     semana» y «el jueves», se acierta sin saber la palabra, solo por la
     silueta —la única con signo de interrogación—. Así que los
     candidatos se agrupan por forma (pregunta / frase de varias palabras
     / palabra suelta) y se prefieren los de la misma que la respuesta,
     sin perder dentro de cada grupo la preferencia por la misma unidad.
     Cuando el fondo abierto no da ninguno igual —al principio del curso
     hay pocas palabras, y hay unidades con una sola pregunta— se rellena
     como antes: mejor una opción de otra forma que quedarse sin
     pregunta. */
  function formaDe(txt) {
    var t = String(txt).trim();
    if (t.slice(-1) === '?') return 'pregunta';
    return /\s/.test(t) ? 'frase' : 'palabra';
  }

  function preguntaOpcion(entrada, ctx) {
    var aEuskera = Math.random() < 0.5 && !ctx.ambiguas[normalizar(entrada.es)];
    var campo    = aEuskera ? 'eu' : 'es';
    var correcta = entrada[campo];
    var forma    = formaDe(correcta);
    var yaPuesto = {};
    yaPuesto[normalizar(correcta)] = true;

    // 0: misma forma y unidad · 1: misma forma · 2: misma unidad · 3: resto
    var grupos = [[], [], [], []];
    ctx.fondo.forEach(function (v) {
      if (v === entrada) return;
      var txt = normalizar(v[campo]);
      if (yaPuesto[txt]) return;
      var mismaForma  = formaDe(v[campo]) === forma;
      var mismaUnidad = v.unidad === entrada.unidad;
      grupos[(mismaForma ? 0 : 2) + (mismaUnidad ? 0 : 1)].push(v);
    });

    var candidatos = [];
    grupos.forEach(function (g) { candidatos = candidatos.concat(barajar(g)); });

    var opciones = [correcta];
    candidatos.some(function (v) {
      var txt = normalizar(v[campo]);
      if (yaPuesto[txt]) return false;
      yaPuesto[txt] = true;
      opciones.push(v[campo]);
      return opciones.length === 4;
    });

    return marcarVocab({
      tipo: 'opcion',
      instruccion: aEuskera ? 'Vocabulario · ¿cómo se dice?' : 'Vocabulario · ¿qué significa?',
      pregunta: aEuskera ? entrada.es : entrada.eu,
      opciones: opciones,
      correcta: 0,
      explicacion: entrada.nota || ''
    }, entrada);
  }

  /* Misma palabra, tres grafías. Solo tiene sentido si las reglas dan al
     menos dos erratas distintas y creíbles; si no —palabras cortas, o
     sin ninguna letra conflictiva— devuelve null y quien llama busca
     otro formato. Tres opciones y no cuatro: preferimos una menos a
     rellenar con un disparate. */
  function preguntaOrtografia(entrada) {
    if (entrada.eu.replace(/\s/g, '').length < 5) return null;
    var mal = erratasDe(entrada.eu, 2);
    if (mal.length < 2) return null;
    var q = marcarVocab({
      tipo: 'opcion',
      instruccion: 'Vocabulario · ¿cuál está bien escrita?',
      pregunta: entrada.es,
      opciones: [entrada.eu].concat(mal),
      correcta: 0,
      explicacion: entrada.nota || ''
    }, entrada);
    q.__grafia = true;   // al fallar no basta con la solución: hay que ver la letra
    return q;
  }

  /* Escribirla. Si el castellano vale para más de una palabra en
     euskera se aceptan todas: la pregunta es ambigua, no la respuesta. */
  function preguntaTeclear(entrada, ctx) {
    var k = normalizar(entrada.es);
    return marcarVocab({
      tipo: 'teclear',
      instruccion: 'Vocabulario · escríbelo en euskera',
      pregunta: entrada.es,
      respuestas: (ctx.porEs[k] && ctx.porEs[k].length) ? ctx.porEs[k] : [entrada.eu],
      solucion: entrada.eu,
      explicacion: entrada.nota || ''
    }, entrada);
  }

  /* Escuchar + opción: la pregunta ya no se lee, se oye. Solo tiene
     sentido si la palabra tiene audio narrado; si no, el llamante cae a
     otro formato. Los distractores en castellano se sortean igual que
     en preguntaOpcion (mismos/otros de la unidad), pero aquí siempre se
     pregunta el significado — no tiene sentido "escuchar y elegir la
     misma palabra escrita", eso no prueba comprensión. */
  function preguntaEscucharOpcion(entrada, ctx) {
    if (!entrada.audio || modoSilencioso) return null;
    var correcta = entrada.es;
    var yaPuesto = {};
    yaPuesto[normalizar(correcta)] = true;

    var mismos = [], otros = [];
    ctx.fondo.forEach(function (v) {
      if (v === entrada) return;
      var txt = normalizar(v.es);
      if (yaPuesto[txt]) return;
      (v.unidad === entrada.unidad ? mismos : otros).push(v);
    });

    var opciones = [correcta];
    barajar(mismos).concat(barajar(otros)).some(function (v) {
      var txt = normalizar(v.es);
      if (yaPuesto[txt]) return false;
      yaPuesto[txt] = true;
      opciones.push(v.es);
      return opciones.length === 4;
    });

    var q = marcarVocab({
      tipo: 'opcion',
      instruccion: 'Vocabulario · escucha y elige qué significa',
      pregunta: '',
      opciones: opciones,
      correcta: 0,
      explicacion: entrada.nota || ''
    }, entrada);
    q.__escuchar = true;
    q.__labelEscuchar = 'Escucha y elige';
    return q;
  }

  /* Escuchar + teclear: oír la palabra y escribir su traducción al
     castellano — el sentido contrario de preguntaTeclear (que escribe
     en euskera desde el castellano). Como aquí la respuesta es
     castellano de un único gloss por entrada, no hace falta la lista de
     sinónimos que sí usa preguntaTeclear (`ctx.porEs`): no hay
     ambigüedad al escribir en castellano. */
  function preguntaEscucharTeclear(entrada) {
    if (!entrada.audio || modoSilencioso) return null;
    var q = marcarVocab({
      tipo: 'teclear',
      instruccion: 'Vocabulario · escucha y tradúcelo',
      pregunta: '',
      respuestas: [entrada.es],
      solucion: entrada.es,
      explicacion: entrada.nota || ''
    }, entrada);
    q.__escuchar = true;
    q.__objetivo = 'es';
    q.__labelEscuchar = 'Escucha y tradúcelo';
    return q;
  }

  function marcarVocab(q, entrada) {
    q.__clave   = clavePalabra(entrada.eu);
    q.__unidad  = entrada.unidad + '. ' + entrada.titulo;
    q.__palabra = entrada;
    q.__registro = entrada.registro;
    return q;
  }

  /* La pregunta se monta cada vez que la palabra sale, no al principio:
     así la misma palabra vuelve preguntada de otra manera.

     Muchas palabras no admiten ortografía: las cortas —«ni», «zu»— y
     las que no tienen ninguna letra conflictiva. Cuando toca y no se
     puede, adónde se cae depende del nivel: una palabra asentada se va
     a teclear, que es el otro formato que exige la grafía exacta; una
     recién vista se va a opción múltiple, porque pedirle que la escriba
     de memoria la primera vez no es exigencia, es una encerrona. */
  function construirVocab(it) {
    var ctx = estado.ctxVocab, q = null;
    var f = sortearFormato(it.nivel, it.ultimoFormato);
    if (f === 1) {
      q = preguntaOrtografia(it.p);
      if (!q) f = (it.nivel === 0) ? 0 : 2;
    }
    if (!q && f === 2) q = preguntaTeclear(it.p, ctx);
    if (!q && f === 3) q = preguntaEscucharOpcion(it.p, ctx);
    if (!q && f === 4) q = preguntaEscucharTeclear(it.p);
    if (!q) { f = 0; q = preguntaOpcion(it.p, ctx); }
    it.ultimoFormato = f;
    q.__item = it;
    return q;
  }

  function empezarVocab() {
    var fondo = fondoVocabulario();
    if (fondo.length < 4) {
      alert('Todavía no hay vocabulario suficiente. Abre alguna unidad y luego vuelve aquí.');
      return;
    }

    // Traducciones que sirven para más de una palabra: no se pueden
    // preguntar del castellano al euskera con una sola respuesta buena.
    // Se calcula una vez por sesión, y de paso deja la lista de
    // sinónimos que el ejercicio de teclear acepta.
    var cuantas = {}, ambiguas = {}, porEs = {};
    fondo.forEach(function (v) {
      var k = normalizar(v.es);
      cuantas[k] = (cuantas[k] || 0) + 1;
      if (cuantas[k] > 1) ambiguas[k] = true;
      (porEs[k] || (porEs[k] = [])).push(v.eu);
    });

    estado.unidad = null;
    estado.modo = 'vocab';
    estado.ctxVocab = { fondo: fondo, ambiguas: ambiguas, porEs: porEs };
    estado.ejercicios = elegirSesion(fondo, Math.min(LARGO_VOCAB, fondo.length), claveDeVocab)
      .map(function (v) {
        var base = nivelBase(clavePalabra(v.eu));
        // faltan: cuántos aciertos le quedan para salir de la cola.
        return { p: v, base: base, nivel: base, faltan: 1, fallos: 0, primera: null, ultimoFormato: -1 };
      });
    estado.indice = 0;
    estado.total = estado.ejercicios.length;
    estado.aprendidas = 0;
    estado.primeras = 0;
    estado.respuestas = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    el.topbarTitle.textContent = 'Vocabulario';
    mostrar('quiz');
    pintarEjercicio();
  }

  /* El calendario solo escucha la PRIMERA respuesta de cada palabra en
     la sesión. Las vueltas siguientes entrenan, pero no puntúan: has
     visto la solución hace medio minuto, acertar ahora no dice nada de
     si te la sabes dentro de tres días, que es lo que el calendario
     intenta averiguar. */
  function resolverVocab(ej, ok) {
    var it = ej.__item;
    estado.respuestas++;

    if (it.primera === null) {
      it.primera = ok;
      anotar(clavePalabra(it.p.eu), ok);
      if (ok) estado.primeras++;
    }

    if (!ok) {
      it.fallos++;
      it.faltan = (it.fallos >= MAX_FALLOS) ? 0 : 2;
      it.nivel  = Math.max(0, it.base - 1);   // vuelve un peldaño más fácil
      var repe = estado.falladas.some(function (v) { return v.eu === it.p.eu; });
      if (!repe) estado.falladas.push(it.p);
    } else {
      it.faltan--;
      if (it.faltan === 1) it.nivel = Math.min(2, it.base + 1);  // y la última, más dura
    }
  }

  /* Sacar la palabra de la cabeza de la cola y decidir si sale de la
     sesión o vuelve a entrar, y a qué distancia. El `Math.min` es el que
     hace que la última palabra que queda se repita en el acto. */
  function avanzarVocab() {
    var it = estado.ejercicios.shift();
    if (it && it.faltan > 0) {
      var d = alAzar(it.faltan === 2 ? DIST_CERCA : DIST_LEJOS);
      estado.ejercicios.splice(Math.min(d, estado.ejercicios.length), 0, it);
    } else if (it) {
      estado.aprendidas++;
    }
    if (!estado.ejercicios.length) pantallaResultado();
    else pintarEjercicio();
  }

  // ─────────── Pantalla: diccionario ───────────

  var DICC = null;
  var AUDIO_POR_PALABRA = null;

  /* Ruta de audio de una palabra o frase en euskera ya narrada, buscando
     por texto exacto (normalizado) contra TODO el audio del curso — no
     solo el vocabulario (como diccionario()), también los ejemplos de
     los bloques de gramática, que llevan su propio audio y muchas veces
     son justo las frases que se reciclan en "toca las parejas" o en
     ejercicios de opción. Sin esto, esas frases no sonaban aunque el
     mp3 ya existiera, solo por no mirar en el sitio correcto. */
  function audioDePalabra(texto) {
    if (!AUDIO_POR_PALABRA) {
      AUDIO_POR_PALABRA = {};
      function anadir(v) {
        if (v && v.eu && v.audio) AUDIO_POR_PALABRA[normalizar(v.eu)] = v.audio;
      }
      CURSO.unidades.forEach(function (u) {
        u.vocabulario.forEach(function (v) {
          anadir(v);
          (v.variantes || []).forEach(anadir);
        });
        (u.gramatica || []).forEach(function (g) {
          (g.ejemplos || []).forEach(anadir);
        });
      });
    }
    return AUDIO_POR_PALABRA[normalizar(texto)];
  }

  /* Ruta de audio de la respuesta correcta de un ejercicio, si la hay
     narrada — para poder precargarla en cuanto se pinta la pregunta y
     reproducirla en cuanto se acierta (ver pintarEjercicio/resolver).
     Solo tiene sentido cuando la respuesta correcta está en euskera:
     opción, ortografía, orden múltiple, traducir y teclear-en-euskera.
     En escuchar la respuesta es un significado en castellano —
     audioDePalabra() no encuentra nada ahí y sencillamente no suena
     nada, sin necesidad de filtrar por tipo aparte. */
  function audioDeRespuesta(ej) {
    if (!ej) return null;
    var audio;
    /* En "opción" el euskera puede estar en la opción correcta
       («¿cómo se dice X?», se elige en euskera) o en el propio
       enunciado («¿qué significa gure?», se elige en castellano) —
       preguntaOpcion() alterna las dos. Se prueban las dos búsquedas;
       la que no aplique simplemente no encuentra nada. */
    if (ej.tipo === 'opcion') {
      audio = audioDePalabra(ej.opciones[ej.correcta]) || audioDePalabra(ej.pregunta);
    } else if (ej.tipo === 'orden') {
      audio = audioDePalabra(ej.eu);
    } else if (ej.tipo === 'traducir') {
      audio = ej.respuestas && audioDePalabra(ej.respuestas[0]);
    } else if (ej.tipo === 'teclear' && ej.__objetivo !== 'es') {
      audio = audioDePalabra(ej.solucion || (ej.respuestas && ej.respuestas[0]));
    }
    return audio || null;
  }

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
        categoria: v.categoria || 'otros',
        unidad: unidad,
        letra: (plegar(v.eu).charAt(0) || '').toUpperCase(),
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

  var dictLetraActiva = '';
  var dictCatActiva = '';

  /* Pinta la fila de letras, activas solo las que tienen alguna palabra
     con el filtro de tipo actual ya aplicado — para no ofrecer letras
     vacías. */
  function pintarLetrasDicc() {
    var disponibles = {};
    diccionario().forEach(function (v) {
      if (!dictCatActiva || v.categoria === dictCatActiva) disponibles[v.letra] = true;
    });
    if (dictLetraActiva && !disponibles[dictLetraActiva]) dictLetraActiva = '';
    var letras = Object.keys(disponibles).sort();
    el.dictLetras.innerHTML = letras.map(function (l) {
      return '<button type="button" class="dictletra' +
        (l === dictLetraActiva ? ' is-activo' : '') + '" data-letra="' + l + '">' + l + '</button>';
    }).join('');
  }

  function pintarDiccionario(filtro) {
    var q = plegar(filtro || '');
    var lista = diccionario().filter(function (v) {
      if (dictLetraActiva && v.letra !== dictLetraActiva) return false;
      if (dictCatActiva && v.categoria !== dictCatActiva) return false;
      return !q || v.busca.indexOf(q) !== -1;
    });

    pintarLetrasDicc();

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

  // ─────────── Cuenta ───────────

  function pantallaCuenta(mensajeInicial) {
    el.topbarTitle.textContent = 'Tu cuenta';
    sb.auth.getSession().then(function (r) {
      var email = r.data && r.data.session ? r.data.session.user.email : '';
      el.cuentaEmail.textContent = email;
    });
    mensajeCuenta(mensajeInicial || '', false);
    el.nuevaPassword.value = '';
    el.modoSilencioso.checked = modoSilencioso;
    mostrar('cuenta');
  }

  function mensajeCuenta(texto, esError) {
    el.cuentaMsg.textContent = texto;
    el.cuentaMsg.hidden = !texto;
    el.cuentaMsg.classList.toggle('is-mal', !!esError);
  }

  // ─────────── Práctica ───────────

  /* La práctica de unidad sigue siendo la unidad entera y en orden
     barajado: es la primera pasada, aquí no hay nada que dosificar.
     Lo que sí hace es alimentar el calendario, para que el repaso
     posterior sepa qué se falló. */
  function empezarPractica() {
    var u = estado.unidad;
    estado.modo = 'unidad';
    var base = barajar(u.ejercicios).map(function (g) {
      return prepararVariante(g, null);
    });
    var fondoUnidad = [];
    u.vocabulario.forEach(function (v) {
      fondoUnidad = fondoUnidad.concat(formasDe(v, u.numero, u.titulo));
    });
    fondoUnidad = fondoUnidad.concat(ejemplosConAudio(u));
    var extra = candidatosEscuchar(fondoUnidad, ESCUCHAR_PRACTICA);
    estado.ejercicios = barajar(base.concat(extra));
    guardarProgreso();
    estado.indice = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    el.topbarTitle.textContent = u.titulo;
    mostrar('quiz');
    pintarEjercicio();
  }

  /* La pregunta que se está viendo. En vocabulario no vale mirar la
     cola por índice: ahí lo que hay son fichas de palabra, y la
     pregunta se monta al pintarla (construirVocab). */
  function ejActual() { return estado.pregunta; }

  /* En vocabulario la barra no mide cuánto llevas recorrido —la cola se
     alarga cada vez que fallas, y una barra que retrocede desanima—,
     mide cuántas palabras has dejado puestas. Solo avanza cuando una
     sale de la cola para no volver. */
  function actualizarBarra() {
    if (estado.modo === 'vocab') {
      var t = estado.total || 1;
      el.progressbarFill.style.width = (estado.aprendidas / t) * 100 + '%';
      el.hearts.innerHTML = '<b>' + estado.aprendidas + '</b>/' + t;
      return;
    }
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

    var ej;
    if (estado.modo === 'vocab') {
      var it = estado.ejercicios[0];
      if (!it) { return pantallaResultado(); }
      ej = construirVocab(it);
    } else {
      ej = estado.ejercicios[estado.indice];
      if (!ej) { estado.pregunta = null; return pantallaResultado(); }
    }
    estado.pregunta = ej;
    precargarAudio(audioDeRespuesta(ej));

    switch (ej.tipo) {
      case 'opcion':   pintarOpcion(ej); break;
      case 'pares':    pintarPares(ej); break;
      case 'orden':    pintarOrden(ej); break;
      case 'traducir': pintarTraducir(ej); break;
      case 'teclear':  pintarTeclear(ej); break;
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

  /* Aviso de "esto es bizkaiera" en las preguntas de vocabulario que
     salen de una variante dialectal (ver `variantes` en el esquema de
     vocabulario, y el switch "Incluir variantes dialectales" de la
     home) — para no confundirlo con un error de tecleo si se responde
     rápido. Solo se marca cuando la palabra en juego no es la forma
     batua por defecto; reusa el mismo estilo de etiqueta que ya llevan
     las variantes en Vocabulario/Diccionario. */
  function etiquetaRegistroEj(ej) {
    if (!ej.__registro || ej.__registro === 'batua') return '';
    return '<p class="vitem__registro vitem__registro--' + esc(ej.__registro) + ' q__registro">' +
      esc(ej.__registro) + '</p>';
  }

  // — Opción múltiple —

  /* Cabecera de un ejercicio de opción/teclear: normalmente el texto de
     la pregunta, pero en los formatos "escuchar" (ver MEZCLA) la
     pregunta ES el audio — no hay texto en euskera que mostrar, solo un
     botón grande para reproducirlo. */
  function pintarPrompt(ej) {
    if (!ej.__escuchar) {
      return '<h2 class="q__prompt q__prompt--es">' + esc(ej.pregunta) + '</h2>';
    }
    return '<button class="escuchar" type="button" id="btnEscuchar" aria-label="Escuchar la palabra">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 010 8"/></svg>' +
      '<span>' + esc(ej.__labelEscuchar || 'Escuchar') + '</span>' +
    '</button>';
  }

  /* Cablea el botón de la cabecera "escuchar" y reproduce en cuanto se
     pinta el ejercicio — aquí el audio no es un premio ni una
     confirmación (eso se quitó de práctica/repaso), es la pregunta en
     sí: sin oírla no hay nada que responder. */
  function activarEscuchar(ej) {
    if (!ej.__escuchar) return;
    var audio = ej.__palabra.audio;
    var btn = $('btnEscuchar');
    btn.addEventListener('click', function () { if (audio) reproducir(audio); });
    if (audio) reproducir(audio);
  }

  function pintarOpcion(ej) {
    var letras = ['A', 'B', 'C', 'D', 'E', 'F'];
    var orden = barajar(ej.opciones.map(function (txt, i) { return { txt: txt, i: i }; }));

    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      etiquetaRegistroEj(ej) +
      pintarPrompt(ej) +
      '<div class="opts" id="opts">' + orden.map(function (o, n) {
        return '<button class="opt" type="button" aria-pressed="false" data-i="' + o.i + '">' +
          '<span class="opt__key">' + letras[n] + '</span>' +
          '<span>' + esc(o.txt) + '</span>' +
        '</button>';
      }).join('') + '</div>';

    activarEscuchar(ej);

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
      /* En ortografía las tres opciones se parecen tanto que señalar la
         buena no enseña nada: hay que ver qué letra bailaba. */
      if (ej.__grafia) {
        cuerpo = comparacion(normalizar(ej.opciones[estado.sel]),
                             normalizar(ej.opciones[ej.correcta]), false, 'elegiste') +
                 (ej.explicacion ? '<p class="dif__nota">' + esc(ej.explicacion) + '</p>' : '');
      } else {
        cuerpo = '<span class="sol">' + esc(ej.opciones[ej.correcta]) + '</span>' +
                 (ej.explicacion ? '<br>' + ej.explicacion : '');
      }
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
          return '<button class="pair pair--eu" type="button" aria-pressed="false" data-i="' + o.i + '">' +
            '<span class="pair__txt">' + esc(o.txt) + '</span>' +
            '<span class="pair__play" data-play="1" aria-label="Escuchar «' + esc(o.txt) + '»">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 010 8"/></svg>' +
            '</span>' +
          '</button>';
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
        if (e.target.closest('.pair__play')) {
          var audio = audioDePalabra(ej.pares[parseInt(btn.dataset.i, 10)].eu);
          if (audio) reproducir(audio);
          return;
        }
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
    var crudo = $('typebox').value;
    var dado  = normalizar(crudo);
    var ok = ej.respuestas.some(function (r) { return normalizar(r) === dado; });
    $('typebox').blur();
    return { ok: ok, cuerpo: ok ? '' : comparacion(dado, normalizar(ej.respuestas[0]), true) };
  }

  // — Teclear una palabra suelta (vocabulario) —

  /* Igual que traducir una frase, pero de una sola palabra: una línea,
     no dos, y la comparación letra a letra en vez de palabra a palabra. */
  function pintarTeclear(ej) {
    var placeholder = ej.__objetivo === 'es' ? 'Escríbelo en castellano…' : 'Escríbelo en euskera…';
    el.quizContent.innerHTML =
      '<p class="q__inst">' + esc(ej.instruccion) + '</p>' +
      etiquetaRegistroEj(ej) +
      pintarPrompt(ej) +
      '<textarea class="typebox typebox--corta" id="typebox" rows="1" autocomplete="off" ' +
      'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
      'placeholder="' + placeholder + '"></textarea>';

    activarEscuchar(ej);

    var ta = $('typebox');
    ta.addEventListener('input', function () {
      el.btnCheck.disabled = ta.value.trim().length === 0;
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (!el.btnCheck.disabled) el.btnCheck.click(); }
    });
  }

  function corregirTeclear(ej) {
    var dado = normalizar($('typebox').value);
    var ok = ej.respuestas.some(function (r) { return normalizar(r) === dado; });
    $('typebox').blur();
    if (ok) return { ok: true, cuerpo: ej.explicacion ? esc(ej.explicacion) : '' };
    // Letra a letra para una palabra suelta, por palabras si la solución
    // tiene más de una — comparar "tu propio" contra lo escrito letra a
    // letra mezclaba coincidencias sueltas sin sentido (ver comparacion()).
    var porPalabras = normalizar(ej.solucion).indexOf(' ') !== -1;
    return {
      ok: false,
      cuerpo: comparacion(dado, normalizar(ej.solucion), porPalabras) +
              (ej.explicacion ? '<p class="dif__nota">' + esc(ej.explicacion) + '</p>' : '')
    };
  }

  // — Enseñar el error (aportado por Ric) —

  /* No basta con decir cuál era la buena: hay que poder ver en qué se
     falló. Se alinean las dos respuestas por su parte común y se marca
     lo que sobra en la tuya y lo que falta respecto a la correcta. Por
     letras cuando es una palabra; por palabras cuando es una frase,
     donde el detalle de cada letra sería ruido. */
  function alinear(a, b) {
    var n = a.length, m = b.length, i, j;
    var t = new Array(n + 1);
    for (i = 0; i <= n; i++) { t[i] = new Array(m + 1); for (j = 0; j <= m; j++) t[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        t[i][j] = (a[i] === b[j]) ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
      }
    }
    var izq = [], der = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j])                    { izq.push([a[i], 0]); der.push([b[j], 0]); i++; j++; }
      else if (t[i + 1][j] >= t[i][j + 1])  { izq.push([a[i], 1]); i++; }
      else                                  { der.push([b[j], 1]); j++; }
    }
    while (i < n) { izq.push([a[i], 1]); i++; }
    while (j < m) { der.push([b[j], 1]); j++; }
    return { izq: izq, der: der };
  }

  function pintarTrozos(trozos, junta) {
    return trozos.map(function (p) {
      return p[1] ? '<u class="dif">' + esc(p[0]) + '</u>' : esc(p[0]);
    }).join(junta);
  }

  function comparacion(dado, bueno, porPalabras, verbo) {
    var a = porPalabras ? dado.split(' ')  : dado.split('');
    var b = porPalabras ? bueno.split(' ') : bueno.split('');
    var junta = porPalabras ? ' ' : '';
    var al = alinear(a, b);
    return '<span class="dif__par"><span class="dif__lbl">' + (verbo || 'escribiste') + '</span>' +
             '<span class="dif__mal">' + (dado ? pintarTrozos(al.izq, junta) : '—') + '</span></span>' +
           '<span class="dif__par"><span class="dif__lbl">se escribe</span>' +
             '<span class="dif__ok">' + pintarTrozos(al.der, junta) + '</span></span>';
  }

  // — Comprobar —

  function comprobar() {
    var ej = ejActual();
    if (estado.resuelto) return siguiente();
    if (!ej) return;

    var r;
    if (ej.tipo === 'opcion')        r = corregirOpcion(ej);
    else if (ej.tipo === 'orden')    r = corregirOrden(ej);
    else if (ej.tipo === 'traducir') r = corregirTraducir(ej);
    else if (ej.tipo === 'teclear')  r = corregirTeclear(ej);
    else return;

    resolver(r.ok, r.ok ? 'Oso ondo!' : 'No exactamente', r.cuerpo);
  }

  /* Único punto por el que pasa toda respuesta, venga del botón de
     comprobar o del emparejado, que se autocorrige. Es aquí donde el
     calendario se entera de si se ha acertado. */
  function resolver(ok, titulo, cuerpo) {
    var ej = ejActual();
    estado.resuelto = true;
    if (estado.modo === 'vocab') {
      if (ej) resolverVocab(ej, ok);
    } else {
      if (ej && ej.__clave) anotar(ej.__clave, ok);
      if (!ok && ej && ej.__palabra) estado.falladas.push(ej.__palabra);
    }
    registrar(ok);
    if (ok && ej && !ej.__escuchar) {
      var audio = audioDeRespuesta(ej);
      if (audio) reproducir(audio);
    }
    feedback(ok, titulo, cuerpo);
  }

  function registrar(ok) {
    if (ok) { estado.aciertos++; } else { estado.fallos++; vibrar(45); }
    actualizarBarra();
  }

  function siguiente() {
    if (estado.modo === 'vocab') return avanzarVocab();
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
    // En vocabulario la sesión no acaba en la última pregunta, acaba
    // cuando la cola se vacía: solo es la última si esta palabra ya sale.
    var ultimo = (estado.modo === 'vocab')
      ? (estado.ejercicios.length === 1 && estado.ejercicios[0].faltan === 0)
      : (estado.indice === estado.ejercicios.length - 1);
    el.feedbackNext.textContent = ultimo ? 'Ver resultado' : 'Continuar';
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

    /* En vocabulario todas las palabras acaban puestas —para eso está
       la cola—, así que contar aciertos no diría nada: siempre saldría
       casi el cien por cien. Lo que se puntúa es cuántas salieron a la
       primera, sin necesitar ninguna vuelta. */
    if (estado.modo === 'vocab') {
      total = estado.total;
      ratio = total ? estado.primeras / total : 0;
    }

    // Los repasos no pertenecen a ninguna unidad, así que no marcan nada
    // como completado: solo te dicen cómo ha ido. Lo que sí han hecho,
    // pregunta a pregunta, es mover el calendario.
    if (estado.modo === 'unidad') {
      var p = progUnidad(u.id);
      p.intentos++;
      p.mejor = Math.max(p.mejor, ratio);
      if (ratio >= 0.7) p.completada = true;
      guardarProgreso();
      marcarLeccionHoy(u.id);
    }

    var titulo, sub;
    if (estado.modo === 'repaso') {
      if (ratio === 1)       { titulo = 'Bikain!';   sub = 'Perfecto. No se te ha escapado nada.'; }
      else if (ratio >= 0.8) { titulo = 'Oso ondo!'; sub = 'Muy bien. Lo de atrás sigue en su sitio.'; }
      else if (ratio >= 0.5) { titulo = 'Ondo!';     sub = 'Bien. Alguna unidad pide una segunda vuelta.'; }
      else                   { titulo = 'Ia-ia…';    sub = 'Vuelve a las unidades que más se te han atragantado.'; }
    }
    else if (estado.modo === 'vocab') {
      if (ratio === 1)       { titulo = 'Bikain!';   sub = 'Perfecto. Todas a la primera.'; }
      else if (ratio >= 0.8) { titulo = 'Oso ondo!'; sub = 'Muy bien. Las de abajo costaron una vuelta.'; }
      else if (ratio >= 0.5) { titulo = 'Ondo!';     sub = 'Bien. Al final las has puesto todas.'; }
      else                   { titulo = 'Ia-ia…';    sub = 'Han costado, pero han salido. Vuelven pronto.'; }
    }
    else if (ratio === 1)   { titulo = 'Bikain!';   sub = 'Perfecto. Todas correctas.'; }
    else if (ratio >= 0.8)  { titulo = 'Oso ondo!'; sub = 'Muy bien. Dominas esta unidad.'; }
    else if (ratio >= 0.7)  { titulo = 'Ondo!';     sub = 'Bien. Unidad superada.'; }
    else                    { titulo = 'Ia-ia…';    sub = 'Casi. Repasa la gramática y vuelve a intentarlo.'; }

    // Verde para las tres cabeceras positivas; la de "casi" se queda
    // neutra — no es un fallo, es ánimo para seguir, no toca marcarla
    // en rojo como si algo hubiera ido mal.
    var tituloBien = titulo !== 'Ia-ia…';

    // Tras el vocabulario, la lista de lo fallado: es lo único que hay
    // que mirar antes de cerrar, y evita ir a buscarlo al diccionario.
    var repaso = '';
    if (estado.modo === 'vocab' && estado.falladas.length) {
      repaso = '<div class="result__miss">' +
        '<p class="footnav__head">Las que costaron</p>' +
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

    /* El marcador del vocabulario cuenta otra historia: no aciertos y
       fallos, sino cuántas salieron limpias, cuántas necesitaron vuelta
       y cuánto trabajo costó en total. Un cero no se pinta de color: el
       tono solo entra cuando hay algo que mirar. */
    function casilla(n, etiqueta, tono) {
      var clase = 'scorebox';
      if (tono && n > 0) clase += ' scorebox--' + tono;
      return '<div class="' + clase + '"><span class="scorebox__num">' + n + '</span>' +
             '<span class="scorebox__lbl">' + etiqueta + '</span></div>';
    }

    var marcador;
    if (estado.modo === 'vocab') {
      marcador = casilla(estado.primeras, 'a la primera', 'ok') +
                 casilla(estado.total - estado.primeras, 'con vuelta', 'mal') +
                 casilla(estado.respuestas, 'respuestas', null);
    } else {
      marcador = casilla(estado.aciertos, 'aciertos', 'ok') +
                 casilla(estado.fallos, 'fallos', 'mal') +
                 casilla(Math.round(ratio * 100), 'por ciento', null);
    }

    el.topbarTitle.textContent = 'Resultado';
    el.resultContent.innerHTML =
      '<div class="result__mark"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<h1 class="result__title' + (tituloBien ? ' es-bien' : '') + '">' + esc(titulo) + '</h1>' +
      '<p class="result__sub">' + esc(sub) + '</p>' +
      '<div class="result__score">' + marcador + '</div>' +
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

  /* Atajo de teclado para ordenador: en un ejercicio de opción, la letra
     (A, B, C…) elige esa opción, igual que tocarla — no la comprueba
     sola, para eso sigue haciendo falta el botón. Un único listener aquí
     en vez de uno por pregunta: #opts se recrea en cada pregunta, así
     que hay que consultar el DOM en el momento de la tecla, no guardar
     una referencia vieja. */
  document.addEventListener('keydown', function (e) {
    if (estado.pantalla !== 'quiz' || estado.resuelto) return;
    var ej = ejActual();
    if (!ej || ej.tipo !== 'opcion') return;
    var letras = ['a', 'b', 'c', 'd', 'e', 'f'];
    var i = letras.indexOf(e.key.toLowerCase());
    if (i === -1) return;
    var opts = document.querySelectorAll('#opts .opt');
    if (i >= opts.length) return;
    e.preventDefault();
    opts[i].click();
  });

  $('goRepaso').addEventListener('click', empezarRepaso);
  $('goVocabRepaso').addEventListener('click', empezarVocab);
  $('goDicc').addEventListener('click', pantallaDiccionario);
  el.dictInput.addEventListener('input', function () {
    pintarDiccionario(this.value);
  });
  el.dictLetras.addEventListener('click', function (e) {
    var btn = e.target.closest('.dictletra');
    if (!btn) return;
    var letra = btn.getAttribute('data-letra');
    dictLetraActiva = (letra === dictLetraActiva) ? '' : letra;
    pintarDiccionario(el.dictInput.value);
  });
  el.dictCat.addEventListener('change', function () {
    dictCatActiva = this.value;
    pintarDiccionario(el.dictInput.value);
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
  el.vocabUnitCat.addEventListener('change', pintarVocabulario);

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

  el.goLeccion.addEventListener('click', function () {
    var u = CURSO.unidades.filter(function (x) { return x.id === el.goLeccion.dataset.unidad; })[0];
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
    DICC = null;             // el diccionario se reconstruye del CURSO nuevo
    GRAFIAS = null;          // y con él, las grafías conocidas para las erratas de ortografía
    AUDIO_POR_PALABRA = null; // y el mapa de audio por palabra, para no arrastrar rutas viejas
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

  // ─────────── Acceso (usuario + contraseña) ───────────

  function mostrarAuth() {
    el.screenAuth.hidden = false;
    for (var k in el.screens) el.screens[k].hidden = true;
    el.authPassword.value = '';
  }

  function mensajeAuth(texto, esError) {
    el.authMsg.textContent = texto;
    el.authMsg.hidden = !texto;
    el.authMsg.classList.toggle('is-mal', !!esError);
  }

  /* Un solo formulario sirve para entrar y para crear cuenta; el botón
     "¿Primera vez?" cambia qué hace el submit, sin duplicar el HTML. */
  var modoCrearCuenta = false;

  function pintarModoAuth() {
    if (modoCrearCuenta) {
      el.authSub.textContent = 'Crea tu cuenta con correo y contraseña. Así tu progreso se guarda y sincroniza entre dispositivos.';
      el.authSubmit.textContent = 'Crear cuenta';
      el.authToggle.textContent = '¿Ya tienes cuenta? Entrar';
      el.authPassword.autocomplete = 'new-password';
      el.authOlvido.hidden = true;
    } else {
      el.authSub.textContent = 'Inicia sesión con tu correo y tu contraseña. Así tu progreso se guarda y sincroniza entre dispositivos.';
      el.authSubmit.textContent = 'Entrar';
      el.authToggle.textContent = '¿Primera vez? Crear cuenta';
      el.authPassword.autocomplete = 'current-password';
      el.authOlvido.hidden = false;
    }
    mensajeAuth('', false);
  }

  el.authToggle.addEventListener('click', function () {
    modoCrearCuenta = !modoCrearCuenta;
    pintarModoAuth();
  });
  pintarModoAuth();

  el.authForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = el.authEmail.value.trim();
    var password = el.authPassword.value;
    if (!email || !password) return;
    el.authSubmit.disabled = true;
    mensajeAuth(modoCrearCuenta ? 'Creando cuenta…' : 'Entrando…', false);
    var accion = modoCrearCuenta
      ? sb.auth.signUp({ email: email, password: password })
      : sb.auth.signInWithPassword({ email: email, password: password });
    accion.then(function (r) {
      el.authSubmit.disabled = false;
      if (r.error) { mensajeAuth(r.error.message, true); return; }
      if (modoCrearCuenta && !r.data.session) {
        // Supabase no distingue "alta nueva pendiente de confirmar" de
        // "el correo ya tenía cuenta" en el resultado de signUp (por
        // diseño, para no filtrar qué emails existen) — salvo por este
        // detalle: en una cuenta que ya existía, `identities` viene
        // vacío; en una alta genuinamente nueva, trae al menos uno.
        var yaExistia = r.data.user && Array.isArray(r.data.user.identities) && r.data.user.identities.length === 0;
        if (yaExistia) {
          mensajeAuth('Ya existe una cuenta con ese correo. Inicia sesión.', true);
          modoCrearCuenta = false;
          pintarModoAuth();
        } else {
          // Confirmación de correo activada en el proyecto: no hay sesión
          // todavía, hace falta que confirmes antes de poder entrar.
          mensajeAuth('Cuenta creada. Revisa tu correo para confirmarla y luego entra con tu contraseña.', false);
          modoCrearCuenta = false;
          pintarModoAuth();
        }
      }
      // Si hay sesión (login normal, o alta sin confirmación de correo
      // activada), onAuthStateChange se dispara solo y arranca la app.
    });
  });

  el.authOlvido.addEventListener('click', function () {
    var email = el.authEmail.value.trim();
    if (!email) { mensajeAuth('Escribe primero tu correo arriba.', true); return; }
    el.authOlvido.disabled = true;
    mensajeAuth('Enviando…', false);
    sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    }).then(function (r) {
      el.authOlvido.disabled = false;
      if (r.error) { mensajeAuth(r.error.message, true); return; }
      mensajeAuth('Te hemos enviado un enlace a ' + email + ' para elegir una contraseña nueva.', false);
    });
  });

  // ─────────── Cuenta ───────────

  el.btnCuenta.addEventListener('click', function () { pantallaCuenta(); });

  el.formPassword.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = el.nuevaPassword.value;
    if (!password) return;
    mensajeCuenta('Guardando…', false);
    sb.auth.updateUser({ password: password }).then(function (r) {
      if (r.error) { mensajeCuenta(r.error.message, true); return; }
      el.nuevaPassword.value = '';
      mensajeCuenta('Contraseña guardada.', false);
    });
  });

  el.btnCerrarSesion.addEventListener('click', function () {
    sb.auth.signOut();
  });

  el.modoSilencioso.addEventListener('change', function () {
    setModoSilencioso(el.modoSilencioso.checked);
  });

  el.incluirDialectales.checked = incluirDialectales;
  el.incluirDialectales.addEventListener('change', function () {
    setIncluirDialectales(el.incluirDialectales.checked);
  });

  aplicarModoSilencioso();

  var arrancado = false;
  var enRecuperacion = false;  // true si venimos del enlace de "olvidé mi contraseña"

  function arrancarApp() {
    if (arrancado) return;
    arrancado = true;
    el.screenAuth.hidden = true;
    Promise.all([cargarCurso(), cargarProgreso()])
      .then(function (r) {
        CURSO = r[0];
        progreso = r[1];
        document.title = CURSO.meta.titulo + ' · Aprende euskera desde cero';
        if (enRecuperacion) {
          enRecuperacion = false;
          pantallaCuenta('Elige tu contraseña nueva para terminar de recuperar el acceso.');
        } else {
          pantallaHome();
        }
      })
      .catch(function (err) {
        errorDeCarga(String(err.message || err));
      });
  }

  // onAuthStateChange dispara una vez con la sesión inicial (o null) al
  // registrar el listener, y luego en cada login/logout/refresco de token.
  // PASSWORD_RECOVERY llega con sesión (temporal) al volver del enlace de
  // "olvidé mi contraseña" — en vez de la home, hay que llevar directo a
  // poner la contraseña nueva.
  sb.auth.onAuthStateChange(function (event, session) {
    if (event === 'PASSWORD_RECOVERY') enRecuperacion = true;
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
