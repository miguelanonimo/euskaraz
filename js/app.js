/* ═══════════════════════════════════════════════════════════
   Euskaraz — lógica de la aplicación
   Sin dependencias. Funciona en cualquier navegador moderno.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────── Estado ───────────

  var CURSO = null;

  var CLAVE = 'euskaraz.progreso.v2';
  var CLAVE_VIEJA = 'euskaraz.progreso.v1';

  /* Progreso local, solo para MODO_LOCAL (probar sin cuenta). Se guarda
     en el navegador para no empezar de cero en cada recarga. La clave
     lleva el curso dentro porque la reestructuración cambia los ids de
     unidad y de grupo: mezclarlos daría un progreso sin sentido. */
  function claveLocal() {
    return 'euskaraz.local.' + (window.__CURSO_V2__ ? 'v2' : 'v1');
  }

  // ─────────── Supabase ───────────
  // Proyecto compartido con Ippo (mismo org); tabla propia euskaraz_progreso,
  // aislada por RLS (auth.uid() = user_id). Ver docs/brief.md sección 4.
  var SUPABASE_URL = 'https://teoyketwfyxjhkoympcj.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb3lrZXR3Znl4amhrb3ltcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzU1NTksImV4cCI6MjA5NDYxMTU1OX0._ilcBB8IakFz4-iDwWXdXArL2h2Nz00OSMnc6a1jBjg';
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  var usuarioId = null;
  var usuarioEmail = '';
  var usuarioNombre = '';   // para el «Kaixo, …!»: sale de los metadatos de la cuenta, si los hay

  /* Entrar sin cuenta, SOLO en local, para poder revisar contenido sin
     pasar por el login (aportado por Ric). La condición es el nombre
     del host, no una bandera: en el dominio real esto es false siempre,
     no hay forma de activarlo en producción sin cambiar esta línea.
     Con ?cuenta en la URL se desactiva aposta: sirve para entrar con
     una cuenta de verdad en local y ver el progreso real de Supabase
     en vez del de localStorage (por ejemplo, para comprobar un cambio
     de diseño con datos reales en vez de los que uno mismo se invente). */
  var MODO_LOCAL = ['localhost', '127.0.0.1', '::1', ''].indexOf(location.hostname) !== -1
    && location.search.indexOf('cuenta') === -1;
  // Bucket público de pronunciaciones (Cloud TTS, ver docs/brief.md sección 6).
  var AUDIO_BASE = SUPABASE_URL + '/storage/v1/object/public/euskaraz-audio/';
  var GUARDAR_ESPERA_MS = 1500;
  var guardarTimer = null;

  var LARGO_REPASO = 15;   // ejercicios por sesión de repaso mezclado
  var LARGO_VOCAB  = 14;   // palabras por sesión de repaso de vocabulario
  var ESCUCHAR_PRACTICA = 2;  // preguntas de escuchar que se cuelan en la práctica de una unidad
  var LARGO_TEST = 12;     // preguntas del test de unidad (mínimo aceptable: 10)
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
     olvida, y se abre deprisa cuando algo ya está asentado.

     La escala era [1,2,4,8,16,32,64,120] y se abrió el 02/09/2026. Con
     881 fichas —355 grupos y 526 palabras— esos intervalos cortos dan
     unos 50 repasos al día haciéndolo todo bien, con picos de 170: Ric
     se encontró 177 pendientes justo al día siguiente de ponerse al
     día. Son los mismos ocho peldaños, más separados; baja la carga
     media un 25% sin tocar las dos primeras repeticiones, que son las
     que sujetan. Las fechas ya guardadas no se recalculan solas: cada
     ficha coge el intervalo nuevo la próxima vez que sale. */
  var PASOS = [1, 3, 7, 16, 35, 75, 150, 300];

  /* Fichas nuevas que pueden entrar al calendario desde los repasos en
     un mismo día. Sin tope, el repaso de vocabulario estrena palabras a
     puñados y todas caen en los peldaños bajos a la vez: de ahí las
     oleadas. Lo que estrenas practicando una unidad no cuenta aquí —eso
     lo decides tú al abrirla. */
  var CUPO_NUEVOS = 25;

  /* Y de ese cupo, al menos estas entran en CADA sesión mientras queden
     sin estrenar. Antes las nuevas iban las últimas en la cola, así que
     con atraso no salían nunca: el cupo se gastaba de golpe en la primera
     sesión del día y luego el vocabulario nuevo se quedaba parado. Con
     dos por sesión gotea, y la cola de repaso se mantiene con el resto de
     los huecos (criterio de Ric). */
  var MIN_NUEVOS = 2;

  /* Lo que la portada llama "hoy". Por encima de esto la cuenta deja de
     crecer: el resto espera su turno sin gritar. Ver un 177 después de
     haberlo hecho todo desanima más de lo que ayuda. */
  var TOPE_DIA = 45;

  /* Cómo se reparte una sesión de repaso. Con la urgencia a secas, un
     atraso de 170 hacía que nunca llegaras a lo que vence hoy —lo que
     aprobaste hace tiempo, que es media gracia del repaso—: se quedaba
     siempre detrás de la deuda vieja. */
  var MEZCLA = { flojo: 0.40, veterano: 0.40 };   // el resto: novedades y lo que quepa

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
    hdr:          $('hdr'),
    sidenav:      $('sidenav'),
    sidenavItems: $('sidenavItems'),
    sidenavCuenta:$('sidenavCuenta'),
    tabbar:       $('tabbar'),
    tabbarItems:  $('tabbarItems'),
    screenAuth: $('screenAuth'),
    authForm:   $('authForm'),
    authEmail:  $('authEmail'),
    authPassword: $('authPassword'),
    authSubmit: $('authSubmit'),
    authToggle: $('authToggle'),
    authOlvido: $('authOlvido'),
    authSub:    $('authSub'),
    authMsg:    $('authMsg'),
    screens: {
      home:     $('screenHome'),
      lessons:  $('screenLessons'),
      unit:     $('screenUnit'),
      sub:      $('screenSub'),
      gram:     $('screenGram'),
      vocab:    $('screenVocab'),
      progress: $('screenProgress'),
      dict:     $('screenDict'),
      quiz:     $('screenQuiz'),
      result:   $('screenResult'),
      cuenta:   $('screenCuenta')
    },
    dictTitulo:    $('dictTitulo'),
    dictInput:     $('dictInput'),
    dictSeg:       $('dictSeg'),
    dictLetras:    $('dictLetras'),
    dictContent:   $('dictContent'),
    alfaPrev:      $('alfaPrev'),
    alfaNext:      $('alfaNext'),
    quizContent:   $('quizContent'),
    sheet:         $('sheet'),
    feedback:      $('feedback'),
    feedbackIcon:  $('feedbackIcon'),
    feedbackTitle: $('feedbackTitle'),
    feedbackBody:  $('feedbackBody'),
    btnFicha:      $('btnFicha'),
    btnCheck:      $('btnCheck'),
    modal:         $('modal'),
    modalPanel:    $('modalPanel')
  };

  // ─────────── Iconos (del sistema de diseño) ───────────

  /* Copiados de ds/icons.js del proyecto de Claude Design. Todos pintan con
     currentColor, así que el color lo pone quien los contiene. */
  var ICONOS = {
    'check-bold': { vb: '0 0 24 24', b: '<path d="M 7.749 17.325 C 7.068 17.326 6.415 17.055 5.933 16.573 L 0.443 11.084 C -0.148 10.494 -0.148 9.536 0.443 8.945 C 1.034 8.354 1.992 8.354 2.583 8.945 L 7.749 14.111 L 21.417 0.443 C 22.008 -0.148 22.966 -0.148 23.557 0.443 C 24.148 1.034 24.148 1.992 23.557 2.583 L 9.565 16.573 C 9.084 17.055 8.43 17.326 7.749 17.325 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 0 3.337)"/>' },
    'cross-bold': { vb: '0 0 24 24', b: '<path d="M 14.121 12 L 23.561 2.561 C 24.146 1.975 24.146 1.025 23.561 0.439 C 22.975 -0.146 22.025 -0.146 21.439 0.439 L 12 9.879 L 2.561 0.439 C 1.975 -0.146 1.025 -0.146 0.439 0.439 C -0.146 1.025 -0.146 1.975 0.439 2.561 L 9.879 12 L 0.439 21.439 C -0.146 22.025 -0.146 22.975 0.439 23.561 C 1.025 24.146 1.975 24.146 2.561 23.561 L 12 14.121 L 21.439 23.561 C 22.025 24.146 22.975 24.146 23.56 23.561 C 24.146 22.975 24.146 22.025 23.56 21.439 L 14.121 12 Z" fill="currentColor" fill-rule="evenodd"/>' },
    'eye': { vb: '0 0 24 24', b: '<path d="M 23.038 6.067 C 20.61 2.321 16.464 0.042 11.999 0 C 7.534 0.042 3.388 2.321 0.96 6.067 C -0.32 7.946 -0.32 10.416 0.96 12.294 C 3.387 16.043 7.533 18.324 11.999 18.367 C 16.464 18.325 20.61 16.046 23.038 12.3 C 24.321 10.42 24.321 7.947 23.038 6.067 Z M 20.553 10.591 C 18.699 13.532 15.475 15.326 11.999 15.352 C 8.523 15.326 5.299 13.532 3.445 10.591 C 2.867 9.742 2.867 8.625 3.445 7.776 C 5.299 4.836 8.523 3.041 11.999 3.016 C 15.475 3.041 18.699 4.836 20.553 7.776 C 21.131 8.625 21.131 9.742 20.553 10.591 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 0 2.817)"/><circle cx="12" cy="12" r="3" fill="currentColor"/>' },
    'chevron-right': { vb: '0 0 24 24', b: '<path d="M 6.296 4.881 L 1.706 0.291 C 1.518 0.105 1.265 0 1.001 0 C 0.737 0 0.483 0.105 0.296 0.291 C 0.202 0.384 0.128 0.494 0.077 0.616 C 0.026 0.738 0 0.869 0 1.001 C 0 1.133 0.026 1.264 0.077 1.385 C 0.128 1.507 0.202 1.618 0.296 1.711 L 4.896 6.291 C 4.99 6.384 5.064 6.494 5.115 6.616 C 5.165 6.738 5.192 6.869 5.192 7.001 C 5.192 7.133 5.165 7.264 5.115 7.385 C 5.064 7.507 4.99 7.618 4.896 7.711 L 0.296 12.291 C 0.107 12.478 0.001 12.732 0 12.997 C -0.001 13.263 0.104 13.517 0.291 13.706 C 0.478 13.894 0.732 14 0.997 14.001 C 1.263 14.002 1.517 13.898 1.706 13.711 L 6.296 9.121 C 6.858 8.558 7.173 7.796 7.173 7.001 C 7.173 6.206 6.858 5.443 6.296 4.881 L 6.296 4.881 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 9.104 4.999)"/>' },
    'arrow-left': { vb: '0 0 24 24', b: '<path d="M 13 5.001 L 3 5.001 L 6.29 1.711 C 6.384 1.618 6.458 1.507 6.509 1.385 C 6.56 1.264 6.586 1.133 6.586 1.001 C 6.586 0.869 6.56 0.738 6.509 0.616 C 6.458 0.494 6.384 0.384 6.29 0.291 C 6.103 0.105 5.849 0 5.585 0 C 5.321 0 5.067 0.105 4.88 0.291 L 0.59 4.591 C 0.214 4.964 0.002 5.471 0 6.001 L 0 6.001 C 0.005 6.527 0.217 7.03 0.59 7.401 L 4.88 11.701 C 4.973 11.793 5.084 11.867 5.205 11.917 C 5.327 11.966 5.457 11.992 5.589 11.991 C 5.72 11.991 5.85 11.965 5.971 11.914 C 6.092 11.863 6.202 11.789 6.295 11.696 C 6.388 11.603 6.461 11.492 6.511 11.37 C 6.561 11.249 6.586 11.119 6.586 10.987 C 6.585 10.856 6.559 10.726 6.508 10.605 C 6.457 10.483 6.383 10.373 6.29 10.281 L 3 7.001 L 13 7.001 C 13.265 7.001 13.52 6.895 13.707 6.708 C 13.895 6.52 14 6.266 14 6.001 C 14 5.736 13.895 5.481 13.707 5.294 C 13.52 5.106 13.265 5.001 13 5.001 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 6 5.999)"/>' },
    'calendar': { vb: '0 0 24 24', b: '<path d="M 19 2 L 18 2 L 18 1 C 18 0.735 17.895 0.48 17.707 0.293 C 17.52 0.105 17.265 0 17 0 C 16.735 0 16.48 0.105 16.293 0.293 C 16.105 0.48 16 0.735 16 1 L 16 2 L 8 2 L 8 1 C 8 0.735 7.895 0.48 7.707 0.293 C 7.52 0.105 7.265 0 7 0 C 6.735 0 6.48 0.105 6.293 0.293 C 6.105 0.48 6 0.735 6 1 L 6 2 L 5 2 C 3.674 2.002 2.404 2.529 1.466 3.466 C 0.529 4.404 0.002 5.674 0 7 L 0 19 C 0.002 20.326 0.529 21.596 1.466 22.534 C 2.404 23.471 3.674 23.998 5 24 L 19 24 C 20.326 23.998 21.596 23.471 22.534 22.534 C 23.471 21.596 23.998 20.326 24 19 L 24 7 C 23.998 5.674 23.471 4.404 22.534 3.466 C 21.596 2.529 20.326 2.002 19 2 L 19 2 Z M 2 7 C 2 6.204 2.316 5.441 2.879 4.879 C 3.441 4.316 4.204 4 5 4 L 19 4 C 19.796 4 20.559 4.316 21.121 4.879 C 21.684 5.441 22 6.204 22 7 L 22 8 L 2 8 L 2 7 Z M 19 22 L 5 22 C 4.204 22 3.441 21.684 2.879 21.121 C 2.316 20.559 2 19.796 2 19 L 2 10 L 22 10 L 22 19 C 22 19.796 21.684 20.559 21.121 21.121 C 20.559 21.684 19.796 22 19 22 Z" fill="currentColor" fill-rule="evenodd"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/><circle cx="7" cy="15" r="1.5" fill="currentColor"/><circle cx="17" cy="15" r="1.5" fill="currentColor"/>' },
    'close': { vb: '0 0 24 24', b: '<path d="M 23.707 0.293 C 23.519 0.105 23.265 0 23 0 C 22.735 0 22.48 0.105 22.293 0.293 L 12 10.586 L 1.707 0.293 C 1.519 0.105 1.265 0 1 0 C 0.735 0 0.48 0.105 0.293 0.293 L 0.293 0.293 C 0.105 0.48 0 0.735 0 1 C 0 1.265 0.105 1.519 0.293 1.707 L 10.586 12 L 0.293 22.293 C 0.105 22.48 0 22.735 0 23 C 0 23.265 0.105 23.519 0.293 23.707 L 0.293 23.707 C 0.48 23.894 0.735 24 1 24 C 1.265 24 1.519 23.894 1.707 23.707 L 12 13.414 L 22.293 23.707 C 22.48 23.894 22.735 24 23 24 C 23.265 24 23.519 23.894 23.707 23.707 C 23.894 23.519 24 23.265 24 23 C 24 22.735 23.894 22.48 23.707 22.293 L 13.414 12 L 23.707 1.707 C 23.894 1.519 24 1.265 24 1 C 24 0.735 23.894 0.48 23.707 0.293 L 23.707 0.293 Z" fill="currentColor" fill-rule="evenodd"/>' },
    'list': { vb: '0 0 24 24', b: '<path d="M 1 2 L 17 2 C 17.265 2 17.52 1.895 17.707 1.707 C 17.895 1.52 18 1.265 18 1 C 18 0.735 17.895 0.48 17.707 0.293 C 17.52 0.105 17.265 0 17 0 L 1 0 C 0.735 0 0.48 0.105 0.293 0.293 C 0.105 0.48 0 0.735 0 1 C 0 1.265 0.105 1.52 0.293 1.707 C 0.48 1.895 0.735 2 1 2 Z" fill="currentColor" transform="matrix(1 0 0 1 6 4.000)"/><path d="M 17 0 L 1 0 C 0.735 0 0.48 0.105 0.293 0.293 C 0.105 0.48 0 0.735 0 1 C 0 1.265 0.105 1.52 0.293 1.707 C 0.48 1.895 0.735 2 1 2 L 17 2 C 17.265 2 17.52 1.895 17.707 1.707 C 17.895 1.52 18 1.265 18 1 C 18 0.735 17.895 0.48 17.707 0.293 C 17.52 0.105 17.265 0 17 0 Z" fill="currentColor" transform="matrix(1 0 0 1 6 11.000)"/><path d="M 17 0 L 1 0 C 0.735 0 0.48 0.105 0.293 0.293 C 0.105 0.48 0 0.735 0 1 C 0 1.265 0.105 1.52 0.293 1.707 C 0.48 1.895 0.735 2 1 2 L 17 2 C 17.265 2 17.52 1.895 17.707 1.707 C 17.895 1.52 18 1.265 18 1 C 18 0.735 17.895 0.48 17.707 0.293 C 17.52 0.105 17.265 0 17 0 Z" fill="currentColor" transform="matrix(1 0 0 1 6 18)"/><circle cx="1.5" cy="5" r="1.5" fill="currentColor"/><circle cx="1.5" cy="12" r="1.5" fill="currentColor"/><circle cx="1.5" cy="19" r="1.5" fill="currentColor"/>' },
    'plus': { vb: '0 0 24 24', b: '<path d="M 11 5 L 7 5 L 7 1 C 7 0.735 6.895 0.48 6.707 0.293 C 6.52 0.105 6.265 0 6 0 C 5.735 0 5.48 0.105 5.293 0.293 C 5.105 0.48 5 0.735 5 1 L 5 5 L 1 5 C 0.735 5 0.48 5.105 0.293 5.293 C 0.105 5.48 0 5.735 0 6 C 0 6.265 0.105 6.52 0.293 6.707 C 0.48 6.895 0.735 7 1 7 L 5 7 L 5 11 C 5 11.265 5.105 11.52 5.293 11.707 C 5.48 11.895 5.735 12 6 12 C 6.265 12 6.52 11.895 6.707 11.707 C 6.895 11.52 7 11.265 7 11 L 7 7 L 11 7 C 11.265 7 11.52 6.895 11.707 6.707 C 11.895 6.52 12 6.265 12 6 C 12 5.735 11.895 5.48 11.707 5.293 C 11.52 5.105 11.265 5 11 5 Z" fill="currentColor" transform="matrix(1 0 0 1 6 6)"/>' },
    'quote': { vb: '0 0 24 24', b: '<path d="M 8 0 L 4 0 C 2.939 0 1.922 0.421 1.172 1.172 C 0.421 1.922 0 2.939 0 4 L 0 8 C 0 8.53 0.211 9.039 0.586 9.414 C 0.961 9.789 1.47 10 2 10 L 7.91 10 C 7.673 11.397 6.949 12.664 5.868 13.579 C 4.787 14.494 3.417 14.997 2 15 C 1.735 15 1.48 15.105 1.293 15.293 C 1.105 15.48 1 15.735 1 16 C 1 16.265 1.105 16.52 1.293 16.707 C 1.48 16.895 1.735 17 2 17 C 4.121 16.998 6.154 16.154 7.654 14.654 C 9.154 13.154 9.998 11.121 10 9 L 10 2 C 10 1.47 9.789 0.961 9.414 0.586 C 9.039 0.211 8.53 0 8 0 L 8 0 Z" fill="currentColor" transform="matrix(1 0 0 1 0 3.999)"/><path d="M 8 0 L 4 0 C 2.939 0 1.922 0.421 1.172 1.172 C 0.421 1.922 0 2.939 0 4 L 0 8 C 0 8.53 0.211 9.039 0.586 9.414 C 0.961 9.789 1.47 10 2 10 L 7.91 10 C 7.673 11.397 6.949 12.664 5.868 13.579 C 4.787 14.494 3.417 14.997 2 15 C 1.735 15 1.48 15.105 1.293 15.293 C 1.105 15.48 1 15.735 1 16 C 1 16.265 1.105 16.52 1.293 16.707 C 1.48 16.895 1.735 17 2 17 C 4.121 16.998 6.154 16.154 7.654 14.654 C 9.154 13.154 9.998 11.121 10 9 L 10 2 C 10 1.47 9.789 0.961 9.414 0.586 C 9.039 0.211 8.53 0 8 0 L 8 0 Z" fill="currentColor" transform="matrix(1 0 0 1 14.000 3.999)"/>' },
    'search': { vb: '0 0 24 24', b: '<path d="M 23.739 22.325 L 17.77 16.356 C 19.397 14.367 20.196 11.828 20.004 9.266 C 19.811 6.703 18.641 4.313 16.736 2.589 C 14.83 0.865 12.335 -0.061 9.766 0.003 C 7.197 0.067 4.751 1.117 2.934 2.934 C 1.117 4.751 0.067 7.197 0.003 9.766 C -0.061 12.335 0.865 14.83 2.589 16.736 C 4.313 18.641 6.703 19.811 9.266 20.004 C 11.828 20.196 14.367 19.397 16.356 17.77 L 22.325 23.739 C 22.514 23.921 22.766 24.022 23.028 24.02 C 23.291 24.017 23.541 23.912 23.727 23.727 C 23.912 23.541 24.017 23.291 24.02 23.028 C 24.022 22.766 23.921 22.514 23.739 22.325 Z M 10.032 18.032 C 8.45 18.032 6.903 17.563 5.587 16.684 C 4.272 15.805 3.246 14.555 2.641 13.093 C 2.035 11.632 1.877 10.023 2.186 8.471 C 2.494 6.919 3.256 5.494 4.375 4.375 C 5.494 3.256 6.919 2.494 8.471 2.186 C 10.023 1.877 11.632 2.035 13.093 2.641 C 14.555 3.246 15.805 4.272 16.684 5.587 C 17.563 6.903 18.032 8.45 18.032 10.032 C 18.03 12.153 17.186 14.186 15.686 15.686 C 14.186 17.186 12.153 18.03 10.032 18.032 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 -0.032 -0.031)"/>' },
    'stats': { vb: '0 0 24 24', b: '<path d="M 3 0 C 2.204 0 1.441 0.316 0.879 0.879 C 0.316 1.441 0 2.204 0 3 L 0 15 C 0 15.796 0.316 16.559 0.879 17.121 C 1.441 17.684 2.204 18 3 18 C 3.796 18 4.559 17.684 5.121 17.121 C 5.684 16.559 6 15.796 6 15 L 6 3 C 6 2.204 5.684 1.441 5.121 0.879 C 4.559 0.316 3.796 0 3 0 Z" fill="currentColor" transform="matrix(1 0 0 1 9 6)"/><path d="M 3 0 C 2.204 0 1.441 0.316 0.879 0.879 C 0.316 1.441 0 2.204 0 3 L 0 21 C 0 21.796 0.316 22.559 0.879 23.121 C 1.441 23.684 2.204 24 3 24 C 3.796 24 4.559 23.684 5.121 23.121 C 5.684 22.559 6 21.796 6 21 L 6 3 C 6 2.204 5.684 1.441 5.121 0.879 C 4.559 0.316 3.796 0 3 0 L 3 0 Z M 4 21 C 4 21.265 3.895 21.52 3.707 21.707 C 3.52 21.895 3.265 22 3 22 C 2.735 22 2.48 21.895 2.293 21.707 C 2.105 21.52 2 21.265 2 21 L 2 3 C 2 2.735 2.105 2.48 2.293 2.293 C 2.48 2.105 2.735 2 3 2 C 3.265 2 3.52 2.105 3.707 2.293 C 3.895 2.48 4 2.735 4 3 L 4 21 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 18 0)"/><path d="M 3 0 C 2.204 0 1.441 0.316 0.879 0.879 C 0.316 1.441 0 2.204 0 3 L 0 9 C 0 9.796 0.316 10.559 0.879 11.121 C 1.441 11.684 2.204 12 3 12 C 3.796 12 4.559 11.684 5.121 11.121 C 5.684 10.559 6 9.796 6 9 L 6 3 C 6 2.204 5.684 1.441 5.121 0.879 C 4.559 0.316 3.796 0 3 0 Z" fill="currentColor" transform="matrix(1 0 0 1 0 12)"/>' },
    'user': { vb: '0 0 24 24', b: '<path d="M 6 12 C 7.187 12 8.347 11.648 9.333 10.989 C 10.32 10.33 11.089 9.392 11.543 8.296 C 11.997 7.2 12.116 5.993 11.885 4.829 C 11.653 3.666 11.082 2.596 10.243 1.757 C 9.404 0.918 8.334 0.347 7.171 0.115 C 6.007 -0.116 4.8 0.003 3.704 0.457 C 2.608 0.911 1.67 1.68 1.011 2.667 C 0.352 3.653 0 4.813 0 6 C 0.002 7.591 0.634 9.116 1.759 10.241 C 2.884 11.366 4.409 11.998 6 12 Z M 6 2 C 6.791 2 7.564 2.235 8.222 2.674 C 8.88 3.114 9.393 3.738 9.696 4.469 C 9.998 5.2 10.077 6.004 9.923 6.78 C 9.769 7.556 9.388 8.269 8.828 8.828 C 8.269 9.388 7.556 9.769 6.78 9.923 C 6.004 10.077 5.2 9.998 4.469 9.696 C 3.738 9.393 3.114 8.88 2.674 8.222 C 2.235 7.564 2 6.791 2 6 C 2 4.939 2.421 3.922 3.172 3.172 C 3.922 2.421 4.939 2 6 2 L 6 2 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 6 0)"/><path d="M 9 0 C 6.614 0.003 4.326 0.952 2.639 2.639 C 0.952 4.326 0.003 6.614 0 9 C 0 9.265 0.105 9.52 0.293 9.707 C 0.48 9.895 0.735 10 1 10 C 1.265 10 1.52 9.895 1.707 9.707 C 1.895 9.52 2 9.265 2 9 C 2 7.143 2.737 5.363 4.05 4.05 C 5.363 2.737 7.143 2 9 2 C 10.857 2 12.637 2.737 13.95 4.05 C 15.263 5.363 16 7.143 16 9 C 16 9.265 16.105 9.52 16.293 9.707 C 16.48 9.895 16.735 10 17 10 C 17.265 10 17.52 9.895 17.707 9.707 C 17.895 9.52 18 9.265 18 9 C 17.997 6.614 17.048 4.326 15.361 2.639 C 13.674 0.952 11.386 0.003 9 0 L 9 0 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 3 14.001)"/>' },
    'volume': { vb: '0 0 24 24', b: '<path d="M 1.708 0.293 C 1.615 0.2 1.505 0.126 1.383 0.076 C 1.262 0.026 1.132 0 1.001 0 C 0.869 0 0.739 0.026 0.618 0.076 C 0.496 0.126 0.386 0.2 0.293 0.293 C 0.2 0.386 0.126 0.496 0.076 0.618 C 0.026 0.739 0 0.869 0 1.001 C 0 1.132 0.026 1.262 0.076 1.383 C 0.126 1.505 0.2 1.615 0.293 1.708 C 1.96 3.379 2.896 5.643 2.896 8.003 C 2.896 10.363 1.96 12.627 0.293 14.298 C 0.105 14.486 0 14.74 0 15.006 C 0 15.271 0.105 15.525 0.293 15.713 C 0.481 15.901 0.735 16.006 1.001 16.006 C 1.266 16.006 1.52 15.901 1.708 15.713 C 3.75 13.667 4.896 10.894 4.896 8.003 C 4.896 5.112 3.75 2.339 1.708 0.293 L 1.708 0.293 Z" fill="currentColor" transform="matrix(1 0 0 1 19.099 3.997)"/><path d="M 1.712 0.295 C 1.619 0.202 1.509 0.128 1.388 0.077 C 1.266 0.026 1.136 0 1.004 0 C 0.872 0 0.742 0.025 0.62 0.076 C 0.499 0.126 0.388 0.199 0.295 0.292 C 0.202 0.385 0.128 0.496 0.077 0.617 C 0.026 0.739 0 0.869 0 1.001 C 0 1.132 0.025 1.263 0.076 1.384 C 0.126 1.506 0.199 1.617 0.292 1.71 C 1.165 2.584 1.655 3.769 1.655 5.004 C 1.655 6.239 1.165 7.424 0.292 8.298 C 0.199 8.391 0.126 8.502 0.076 8.623 C 0.025 8.745 0 8.875 0 9.007 C 0 9.139 0.026 9.269 0.077 9.391 C 0.128 9.512 0.202 9.622 0.295 9.715 C 0.483 9.903 0.738 10.008 1.004 10.008 C 1.136 10.007 1.266 9.981 1.388 9.931 C 1.509 9.88 1.619 9.806 1.712 9.713 C 2.96 8.463 3.66 6.77 3.66 5.004 C 3.66 3.238 2.96 1.545 1.712 0.295 L 1.712 0.295 Z" fill="currentColor" transform="matrix(1 0 0 1 16.388 6.996)"/><path d="M 13.82 0.017 C 10.779 0.588 8.075 2.306 6.266 4.817 L 5 4.817 C 3.675 4.819 2.404 5.346 1.467 6.283 C 0.53 7.221 0.002 8.491 0 9.817 L 0 13.817 C 0.002 15.142 0.53 16.412 1.467 17.35 C 2.404 18.287 3.675 18.814 5 18.817 L 6.266 18.817 C 8.075 21.326 10.779 23.045 13.82 23.617 C 13.88 23.628 13.94 23.634 14.001 23.634 C 14.266 23.634 14.521 23.528 14.708 23.341 C 14.896 23.153 15.001 22.899 15.001 22.634 L 15.001 1.003 C 15.001 0.856 14.969 0.711 14.907 0.577 C 14.845 0.444 14.755 0.326 14.642 0.232 C 14.529 0.138 14.397 0.07 14.255 0.033 C 14.113 -0.005 13.964 -0.01 13.82 0.017 L 13.82 0.017 Z M 13 21.352 C 10.794 20.648 8.898 19.208 7.629 17.272 C 7.538 17.132 7.414 17.017 7.268 16.938 C 7.122 16.858 6.958 16.817 6.792 16.817 L 5 16.817 C 4.204 16.817 3.441 16.5 2.879 15.938 C 2.316 15.375 2 14.612 2 13.817 L 2 9.817 C 2 9.021 2.316 8.258 2.879 7.695 C 3.441 7.133 4.204 6.817 5 6.817 L 6.8 6.817 C 6.966 6.816 7.13 6.775 7.276 6.696 C 7.422 6.617 7.546 6.503 7.637 6.364 C 8.903 4.428 10.797 2.986 13 2.282 L 13 21.352 Z" fill="currentColor" fill-rule="evenodd" transform="matrix(1 0 0 1 0 0.184)"/>' },
    'warning': { vb: '0 0 24 24', b: '<path d="M10.3 3.9 1.8 18.6A2 2 0 0 0 3.5 21.6h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.2" fill="currentColor"/>' },
    'minus': { vb: '0 0 24 24', b: '<path d="M18 11H6a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2Z" fill="currentColor"/>' },
    'dictionary': { vb: '0 0 26.182 24', b: '<path d="M 24.219 1.268 C 23.605 0.756 22.887 0.384 22.114 0.18 C 21.341 -0.024 20.532 -0.055 19.746 0.089 L 15.576 0.846 C 14.614 1.023 13.738 1.518 13.091 2.252 C 12.442 1.517 11.564 1.022 10.599 0.846 L 6.436 0.089 C 5.65 -0.055 4.842 -0.024 4.068 0.179 C 3.295 0.382 2.576 0.753 1.962 1.265 C 1.348 1.777 0.854 2.417 0.515 3.141 C 0.176 3.865 0 4.655 0 5.454 L 0 17.229 C 0 18.506 0.448 19.743 1.267 20.723 C 2.085 21.704 3.222 22.366 4.478 22.595 L 11.336 23.842 C 12.497 24.053 13.686 24.053 14.846 23.842 L 21.709 22.595 C 22.965 22.365 24.1 21.702 24.918 20.722 C 25.735 19.741 26.182 18.505 26.182 17.229 L 26.182 5.454 C 26.183 4.655 26.007 3.866 25.668 3.142 C 25.328 2.419 24.833 1.779 24.219 1.268 L 24.219 1.268 Z M 12 21.74 C 11.909 21.727 11.817 21.711 11.725 21.695 L 4.869 20.449 C 4.115 20.312 3.433 19.914 2.942 19.326 C 2.451 18.737 2.182 17.995 2.182 17.229 L 2.182 5.454 C 2.182 4.586 2.527 3.754 3.14 3.14 C 3.754 2.526 4.587 2.181 5.455 2.181 C 5.652 2.182 5.849 2.2 6.044 2.235 L 10.211 2.999 C 10.712 3.09 11.166 3.355 11.493 3.746 C 11.82 4.137 11.999 4.63 12 5.14 L 12 21.74 Z M 24 17.229 C 24 17.995 23.732 18.737 23.241 19.326 C 22.75 19.914 22.068 20.312 21.313 20.449 L 14.457 21.695 C 14.365 21.711 14.274 21.727 14.182 21.74 L 14.182 5.14 C 14.182 4.629 14.361 4.134 14.689 3.742 C 15.016 3.35 15.471 3.085 15.973 2.993 L 20.142 2.229 C 20.614 2.144 21.099 2.163 21.563 2.285 C 22.027 2.407 22.458 2.63 22.826 2.938 C 23.195 3.246 23.491 3.631 23.693 4.066 C 23.896 4.5 24.001 4.974 24 5.454 L 24 17.229 Z" fill="currentColor"/>' },
    'check-thin': { vb: '0 0 12 8', b: '<path d="M1 3.6 4.4 7 11 .9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
    'check-lg': { vb: '0 0 18 12', b: '<path d="M1.4 5.8 6.4 10.6 16.6 1.2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' },
    'speaker': { vb: '0 0 16.667 12.149', b: '<path d="M8.33 2.37v7.46c0 1.1 0 1.65-.22 1.9a.7.7 0 0 1-.74.33c-.33-.05-.68-.48-1.4-1.37L4.57 8.93c-.12-.15-.18-.22-.25-.27a.7.7 0 0 0-.27-.13c-.08-.02-.18-.02-.38-.02H2.34c-.62 0-.93 0-1.17-.08A1.6 1.6 0 0 1 .08 7.37C0 7.13 0 6.82 0 6.1s0-1.03.08-1.27a1.6 1.6 0 0 1 1.06-1.06c.24-.08.55-.08 1.17-.08h1.19c.2 0 .3 0 .38-.02a.7.7 0 0 0 .27-.13c.07-.05.13-.12.25-.27L5.96 1.53C6.68.64 7.03.2 7.36.15a.7.7 0 0 1 .75.24c.22.24.22.8.22 1.98Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M14.02 0a7.7 7.7 0 0 1 .04 12.15M11.74 2.44a4.7 4.7 0 0 1 .03 7.29" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
    'speaker-off': { vb: '0 0 11.667 11.953', b: '<path d="M3.33 3.63h-1c-.62 0-.93 0-1.17.08A1.6 1.6 0 0 0 .08 4.78C0 5.02 0 5.33 0 5.98s0 .96.08 1.2a1.6 1.6 0 0 0 1.06 1.06c.24.08.55.08 1.17.08h1.19c.2 0 .3 0 .38.03a.7.7 0 0 1 .27.12c.07.05.13.13.25.27l1.4 1.73c.72.89 1.07 1.33 1.4 1.38a.7.7 0 0 0 .75-.26c.22-.25.22-.8.22-1.89V8.48M8.33 4.73V1.79c0-.76 0-1.14-.1-1.36a.7.7 0 0 0-.84-.37c-.24.1-.48.4-.94.98l-.52.64M0 .14l11.67 11.67" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
    'logo': { vb: '0 0 45.651 45.651', b: '<path d="M 13.107 9.769 C 14.293 3.296 20.502 -0.989 26.975 0.197 C 30.327 0.813 32.581 3.946 32.143 7.288 L 32.092 7.612 C 31.477 10.964 28.343 13.219 25.001 12.78 L 24.677 12.73 C 22.113 12.259 19.653 13.957 19.183 16.521 C 18.761 18.818 20.081 21.032 22.206 21.806 C 23.766 15.826 29.705 11.974 35.882 13.107 C 42.354 14.293 46.64 20.502 45.453 26.975 C 44.838 30.327 41.704 32.581 38.362 32.143 L 38.038 32.092 C 34.578 31.457 32.287 28.138 32.921 24.677 L 32.959 24.437 C 33.285 21.961 31.614 19.639 29.13 19.183 C 26.832 18.761 24.617 20.081 23.844 22.206 C 29.825 23.766 33.676 29.704 32.544 35.882 C 31.357 42.354 25.148 46.64 18.676 45.453 C 15.216 44.818 12.925 41.499 13.559 38.038 L 13.626 37.717 C 14.376 34.543 17.416 32.446 20.65 32.87 L 20.974 32.921 C 23.537 33.391 25.997 31.694 26.468 29.13 C 26.89 26.832 25.569 24.617 23.443 23.844 C 21.883 29.824 15.946 33.677 9.769 32.544 C 3.296 31.357 -0.989 25.148 0.197 18.676 C 0.832 15.216 4.151 12.925 7.612 13.559 L 7.934 13.626 C 11.107 14.376 13.205 17.415 12.78 20.649 L 12.73 20.974 C 12.259 23.537 13.957 25.997 16.521 26.468 C 18.819 26.89 21.033 25.569 21.806 23.443 C 15.826 21.883 11.974 15.946 13.107 9.769 Z" fill="currentColor"/>' }
  };

  /* Un icono a tamaño. Si no se da el ancho, sale de la proporción del
     viewBox — el libro y el altavoz no son cuadrados. */
  function icono(nombre, alto, ancho) {
    var i = ICONOS[nombre];
    if (!i) return '';
    var vb = i.vb.split(' ').map(Number), h = alto || 24;
    var w = ancho || Math.round(h * vb[2] / vb[3] * 100) / 100;
    return '<svg width="' + w + '" height="' + h + '" viewBox="' + i.vb + '" fill="none" aria-hidden="true">' + i.b + '</svg>';
  }

  // ─────────── Colores por unidad ───────────

  /* Cada unidad es una familia de color, en el orden del diseño: rojo,
     naranja, amarillo, pistacho, verde, turquesa, azul, morado, lavanda,
     rosa. A partir de la 11 se vuelve a empezar. Cada familia trae tres
     tonos: el normal, el suave (fondos) y el fuerte (texto sobre blanco). */
  var FAMILIAS = [
    ['247,104,107', '253,224,225', '229,48,52'],
    ['250,171,67',  '254,238,217', '221,104,0'],
    ['240,244,36',  '253,253,222', '196,157,0'],
    ['150,228,79',  '234,250,220', '118,197,0'],
    ['62,214,123',  '226,248,234', '11,183,80'],
    ['92,216,179',  '231,249,244', '16,184,134'],
    ['64,164,250',  '217,237,254', '21,97,237'],
    ['145,143,247', '233,233,253', '98,71,216'],
    ['201,151,247', '244,234,253', '156,83,222'],
    ['255,180,237', '255,240,251', '219,86,188']
  ];

  function familia(u) {
    var n = (u && u.numero ? u.numero : 1) - 1;
    var f = FAMILIAS[((n % FAMILIAS.length) + FAMILIAS.length) % FAMILIAS.length];
    return { raw: f[0], c: 'rgb(' + f[0] + ')', soft: 'rgb(' + f[1] + ')', strong: 'rgb(' + f[2] + ')' };
  }

  /* El color de la unidad en la que estás pinta los acentos de la pantalla
     (pasos, insignias, botones de la unidad). Sin unidad, el rojo de marca. */
  function ponerFamilia(u) {
    var s = document.body.style;
    if (!u) { s.removeProperty('--c'); s.removeProperty('--c-soft'); s.removeProperty('--c-strong'); return; }
    var f = familia(u);
    s.setProperty('--c', f.c);
    s.setProperty('--c-soft', f.soft);
    s.setProperty('--c-strong', f.strong);
  }

  /* Anillo de progreso: pista al 20% y arco encima. Opcionalmente con una
     etiqueta («4.1») o un icono dentro. */
  function anillo(valor, o) {
    o = o || {};
    var tam = o.tam || 32, color = o.color || 'var(--main)';
    var grosor = o.grosor || (tam >= 48 ? 5 : 4);
    var v = o.hecho ? 100 : Math.max(0, Math.min(100, Math.round(valor || 0)));
    var dentro = '';
    if (o.icono) dentro = '<span class="ring__in">' + icono(o.icono, o.icono === 'check-lg' ? 12 : (o.icono === 'list' ? 20 : 8)) + '</span>';
    else if (o.hecho) dentro = '<span class="ring__in">' + icono(tam >= 48 ? 'check-lg' : 'check-thin', tam >= 48 ? 12 : 8) + '</span>';
    else if (o.etiqueta) dentro = '<span class="ring__in">' + esc(o.etiqueta) + '</span>';
    return '<span class="ring" style="--s:' + tam + 'px;--w:' + grosor + 'px;--v:' + v + ';--rc:' + color + '">' + dentro + '</span>';
  }

  // ─────────── Utilidades ───────────

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* La gramática admite <b>, <i> y <u> escritos a mano en el JSON.
     El <u> no estaba y las fichas sí lo usaban: se veía «<u>ogirik</u>»
     tal cual en pantalla (lo sufrió Ric un tiempo sin que lo anotáramos).
     No es decorativo: marca la pieza clave DENTRO de un ejemplo que ya
     va entero en negrita, que es un segundo nivel de énfasis que <b> no
     puede dar. verificar.py ya lo daba por válido; el que iba por detrás
     era esto. */
  /* Igual que richText pero de una línea: sirve para el enunciado de un
     ejercicio, donde partir en párrafos no tiene sentido. Escapa todo y
     solo devuelve <b>, <i> y <u>, así que sigue siendo seguro. */
  function richInline(s) {
    return esc(s)
      .replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>')
      .replace(/&lt;u&gt;/g, '<u>').replace(/&lt;\/u&gt;/g, '</u>');
  }

  function richText(s) {
    return esc(s)
      .replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>')
      .replace(/&lt;u&gt;/g, '<u>').replace(/&lt;\/u&gt;/g, '</u>')
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

  /* ── Respuestas flexibles (detectado por Ric, portado de ric/trabajo) ──

     El campo `es` está escrito para leerse, no para compararse: «pequeño/a»,
     «coger, tomar», «(yo) soy». Comparando la cadena entera, teclear
     «pequeño» —que es correcto— se marcaba como fallo. Afectaba a 116 de
     las 487 entradas del curso.

     Esto expande una respuesta en todas las formas aceptables. Se aplica
     al corregir, no al construir la pregunta, para que valga en cualquier
     formato que compare texto tecleado.

     Sobre las respuestas en euskera no hace nada: ningún campo `eu` del
     curso lleva barra, coma ni paréntesis (comprobado). */

  var ARTICULO_ES = /^(el|la|los|las|un|una|unos|unas)\s+/;

  /* Barra dentro de una palabra. Si lo que sigue es una sola letra es una
     contracción de género (pequeño/a → pequeña); si son más, dos formas
     cortas alternativas (el/la → el, la). */
  function expandirBarra(tok) {
    if (tok.indexOf('/') === -1) return [tok];
    var p = tok.split('/');
    if (p.length !== 2 || !p[0]) return [tok];
    if (p[1].length === 1) return [p[0], p[0].slice(0, -1) + p[1]];
    return [p[0], p[1]];
  }

  /* Combina las alternativas de cada palabra. Con tope, para que una
     entrada con varias barras no dispare la lista. */
  function combinar(listas, tope) {
    var out = [''];
    for (var i = 0; i < listas.length; i++) {
      var sig = [];
      for (var j = 0; j < out.length; j++) {
        for (var k = 0; k < listas[i].length; k++) {
          sig.push(out[j] ? out[j] + ' ' + listas[i][k] : listas[i][k]);
          if (sig.length >= tope) return sig;
        }
      }
      out = sig;
    }
    return out;
  }

  /* Escuchando un número, «8» vale tanto como «ocho»: lo que se practica es
     reconocer `zortzi`, no escribir castellano (pedido por Ric). Va aquí y no
     como `esAlt` palabra por palabra para que valga también para los números
     que se añadan después.
     Solo se convierte cuando la respuesta entera es el número, no dentro de
     una frase: así el comportamiento es predecible y no hay sorpresas. */
  var CIFRAS = {
    'uno':1, 'dos':2, 'tres':3, 'cuatro':4, 'cinco':5, 'seis':6, 'siete':7,
    'ocho':8, 'nueve':9, 'diez':10, 'once':11, 'doce':12, 'trece':13,
    'catorce':14, 'quince':15, 'dieciseis':16, 'diecisiete':17, 'dieciocho':18,
    'diecinueve':19, 'veinte':20, 'treinta':30, 'cuarenta':40, 'cincuenta':50,
    'sesenta':60, 'setenta':70, 'ochenta':80, 'noventa':90, 'cien':100, 'mil':1000
  };
  var LETRAS = (function () {
    var r = {};
    for (var k in CIFRAS) r[String(CIFRAS[k])] = k;
    return r;
  })();

  function variantesRespuesta(texto) {
    var vistas = {}, salida = [];
    function meter(t) {
      var n = normalizar(t);
      if (n && !vistas[n]) { vistas[n] = true; salida.push(n); }
      // el mismo número escrito de la otra manera
      var sinTilde = claveRespuesta(t);
      if (CIFRAS[sinTilde] !== undefined) meter2(String(CIFRAS[sinTilde]));
      else if (LETRAS[sinTilde] !== undefined) meter2(LETRAS[sinTilde]);
    }
    function meter2(t) {
      var n = normalizar(t);
      if (n && !vistas[n]) { vistas[n] = true; salida.push(n); }
    }

    /* Comas y barras con espacio separan alternativas completas. Y dos
       preguntas seguidas también: «¿cuánto? ¿cuántos?» son dos respuestas
       válidas, no una de dos palabras — así estaba, y responder «cuánto»
       salía casi-correcto contra «cuánto cuántos» (detectado por Ric).
       El patrón «? ¿» no es ambiguo: cierra una pregunta y abre otra. */
    String(texto).replace(/\?\s+¿/g, '?, ¿')
      .split(/\s*,\s*|\s+\/\s+/).forEach(function (alt) {
      if (!alt.trim()) return;
      // Lo que va entre paréntesis es aclaración: vale con y sin ello.
      var formas = [alt];
      if (alt.indexOf('(') !== -1) formas.push(alt.replace(/\([^)]*\)/g, ' '));
      formas.forEach(function (txt) {
        var toks = txt.trim().split(/\s+/).filter(Boolean);
        combinar(toks.map(expandirBarra), 12).forEach(function (v) {
          meter(v);
          var sinArt = normalizar(v).replace(ARTICULO_ES, '');
          if (sinArt) meter(sinArt);   // «el amigo» o «amigo», las dos
        });
      });
    });

    meter(texto);
    return salida;
  }

  /* Todas las formas aceptables de una lista de respuestas válidas, en
     un solo array normalizado y sin duplicados — para comparar contra
     lo tecleado (aciertaTecleado) y para buscar la más parecida cuando
     no hay acierto exacto (respuestaMasCercana, ver "casi correcto"). */
  function todasLasVariantes(respuestas) {
    var vistas = {}, out = [];
    (respuestas || []).forEach(function (r) {
      variantesRespuesta(r).forEach(function (v) {
        if (!vistas[v]) { vistas[v] = true; out.push(v); }
      });
    });
    return out;
  }

  /* Las tildes y los espacios alrededor de la barra son cosméticos: el
     brief los da por no-fallo, pero la comparación sí los miraba, y
     «el/ella» salía mal contra «él / ella» (detectado por Ric). Se
     comparan por esta clave; lo que se muestra en pantalla no cambia.
     La ñ se deja tal cual a propósito: en castellano y en euskera es
     otra letra, no una n con adorno. Comprobado que ninguna pareja de
     palabras del curso se confunde al aplanar así. */
  var TILDES = { 'á':'a','à':'a','ä':'a','â':'a',
                 'é':'e','è':'e','ë':'e','ê':'e',
                 'í':'i','ì':'i','ï':'i','î':'i',
                 'ó':'o','ò':'o','ö':'o','ô':'o',
                 'ú':'u','ù':'u','ü':'u','û':'u' };
  function claveRespuesta(texto) {
    return normalizar(texto)
      .replace(/[áàäâéèëêíìïîóòöôúùüû]/g,
               function (c) { return TILDES[c]; })
      .replace(/\s*\/\s*/g, '/');
  }

  /* ¿Acierta lo tecleado contra alguna de las respuestas buenas? */
  function aciertaTecleado(dado, respuestas) {
    var k = claveRespuesta(dado);
    return todasLasVariantes(respuestas).some(function (v) {
      return claveRespuesta(v) === k;
    });
  }

  /* Cuando la palabra sirve para los dos géneros, decirlo: es una de las
     cosas buenas del euskera y este es el sitio donde se aprende sola. */
  function notaDeGenero(respuestas) {
    var hay = (respuestas || []).some(function (r) {
      return /\S\/[a-záéíóú]\b/.test(String(r));
    });
    return hay ? 'Vale para masculino y femenino: el adjetivo en euskera no tiene género.' : '';
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
  /* Las variantes de tipo «escribir» pesan más que las demás: obligan a
     producir la forma, que es lo que de verdad fija, y por eso no basta
     con que salgan como una más del montón. En el test de fin de unidad
     pesan todavía más, porque es donde más rinde producir. */
  var PESO_ESCRIBIR = 3, PESO_ESCRIBIR_TEST = 5;

  function elegirVariante(grupo) {
    var vs = grupo.variantes || [grupo];
    if (vs.length === 1) return vs[0];
    var previa = progreso.ultimas ? progreso.ultimas[grupo.id] : undefined;
    var peso = grupo.subnivel === 'test' ? PESO_ESCRIBIR_TEST : PESO_ESCRIBIR;
    var opciones = [];
    vs.forEach(function (v, i) {
      if (i === previa) return;
      var veces = v.tipo === 'escribir' ? peso : 1;
      for (var k = 0; k < veces; k++) opciones.push(i);
    });
    if (!opciones.length) opciones = vs.map(function (v, i) { return i; });
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
    // De qué tema sale, para poder abrir su ficha desde el ejercicio.
    copia.__sub = grupo.subnivel;
    /* Algunos grupos practican algo que se explica en OTRO tema: un
       ejercicio de «tener» con vocabulario del caserío, por ejemplo. Con
       `explica` apuntan a la ficha que toca, y el libro lleva allí.
       Una variante suelta puede apuntar a otra distinta que su grupo —el
       52 de un grupo de números del 11 al 19—, y entonces manda ella. */
    copia.__explica = copia.explica || grupo.explica;
    if (unidad) {
      copia.__unidad = unidad.numero + '. ' + unidad.titulo;
      copia.__uid = unidad.id;
    }
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
  /* Ojo con `esAlt`: esta función copia campo a campo, y durante un
     tiempo se lo dejó fuera. Como todo el vocabulario del repaso y de
     escuchar pasa por aquí, las otras formas castellanas válidas no
     llegaban nunca a la pregunta y se daban por malas — «gracias» por
     «muchas gracias», «muchas veces» por «askotan» (esta la cazó Ric).
     Si se añade un campo a una entrada de vocabulario, hay que añadirlo
     también aquí, o no existe. */
  function formasDe(v, unidad, titulo) {
    var base = { eu: v.eu, es: v.es, esAlt: v.esAlt, nota: v.nota, audio: v.audio,
                 registro: v.registro, categoria: v.categoria || 'otros',
                 subnivel: v.subnivel, unidad: unidad, titulo: titulo };
    if (!incluirDialectales || !v.variantes || !v.variantes.length) return [base];
    return [base].concat(v.variantes.map(function (variante) {
      return { eu: variante.eu, es: v.es, esAlt: v.esAlt, nota: variante.nota,
               audio: variante.audio, registro: variante.registro,
               categoria: variante.categoria || base.categoria,
               subnivel: v.subnivel, unidad: unidad, titulo: titulo };
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
    return '<button class="play" type="button" data-audio="' + esc(audio) + '" aria-label="Escuchar «' + esc(texto) + '»">' + icono('speaker', 12.149) + '</button>';
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
      var btn = e.target.closest('.play');
      if (btn) reproducir(btn.dataset.audio);
    });
  }

  // ─────────── Persistencia ───────────

  function progresoVacio() {
    return { version: 2, unidades: {}, ultimas: {}, srs: {}, estreno: null, repartido: 0, dias: {} };
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
      if (viejo.estreno) p.estreno = viejo.estreno;
      if (viejo.repartido) p.repartido = viejo.repartido;
      if (viejo.dias) p.dias = viejo.dias;
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

  /* Requiere que usuarioId ya esté fijado (ver onAuthStateChange), salvo
     en MODO_LOCAL sin sesión: ahí el progreso vive en localStorage, para
     no empezar de cero en cada recarga al probar sin cuenta. */
  function cargarProgreso() {
    if (!usuarioId) {
      var guardado = null;
      if (MODO_LOCAL) {
        try { guardado = JSON.parse(localStorage.getItem(claveLocal()) || 'null'); } catch (e) {}
      }
      return Promise.resolve(normalizarProgreso(guardado));
    }
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
    // Sin cuenta no hay nada que sincronizar… salvo en local, donde el
    // progreso se guarda en el navegador para no empezar de cero en
    // cada recarga (pedido por Ric mientras prueba la app).
    if (!usuarioId && !MODO_LOCAL) return;
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
    if (!usuarioId) {
      if (MODO_LOCAL) {
        try { localStorage.setItem(claveLocal(), JSON.stringify(progreso)); } catch (e) {}
      }
      return;
    }
    var ahora = new Date().toISOString();
    var query = sb.from('euskaraz_progreso').update({ data: progreso, updated_at: ahora }).eq('user_id', usuarioId);
    if (progresoActualizadoEn) query = query.eq('updated_at', progresoActualizadoEn);
    query.select('updated_at').then(function (r) {
      if (r.error) { console.error('Error guardando progreso', r.error); return; }
      if (r.data && r.data.length) { progresoActualizadoEn = ahora; return; }
      // No se actualizó ninguna fila: alguien más guardó primero. Adoptamos su versión.
      cargarProgreso().then(adoptarProgreso);
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
      cargarProgreso().then(adoptarProgreso);
    }
  });

  /* Todo progreso que entra en la app pasa por aquí, venga del arranque,
     de un conflicto al guardar o de volver a la pestaña. Antes cada sitio
     hacía `progreso = p` por su cuenta y solo el arranque repartía los
     atrasos, así que bastaba con que el servidor devolviera una copia sin
     repartir para quedarse clavado en 45. */
  function adoptarProgreso(p) {
    progreso = p;
    repartirAtrasos();
    return p;
  }

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

  /* Cuántas fichas se han estrenado hoy, por tipo ('g' de grupo, 'v' de
     palabra). Va con el día pegado para que a medianoche vuelva a cero
     sola, sin tener que limpiarla desde ningún sitio. */
  function estrenosHoy(tipo) {
    var e = progreso.estreno;
    return (e && e.dia === hoy()) ? (e[tipo] || 0) : 0;
  }

  function apuntarEstreno(clave) {
    var e = progreso.estreno;
    if (!e || e.dia !== hoy()) e = progreso.estreno = { dia: hoy(), g: 0, v: 0 };
    var tipo = clave.charAt(0);
    e[tipo] = (e[tipo] || 0) + 1;
  }

  function anotar(clave, ok) {
    if (!clave) return;
    var f = progreso.srs[clave];
    if (!f) {
      f = progreso.srs[clave] = { paso: 0, toca: 0, aciertos: 0, fallos: 0, visto: 0 };
      apuntarEstreno(clave);
    }
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
    var flojos = [], veteranos = [], nuevos = [], resto = [], tipo = null;

    candidatos.forEach(function (c, orden) {
      var clave = claveDe(c);
      if (tipo === null) tipo = clave.charAt(0);
      var f = ficha(clave);
      if (!f)                 nuevos.push({ c: c, orden: orden });
      else if (f.toca <= dia) (f.paso <= 1 ? flojos : veteranos).push({ c: c, f: f, orden: orden });
      else                    resto.push({ c: c, f: f, orden: orden });
    });

    // Dentro de cada montón manda la urgencia, y a igualdad, lo más fallado.
    function urgencia(a, b) {
      if (a.f.toca !== b.f.toca) return a.f.toca - b.f.toca;
      if (a.f.fallos !== b.f.fallos) return b.f.fallos - a.f.fallos;
      return a.orden - b.orden;
    }
    flojos.sort(urgencia);
    veteranos.sort(urgencia);
    nuevos.sort(function (a, b) { return a.orden - b.orden; });
    resto.sort(function (a, b) { return a.f.toca - b.f.toca; });

    // Las novedades tienen cupo diario; lo ya estrenado hoy resta.
    nuevos = nuevos.slice(0, Math.max(0, CUPO_NUEVOS - estrenosHoy(tipo || 'g')));

    /* Se reserva sitio a tres cosas —un par de palabras sin estrenar, lo
       que fallaste hace poco y lo que aprobaste hace mucho— y luego se
       rellena con lo que haya. Si un montón está vacío su hueco se lo
       quedan los otros: nadie se queda fuera por falta de sitio. */
    var cola = nuevos.slice(0, MIN_NUEVOS)
       .concat(flojos.slice(0, Math.round(cuantos * MEZCLA.flojo)))
       .concat(veteranos.slice(0, Math.round(cuantos * MEZCLA.veterano)));
    [flojos, veteranos, nuevos, resto].forEach(function (monton) {
      monton.forEach(function (x) {
        if (cola.length < cuantos && cola.indexOf(x) < 0) cola.push(x);
      });
    });

    return barajar(cola.slice(0, cuantos).map(function (x) { return x.c; }));
  }

  /* Cuando el atasco se dispara, se escalona: lo vencido se reparte por
     los días siguientes, TOPE_DIA por día y por orden de urgencia. Los
     primeros TOPE_DIA siguen siendo de hoy, y ninguna ficha se adelanta
     —solo se mueven hacia adelante—, así que no se pierde ni se perdona
     nada: se hace cola en vez de montón.

     Sirve para dos cosas. Una, de una vez: el atasco que dejó la escala
     corta, que cambiarla no quita por sí solo, porque las fechas ya
     estaban guardadas. Y otra, siempre: volver después de dos semanas
     sin abrir la app y encontrarte 400 pendientes es la otra forma de
     abandonar.

     El disparador es el propio tope, y esto importa: en cuanto lo
     vencido pasa de TOPE_DIA se reparte, así que la cifra de la portada
     nunca lo supera porque es verdad, no porque se recorte al pintarla.
     Un tope de pintura diría 45 con 87 detrás, y al terminar esos 45
     seguiría diciendo 45. Repartiendo, terminas el día y pone
     "¡Completado!".

     No lleva candado de "una vez al día", y es a propósito. Lo llevó, y
     Ric se encontró 45 en repaso y 45 en vocabulario que no bajaban por
     mucho que jugara: el reparto solo estaba enganchado al arranque, y
     hay tres sitios más donde se adopta un progreso —el conflicto al
     guardar, la vuelta a la pestaña y el cambio de sesión— que se lo
     saltaban. Con la condición de arriba ya no hace falta candado: en
     cuanto reparte, lo vencido baja del tope y la siguiente llamada no
     hace nada. Se puede llamar cuantas veces se quiera. */
  var REPARTIR_DESDE = TOPE_DIA;

  /* Qué fichas pueden llegar a salir hoy. Importa desde que el repaso
     solo coge unidades superadas: las de una unidad que aún no has
     ganado siguen guardadas en el calendario —con su historial, para
     cuando vuelvan— pero no deben ocupar sitio en el cupo del día, o el
     día se llenaría de cosas que no vas a ver y la portada enseñaría un
     puñado en vez de las 45 que tocan. */
  function clavesVivas() {
    if (!CURSO) return null;          // sin curso cargado, se reparte todo
    var vivas = {};
    fondoRepaso().forEach(function (x) { vivas[claveDeFondo(x)] = 1; });
    fondoVocabulario().forEach(function (v) { vivas[claveDeVocab(v)] = 1; });
    return vivas;
  }

  function repartirAtrasos() {
    var dia = hoy(), vivas = clavesVivas();
    var vencidos = Object.keys(progreso.srs).filter(function (k) {
      return progreso.srs[k].toca <= dia && (!vivas || vivas[k]);
    });
    if (vencidos.length <= REPARTIR_DESDE) return 0;
    progreso.repartido = dia;
    vencidos.sort(function (a, b) {
      var fa = progreso.srs[a], fb = progreso.srs[b];
      if (fa.toca !== fb.toca) return fa.toca - fb.toca;
      return (fb.fallos || 0) - (fa.fallos || 0);
    });
    vencidos.forEach(function (k, i) {
      progreso.srs[k].toca = dia + Math.floor(i / TOPE_DIA);
    });
    guardarProgreso();
    return vencidos.length;
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
    /* `nuevos` son las que nunca se han preguntado. No es una deuda: es
       la materia esperando turno, y solo entran CUPO_NUEVOS al día. Lo
       que importa para la portada es cuántas de esas caben HOY —si el
       cupo ya está gastado, hoy no hay nada que estrenar y decir «136
       sin estrenar» hace pensar que la app no te hace caso (lo dijo Ric:
       «yo hago repasos y ese número no baja»). */
    var tipo = candidatos.length ? claveDe(candidatos[0]).charAt(0) : 'g';
    r.estrenables = Math.min(r.nuevos, Math.max(0, CUPO_NUEVOS - estrenosHoy(tipo)));
    /* Red de seguridad: repartirAtrasos() deja lo vencido por debajo del
       tope al arrancar, así que casi siempre `hoy` y `vencidos` son lo
       mismo. Solo se separan si algo vence con la app ya abierta. */
    r.hoy = Math.min(r.vencidos, TOPE_DIA);
    return r;
  }

  /* «12 pendientes hoy», «todo al día · 30 palabras nuevas», etc. */
  function frasePendientes(r, singular, plural) {
    if (!r.total) return '';
    if (r.vencidos) {
      return r.hoy + (r.hoy === 1 ? ' ' + singular + ' para hoy' : ' ' + plural + ' para hoy');
    }
    /* Lo que queda sin estrenar ya no se dice aquí. Es un número que no
       baja al ritmo al que uno repasa —entran unas pocas por sesión— y
       en la portada se leía como una tarea pendiente que no avanzaba
       («yo hago repasos y ese número no baja», Ric). Vive en Tu cuenta,
       que es donde se mira el estado sin que te esté pidiendo nada. */
    return 'Al día · vuelve cuando quieras';
  }

  // ─────────── Navegación ───────────

  /* Las cuatro secciones de la app. En el móvil van en la barra de abajo
     (solo iconos); en escritorio, en el menú lateral, con su nombre. */
  var TABS = [
    ['today',      'calendar',   'Hoy'],
    ['lessons',    'dictionary', 'Lecciones'],
    ['progress',   'stats',      'Progreso'],
    ['dictionary', 'quote',      'Diccionario']
  ];

  // Qué pestaña se ilumina en cada pantalla.
  var TAB_DE = { home: 'today', lessons: 'lessons', unit: 'lessons', progress: 'progress',
                 dict: 'dictionary', cuenta: 'account' };
  // Pantallas con barra de abajo en el móvil.
  var CON_TABBAR = { home: 1, lessons: 1, progress: 1, dict: 1 };
  /* Pantallas de foco: sin menú lateral en escritorio, como en el diseño.
     Aquí se está aprendiendo, y el menú solo distrae. */
  var FOCO = { sub: 1, gram: 1, vocab: 1, quiz: 1, result: 1 };

  function pintarNavegacion() {
    el.tabbarItems.innerHTML = TABS.map(function (t) {
      return '<button class="tab" type="button" data-tab="' + t[0] + '" aria-label="' + t[2] + '">' +
        icono(t[1], 24) + '</button>';
    }).join('');
    el.sidenavItems.innerHTML = TABS.map(function (t) {
      return '<button class="sidenav__item" type="button" data-tab="' + t[0] + '">' +
        icono(t[1], 24) + '<span>' + t[2] + '</span></button>';
    }).join('');
    el.sidenav.querySelector('.sidenav__logo').innerHTML = icono('logo', 40);
    pintarCuentaLateral();
  }

  function pintarCuentaLateral() {
    el.sidenavCuenta.innerHTML = icono('user', 24) + '<span>' + esc(usuarioNombre || 'Tu cuenta') + '</span>';
  }

  function marcarTab(tab) {
    [el.tabbarItems, el.sidenavItems].forEach(function (cont) {
      Array.prototype.forEach.call(cont.children, function (b) {
        b.classList.toggle('is-on', b.dataset.tab === tab);
      });
    });
    el.sidenavCuenta.classList.toggle('is-on', tab === 'account');
  }

  function irATab(tab) {
    if (estado.pantalla === 'quiz' &&
        !confirm('¿Salir de la práctica? Perderás el avance de esta sesión.')) return;
    if (tab === 'today')           pantallaHome();
    else if (tab === 'lessons')    pantallaLecciones();
    else if (tab === 'progress')   pantallaProgreso();
    else if (tab === 'dictionary') pantallaDiccionario();
    else if (tab === 'account')    pantallaCuenta();
  }

  function mostrar(nombre) {
    estado.pantalla = nombre;
    for (var k in el.screens) {
      el.screens[k].hidden = (k !== nombre);
    }
    el.screenAuth.hidden = true;
    document.body.classList.toggle('con-tabbar', !!CON_TABBAR[nombre]);
    document.body.classList.toggle('con-lateral', !FOCO[nombre]);
    marcarTab(TAB_DE[nombre] || null);
    el.sheet.hidden = (nombre !== 'quiz');
    cerrarModal();
    ocultarFeedback();
    window.scrollTo(0, 0);
  }

  /* La cabecera cambia por pantalla. Tipos:
       home    — el logo y el acceso a la cuenta
       ajustes — el logo y la equis para salir
       atras   — el botón de volver, con algo opcional a la derecha
       pasos   — volver, la barra por segmentos y el «2/5»
     `raiz` marca las secciones principales: en escritorio el menú lateral
     ya hace de navegación y la cabecera sobra. */
  function cabecera(tipo, o) {
    o = o || {};
    var h = el.hdr, html = '';
    var volver = '<button class="backbtn" type="button" data-accion="atras" aria-label="Volver">' + icono('arrow-left', 24) + '</button>';
    var logo = '<button class="hdr__logo" type="button" data-accion="home" aria-label="Hoy">' + icono('logo', 40) + '</button>';
    if (tipo === 'home') {
      html = logo + '<button class="hdr__icon" type="button" data-accion="cuenta" aria-label="Tu cuenta">' + icono('user', 24) + '</button>';
    } else if (tipo === 'ajustes') {
      html = logo + '<button class="hdr__icon" type="button" data-accion="atras" aria-label="Cerrar">' + icono('close', 24) + '</button>';
    } else if (tipo === 'atras') {
      html = volver + (o.derecha || '');
    } else if (tipo === 'pasos') {
      html = volver + '<div class="steps">' + segmentos(o.total, o.hechos) + '</div>' +
             '<span class="steps__lbl">' + esc(o.etiqueta || '') + '</span>';
    }
    h.className = 'hdr' + (tipo === 'home' ? ' hdr--home' : '') + (o.raiz ? ' hdr--raiz' : '');
    h.innerHTML = html;
  }

  /* Un segmento por paso. `hechos` admite decimales: el paso en curso sale
     a medias, como en el diseño. Con muchos pasos los segmentos se
     quedarían en rayitas, así que por encima de 20 es una barra seguida. */
  function segmentos(total, hechos) {
    total = Math.max(1, total || 1);
    if (total > 20) {
      var pct = Math.max(0, Math.min(100, hechos / total * 100));
      return '<div class="steps__seg' + (pct > 0 ? ' is-on' : '') + '"><span style="width:' + pct + '%"></span></div>';
    }
    var out = '';
    for (var i = 0; i < total; i++) {
      var f = Math.max(0, Math.min(1, hechos - i));
      out += '<div class="steps__seg' + (f > 0 ? ' is-on' : '') + '"><span style="width:' + (f * 100) + '%"></span></div>';
    }
    return out;
  }

  function atras() {
    switch (estado.pantalla) {
      case 'unit':
        if (estado.desdeHome) pantallaHome(); else pantallaLecciones();
        break;
      case 'sub':
        pantallaUnidad(estado.unidad);
        break;
      case 'gram':
        // Dentro de las fichas, atrás es la ficha anterior.
        if (estado.fichaIdx > 0) { pantallaGramatica(estado.fichaIdx - 1); break; }
        /* falls through */
      case 'vocab':
        // Dentro de un subnivel se vuelve al subnivel, no a la unidad.
        if (estado.subnivel && estado.subnivel !== 'test') pantallaSubnivel(estado.subnivel);
        else pantallaUnidad(estado.unidad);
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
  /* Al terminar se vuelve a la portada de la unidad —no al subnivel—
     para ver de un vistazo qué queda por hacer. La unidad siempre se
     puede volver a abrir: reforzar lo de atrás es parte del método. */
  function salirDeSesion() {
    if (estado.modo === 'unidad' && estado.unidad) pantallaUnidad(estado.unidad);
    else pantallaHome();
  }

  // ─────────── Actividad diaria (racha) ───────────

  /* Para la racha y las cifras de Progreso hace falta saber qué días has
     practicado y cuánto. Se guarda un contador por día dentro del
     progreso —[aciertos, respuestas]— y se podan los días de más de un
     año, para que la fila de Supabase no crezca sin fin. */
  function apuntarActividad(ok) {
    if (!progreso.dias) progreso.dias = {};
    var d = hoy();
    var x = progreso.dias[d] || (progreso.dias[d] = [0, 0]);
    if (ok) x[0]++;
    x[1]++;
    Object.keys(progreso.dias).forEach(function (k) {
      if (+k < d - 400) delete progreso.dias[k];
    });
  }

  function diaActivo(d) {
    var x = progreso.dias && progreso.dias[d];
    return !!(x && x[1] > 0);
  }

  /* Días seguidos practicando. Si hoy todavía no has hecho nada, la racha
     no se rompe: cuenta hasta ayer. */
  function rachaActual() {
    var d = hoy(), n = 0;
    if (!diaActivo(d)) d--;
    while (diaActivo(d)) { n++; d--; }
    return n;
  }

  function rachaMasLarga() {
    var dias = Object.keys(progreso.dias || {}).map(Number)
      .filter(diaActivo).sort(function (a, b) { return a - b; });
    var mejor = 0, actual = 0, previo = null;
    dias.forEach(function (d) {
      actual = (previo !== null && d === previo + 1) ? actual + 1 : 1;
      if (actual > mejor) mejor = actual;
      previo = d;
    });
    return mejor;
  }

  /* Los siete días de esta semana, de lunes a domingo: hecho, sin hacer
     (lo que ya pasó o es hoy) o por venir. */
  function semana() {
    var d = hoy(), dow = (new Date().getDay() + 6) % 7, lunes = d - dow;
    return ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(function (l, i) {
      var dia = lunes + i;
      var s = dia > d ? 'off' : (diaActivo(dia) ? 'ok' : 'inc');
      return '<span class="day' + (s === 'ok' ? ' day--ok' : s === 'off' ? ' day--off' : '') + '">' + l + '</span>';
    }).join('');
  }

  /* Lo de los últimos siete días: aciertos, respuestas y días con algo. */
  function ultimaSemana() {
    var d = hoy(), a = 0, t = 0, activos = 0;
    for (var i = 0; i < 7; i++) {
      var x = progreso.dias && progreso.dias[d - i];
      if (x && x[1]) { a += x[0]; t += x[1]; activos++; }
    }
    return { aciertos: a, total: t, activos: activos };
  }

  // ─────────── Pantalla: hoy ───────────

  /* La lección de turno es la primera unidad sin completar —nota ≥70% en
     su test—. Con el curso acabado, la última. */
  function unidadDeTurno() {
    for (var i = 0; i < CURSO.unidades.length; i++) {
      if (!progUnidad(CURSO.unidades[i].id).completada) return CURSO.unidades[i];
    }
    return CURSO.unidades[CURSO.unidades.length - 1];
  }

  function saludo() {
    return 'Kaixo' + (usuarioNombre ? ', ' + usuarioNombre : '') + '!';
  }

  /* Cuántas de las fichas de un montón has hecho hoy: las que tienen la
     última respuesta fechada hoy. Sirve para el anillo de los repasos. */
  function hechosHoy(candidatos, claveDe) {
    var d = hoy(), n = 0;
    candidatos.forEach(function (c) {
      var f = ficha(claveDe(c));
      if (f && f.visto === d) n++;
    });
    return n;
  }

  /* El tono de texto de una familia sobre su fondo suave. En las familias
     claras —naranja, amarillo, pistacho, verde, turquesa— el tono normal no
     se lee sobre el suave, así que va el fuerte. */
  function colorTexto(u) {
    var n = ((u && u.numero ? u.numero : 1) - 1) % FAMILIAS.length, f = familia(u);
    return [1, 2, 3, 4, 5].indexOf(n) !== -1 ? f.strong : f.c;
  }

  function pantallaHome() {
    /* Última red: si por donde sea llega un progreso con más atraso del
       que cabe en un día, se reparte antes de contar. Así la cifra que
       se pinta es siempre la de un día de trabajo de verdad. */
    repartirAtrasos();
    ponerFamilia(null);
    cabecera('home', { raiz: true });

    /* La lección de turno, con las dos siguientes asomando por encima.
       Tocar una de las de arriba la trae delante; tocar la de delante
       la abre. */
    var turno = unidadDeTurno(), i0 = CURSO.unidades.indexOf(turno);
    var pila = CURSO.unidades.slice(i0, i0 + 3).reverse();
    var activa = pila.filter(function (u) { return u.id === estado.homeActiva; })[0] || turno;

    /* Las de encima asoman por arriba, cada una sobre la anterior; las de
       debajo se meten por detrás de la abierta, cada una por detrás de la
       que tiene encima. Por eso el orden de pintado va por posición. */
    var iActiva = pila.indexOf(activa);
    var tarjetas = pila.map(function (u, i) {
      var f = familia(u), titulo = u.numero + '. ' + u.titulo;
      if (u !== activa) {
        var debajo = i > iActiva;
        return '<button class="peek' + (debajo ? ' peek--debajo' : '') + '" type="button" data-pila="' + esc(u.id) + '"' +
          ' style="--c:' + f.c + ';z-index:' + (debajo ? 10 - (i - iActiva) : i + 1) + '">' + esc(titulo) + '</button>';
      }
      var pct = Math.round(progresoUnidad(u).ratio * 100);
      return '<button class="lcard" type="button" data-unidad="' + esc(u.id) + '" style="--c:' + f.c + ';z-index:10">' +
        '<span class="lcard__top">' +
          '<span class="lcard__row">' +
            '<span class="lcard__title">' + esc(titulo) + '</span>' +
            '<span class="lcard__pct"><b>' + pct + '</b><small>%</small></span>' +
          '</span>' +
          '<span class="lcard__sub">' + esc(u.subtitulo) + '</span>' +
        '</span>' +
        '<span class="bar"><span style="width:' + pct + '%"></span></span>' +
      '</button>';
    }).join('');

    /* Los dos repasos, en el color de la lección en curso. La cifra es lo
       que queda para hoy y el anillo lo que ya llevas hecho hoy de ese
       repaso: sin empezar, la tarjeta sale apagada; a medias, el anillo a
       medias; terminado, el anillo lleno con su check. */
    var ft = familia(turno), ink = colorTexto(turno);
    function repaso(id, titulo, fondo, claveDe, minimo) {
      var valor = '–', hechos = 0, quedan = 0, abierto = fondo.length >= minimo;
      if (abierto) {
        var r = recuento(fondo, claveDe);
        quedan = r.hoy;
        hechos = hechosHoy(fondo, claveDe);
        valor = String(quedan);
      }
      var total = hechos + quedan;
      var terminado = abierto && total > 0 && quedan === 0;
      var apagada = !abierto || hechos === 0;
      /* Apagada no es opacidad (eso también lava el texto): es el tono
         normal de la familia en vez del fuerte, sobre el mismo fondo
         suave — se ve lavada pero el texto sigue al 100%. */
      var tinta = apagada ? ft.c : ink;
      return '<button class="scard' + (apagada ? ' scard--off' : '') + '" type="button" id="' + id + '"' +
        ' style="--sc:' + tinta + ';--sc-soft:' + ft.soft + '">' +
        '<span class="scard__t">' + titulo + '</span>' +
        '<span class="scard__row"><span class="scard__v">' + valor + '</span>' +
          anillo(total ? hechos / total * 100 : 0, { tam: 32, color: tinta, hecho: terminado }) + '</span>' +
      '</button>';
    }

    el.screens.home.innerHTML =
      '<div class="home">' +
        '<h1 class="pagetitle">' + esc(saludo()) + '\nEuskaraz pixka bat?</h1>' +
        '<div class="lstack">' + tarjetas + '</div>' +
        '<div class="reviews">' +
          repaso('goVocabRepaso', 'Repaso de\nvocabulario', fondoVocabulario(), claveDeVocab, 4) +
          repaso('goRepaso', 'Repaso\nmezclado', fondoRepaso(), claveDeFondo, 1) +
        '</div>' +
        '<div class="home__spacer"></div>' +
        '<div class="racha"><span class="racha__lbl">Racha</span>' +
          '<span class="racha__dias">' + semana() + '</span></div>' +
      '</div>';

    mostrar('home');
  }

  // ─────────── Pantalla: lecciones ───────────

  function pantallaLecciones() {
    ponerFamilia(null);
    cabecera('atras', { raiz: true });
    var hechas = CURSO.unidades.filter(function (u) { return progUnidad(u.id).completada; }).length;
    var titulo = hechas
      ? 'Segi aurrera!\nLlevas ' + plural(hechas, 'lección', 'lecciones')
      : 'Hasi gaitezen!\nTu primera lección te espera';

    /* El color dice cómo vas: de un 10% de opacidad sin empezar hasta el
       100% (el color sólido) al completarla, según el ratio de avance. */
    var filas = CURSO.unidades.map(function (u) {
      var f = familia(u), pu = progresoUnidad(u);
      var alfa = pu.completada ? 1 : 0.1 + 0.9 * pu.ratio;
      var bg = 'rgba(' + f.raw + ',' + alfa + ')';
      return '<button class="lrow" type="button" data-unidad="' + esc(u.id) + '" style="--bg:' + bg + '">' +
        '<span class="lrow__n">' + esc(u.numero) + '</span>' +
        '<span class="lrow__txt"><span class="lrow__t">' + esc(u.titulo) + '</span>' +
          '<span class="lrow__s">' + esc(u.subtitulo) + '</span></span>' +
        anillo(pu.ratio * 100, { tam: 36, color: 'rgb(10,10,10)', hecho: pu.completada }) +
      '</button>';
    }).join('');

    el.screens.lessons.innerHTML =
      '<div class="stack">' +
        '<h1 class="pagetitle">' + esc(titulo) + '</h1>' +
        '<div class="llist">' + filas + '</div>' +
      '</div>';
    mostrar('lessons');
  }

  // ─────────── Pantalla: progreso ───────────

  function statBar(valor, sufijo, etiqueta, fill, color, suave) {
    return '<div class="statbar" style="--sb:' + color + ';--sb-soft:' + suave + '">' +
      '<span class="statbar__fill" style="width:' + Math.max(0, Math.min(100, fill)) + '%"></span>' +
      '<span class="statbar__v"><b>' + esc(valor) + '</b><small>' + esc(sufijo) + '</small></span>' +
      '<span class="statbar__l">' + esc(etiqueta) + '</span>' +
    '</div>';
  }

  function tarjetaDato(titulo, valor, sufijo, color, suave) {
    return '<div class="scard" style="--sc:' + color + ';--sc-soft:' + suave + '">' +
      '<span class="scard__t">' + esc(titulo) + '</span>' +
      '<span class="scard__v">' + esc(valor) + '<small>' + esc(sufijo) + '</small></span>' +
    '</div>';
  }

  /* El rosco se reparte entre las unidades: a cada una le toca una
     porción igual, que se llena según lo que llevas de ella y con su
     color. Las porciones van seguidas desde arriba, en orden de unidad,
     sin dejar hueco a las que aún no has empezado: si llevas la 1 entera
     y un poco de la 2 y de la 6, lo de la 6 va justo detrás de lo de la 2,
     no en su sitio. Una raya blanca separa cada tramo. */
  function arcoCurso() {
    var n = CURSO.unidades.length, pos = 0, tramos = [];
    CURSO.unidades.forEach(function (u) {
      var r = progresoUnidad(u).ratio;
      if (r <= 0) return;
      var largo = r / n * 100, fin = pos + largo;
      var corte = largo > 1.2 ? fin - 0.5 : fin;   // los tramos mínimos, sin raya
      tramos.push(familia(u).c + ' ' + pos.toFixed(2) + '% ' + corte.toFixed(2) + '%');
      if (corte < fin) tramos.push('rgb(255,255,255) ' + corte.toFixed(2) + '% ' + fin.toFixed(2) + '%');
      pos = fin;
    });
    if (!tramos.length) return 'transparent';
    return 'conic-gradient(' + tramos.join(', ') + ', transparent ' + pos.toFixed(2) + '% 100%)';
  }

  function pantallaProgreso() {
    ponerFamilia(null);
    cabecera('atras', { raiz: true });

    var n = CURSO.unidades.length;
    var hechas = CURSO.unidades.filter(function (u) { return progUnidad(u.id).completada; }).length;
    var suma = CURSO.unidades.reduce(function (s, u) { return s + progresoUnidad(u).ratio; }, 0);
    var curso = Math.round(suma / n * 100);
    var racha = rachaActual();
    var titulo = racha
      ? 'Zorionak! Tienes\nuna racha de ' + plural(racha, 'día', 'días')
      : 'Hoy es un buen día\npara empezar la racha';

    var sem = ultimaSemana();
    var aciertos = sem.total ? Math.round(sem.aciertos / sem.total * 100) : 0;
    var vistas = Object.keys(progreso.srs).filter(function (k) { return k.charAt(0) === 'v'; }).length;
    var totalPalabras = diccionario().length || 1;
    var media = sem.activos ? Math.round(sem.total / sem.activos) : 0;

    el.screens.progress.innerHTML =
      '<div class="stack">' +
        '<div class="donut" style="--arco:' + arcoCurso() + '">' +
          '<div class="donut__in"><b>' + curso + '<small>%</small></b>' +
          '<span>' + hechas + ' de ' + n + ' unidades</span></div>' +
        '</div>' +
        '<h1 class="pagetitle">' + esc(titulo) + '</h1>' +
        '<div class="statbars">' +
          statBar(aciertos, '%', 'Aciertos\nsemanal', aciertos, 'rgb(62,214,123)', 'rgb(226,248,234)') +
          statBar(vistas, '', 'Palabras\nvistas', vistas / totalPalabras * 100, 'rgb(92,216,173)', 'rgb(231,249,244)') +
          statBar(hechas, '/' + n, 'Unidades\ncompletadas', hechas / n * 100, 'rgb(64,164,250)', 'rgb(217,237,254)') +
          '<div class="reviews">' +
            tarjetaDato('Media\ndiaria', media, 'ejerc.', 'rgb(134,110,241)', 'rgb(233,233,253)') +
            tarjetaDato('Racha\nmás larga', rachaMasLarga(), 'días', 'rgb(134,110,241)', 'rgb(233,233,253)') +
          '</div>' +
        '</div>' +
      '</div>';
    mostrar('progress');
  }

  // ─────────── Pantalla: portada de unidad ───────────

  /* ── Subniveles ──

     Una unidad puede venir partida en subniveles: porciones pequeñas con
     su explicación, su vocabulario y sus ejercicios, y un test al final
     que mezcla toda la unidad.

     El reparto es por etiqueta: cada ficha, palabra y grupo lleva un
     campo `subnivel` con el id de su porción ("4.3"), y los grupos del
     test final lo llevan a "test". Es aditivo: una unidad sin
     `subniveles` se pinta como siempre, con sus tres tarjetas. */

  function tieneSubniveles(u) {
    return !!(u && u.subniveles && u.subniveles.length);
  }

  /* Filtra por subnivel. Sin filtro activo devuelve todo, que es lo que
     necesitan el repaso y las unidades sin partir. */
  function delSubnivel(lista, sub) {
    if (!sub) return lista || [];
    return (lista || []).filter(function (x) { return x.subnivel === sub; });
  }

  /* Las fichas de dialecto («Cómo suena esto en Bizkaia», marcadas con
     registro: 'bizkaiera') solo salen cuando el switch de la cabecera está
     en tu variante. En Batua se ve la explicación genérica y nada más
     — petición de Ric: si has elegido no que te pregunten en bizkaiera,
     tampoco tiene sentido llenarte la lección de bizkaiera.
     Ojo: esto NO afecta al vocabulario. Ahí las dos formas siguen
     visibles y etiquetadas, que es la decisión de Miguel en el brief 5.1. */
  function gramaticaVisible(lista) {
    if (incluirDialectales) return lista || [];
    return (lista || []).filter(function (g) { return g.registro !== 'bizkaiera'; });
  }

  function contenidoSub(u, sub) {
    return {
      gramatica:  gramaticaVisible(delSubnivel(u.gramatica, sub)),
      vocabulario:delSubnivel(u.vocabulario, sub),
      ejercicios: delSubnivel(u.ejercicios, sub)
    };
  }

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

  function pantallaUnidad(u, desde) {
    if (desde === 'home') estado.desdeHome = true;
    else if (desde === 'lessons') estado.desdeHome = false;
    estado.unidad = u;
    estado.subnivel = null;
    progUnidad(u.id).visitada = true;
    guardarProgreso();
    precargarAudioDeUnidad(u);
    ponerFamilia(u);
    cabecera('atras');

    var cuerpo;
    if (tieneSubniveles(u)) {
      cuerpo = '<div class="sublist">' + filasSubniveles(u) + '</div>';
    } else {
      /* Unidad sin partir (el curso viejo): sus tres puertas directas. */
      cuerpo = '<div class="navrows navrows--sub">' + puertasDeTema(contenidoSub(u, null)) + '</div>';
    }

    el.screens.unit.innerHTML =
      '<div class="stack">' +
        '<h1 class="pagetitle">' + esc(u.numero + '. ' + u.titulo + '\n' + u.subtitulo) + '</h1>' +
        (u.objetivo ? '<p class="lead lead--22">' + esc(u.objetivo) + '</p>' : '') +
        '<div class="divider"></div>' +
        '<div class="ustats">' +
          '<div class="ustat"><b>' + (tieneSubniveles(u) ? u.subniveles.length : 1) + '</b><span>temas</span></div>' +
          '<div class="ustat"><b>' + u.vocabulario.length + '</b><span>palabras</span></div>' +
          '<div class="ustat"><b>' + u.ejercicios.length + '</b><span>ejercicios</span></div>' +
        '</div>' +
        '<div class="divider"></div>' +
        cuerpo +
      '</div>';

    mostrar('unit');
  }

  /* Qué se ha hecho ya de cada subnivel. Se guarda dentro del progreso de
     la unidad, en un mapa aparte, para no tocar el shape del calendario
     de repaso (que va por id de grupo, no por subnivel). */
  /* Cuánto llevas de una unidad partida en subniveles: la media de sus
     porciones, contando el test como una más. Una unidad sin subniveles
     sigue funcionando como siempre, con su propia nota. */
  function progresoUnidad(u) {
    var p = progUnidad(u.id);
    if (!tieneSubniveles(u)) {
      return { ratio: p.mejor || 0, hechos: p.completada ? 1 : 0, total: 1,
               completada: !!p.completada };
    }
    var partes = u.subniveles.map(function (s) {
      return (progSub(u.id, s.id).mejor) || 0;
    });
    if (delSubnivel(u.ejercicios, 'test').length) partes.push(p.mejor || 0);
    var hechos = partes.filter(function (r) { return r >= 0.7; }).length;
    var suma = partes.reduce(function (a, b) { return a + b; }, 0);
    return {
      ratio: partes.length ? suma / partes.length : 0,
      hechos: hechos, total: partes.length,
      // La unidad se da por hecha cuando se ha superado su test.
      completada: !!p.completada
    };
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function progSub(unidadId, subId) {
    var p = progUnidad(unidadId);
    if (!p.subs) p.subs = {};
    if (!p.subs[subId]) p.subs[subId] = { visitado: false, mejor: 0 };
    // `visitado` es haber abierto la portada del tema; `desbloqueado` es
    // haber entrado a su gramática o a su vocabulario, que es lo que mete
    // sus palabras en el repaso general (criterio de Ric).
    if (p.subs[subId].desbloqueado === undefined) p.subs[subId].desbloqueado = false;
    return p.subs[subId];
  }

  /* Una fila de la lista de temas: la insignia con su anillo, el título
     (en euskera, con el castellano debajo cuando lo hay) y cómo vas. */
  function filaTema(o) {
    var f = familia(estado.unidad);
    var ink = 'rgb(20,19,20)';
    var color = o.estado === 'todo' || o.estado === 'vacio' ? ink : f.strong;
    var valor = o.estado === 'done' ? 100 : (o.estado === 'current' ? o.pct : 0);
    var insignia = anillo(valor, { tam: 52, color: color, etiqueta: o.numero, icono: o.icono });
    var estadoTxt = '<span class="ustatus' + (o.estado === 'done' ? ' ustatus--ok' : '') + '">' +
      '<span>' + esc(o.etiqueta) + '</span>' +
      (o.estado === 'current' ? '<span>·</span><span>' + o.pct + '%</span>' : '') + '</span>';
    var clase = 'srow srow--' + o.estado;
    var abre = o.estado === 'vacio' ? '<div class="' + clase + '">' : '<button class="' + clase + '" type="button" data-sub="' + esc(o.id) + '">';
    var cierra = o.estado === 'vacio' ? '</div>' : '</button>';
    return abre + insignia +
      '<span class="srow__txt"><span class="srow__t">' + esc(o.titulo) + '</span>' +
        (o.sub ? '<span class="srow__s">' + esc(o.sub) + '</span>' : '') + estadoTxt + '</span>' +
      (o.estado === 'vacio' ? '' : '<span class="srow__chev">' + icono('chevron-right', 24) + '</span>') +
    cierra;
  }

  function filasSubniveles(u) {
    var filas = u.subniveles.map(function (s) {
      var c = contenidoSub(u, s.id), ps = progSub(u.id, s.id);
      // Subnivel todavía sin escribir: se enseña, para que se vea el plan,
      // pero no se puede abrir a una pantalla vacía.
      var vacio = !(c.gramatica.length || c.vocabulario.length || c.ejercicios.length);
      var est = vacio ? 'vacio'
              : ps.mejor >= 0.7 ? 'done'
              : (ps.visitado || ps.mejor > 0) ? 'current' : 'todo';
      return filaTema({
        id: s.id, numero: s.id, estado: est, pct: Math.round((ps.mejor || 0) * 100),
        titulo: s.titulo_eu || s.titulo,
        sub: s.titulo_eu ? s.titulo : (s.resumen || ''),
        etiqueta: { done: 'Completado', current: 'En curso', todo: 'Por empezar', vacio: 'En preparación' }[est]
      });
    });

    // El test final: todos los grupos marcados como "test".
    if (delSubnivel(u.ejercicios, 'test').length) {
      var pu = progUnidad(u.id);
      var est = pu.completada ? 'done' : (pu.intentos ? 'current' : 'todo');
      filas.push(filaTema({
        id: 'test', estado: est, pct: Math.round((pu.mejor || 0) * 100),
        icono: pu.completada ? 'check-lg' : 'list',
        titulo: 'Test final',
        // El test no se queda en sus propios grupos —casi siempre 5—:
        // empezarPractica() lo completa hasta LARGO_TEST tirando de los
        // temas, así que el número que se enseña tiene que ser ese.
        sub: LARGO_TEST + ' preguntas de toda la unidad',
        etiqueta: { done: 'Completado', current: 'Por superar', todo: 'Por empezar' }[est]
      }));
    }
    return filas.join('');
  }

  /* Las tres puertas de un tema: explicación, vocabulario y práctica.
     Solo las que tienen algo dentro. */
  function puertasDeTema(c) {
    var p = [];
    if (c.gramatica.length) {
      p.push(filaNav('goGram', 'outline', 'Explicación', plural(c.gramatica.length, 'ficha gramatical', 'fichas gramaticales')));
    }
    if (c.vocabulario.length) {
      p.push(filaNav('goVoc', 'outline', 'Vocabulario', plural(c.vocabulario.length, 'palabra del tema', 'palabras del tema')));
    }
    if (c.ejercicios.length) {
      // + ESCUCHAR_PRACTICA: empezarPractica() cuela esas preguntas de
      // escuchar en cualquier sesión, y el número que se enseña tiene que
      // ser el que de verdad sale.
      p.push(filaNav('goPrac', 'filled', 'Práctica', plural(c.ejercicios.length + ESCUCHAR_PRACTICA, 'ejercicio', 'ejercicios')));
    }
    return p.join('');
  }

  function filaNav(id, variante, titulo, sub, extraSub) {
    return '<button class="navrow' + (variante ? ' navrow--' + variante : '') + '" type="button" id="' + id + '">' +
      '<span class="navrow__txt"><span class="navrow__t">' + esc(titulo) + '</span>' +
        '<span class="navrow__s">' + (extraSub || '') + '<span>' + esc(sub) + '</span></span></span>' +
      '<span class="navrow__chev">' + icono('chevron-right', 24) + '</span>' +
    '</button>';
  }

  function pantallaSubnivel(subId) {
    var u = estado.unidad;
    var s = u.subniveles.filter(function (x) { return x.id === subId; })[0];
    if (!s) return;

    estado.subnivel = subId;
    progSub(u.id, subId).visitado = true;
    guardarProgreso();
    ponerFamilia(u);
    cabecera('atras', { derecha: '<span class="hdr__code">U' + esc(u.numero) + '</span>' });

    var kicker = s.id + '. ' + (s.titulo_eu ? s.titulo_eu + '.' : '');
    var titulo = s.titulo_eu ? s.titulo : s.titulo;

    el.screens.sub.innerHTML =
      '<div class="stack">' +
        '<h1 class="subtit"><span class="subtit__k">' + esc(kicker) + '</span>' +
          '<span class="subtit__t">' + esc(titulo) + '</span></h1>' +
        (s.resumen ? '<p class="lead lead--20">' + esc(s.resumen) + '</p>' : '') +
        '<div class="navrows navrows--sub">' + puertasDeTema(contenidoSub(u, subId)) + '</div>' +
      '</div>';

    mostrar('sub');
  }

  // ─────────── Pantalla: fichas de gramática ───────────

  /* Abrir la explicación o el vocabulario de un tema desbloquea sus
     palabras para el repaso general. Se acumulan: las de los temas que
     abriste hace tres unidades siguen dentro. */
  function desbloquearTema() {
    var u = estado.unidad, id = estado.subnivel;
    if (!u || !id || id === 'test' || !tieneSubniveles(u)) return;
    progSub(u.id, id).desbloqueado = true;
    guardarProgreso();
  }

  /* Una ficha, en HTML. Lo usan la pantalla de fichas y la hoja que se
     abre desde dentro de un ejercicio: el mismo contenido y el mismo
     aspecto en los dos sitios. */
  function pintarFicha(g) {
    var ejemplos = '';
    if (g.ejemplos && g.ejemplos.length) {
      ejemplos = '<div class="divider divider--light"></div>' +
        '<div class="vlist vlist--pad">' + g.ejemplos.map(function (e) {
          return '<div class="vi"><span class="vi__w">' + esc(e.eu) + botonAudio(e) + '</span>' +
                 '<span class="vi__m">' + esc(e.es) + '</span></div>';
        }).join('') + '</div>';
    }
    return '<article class="ficha">' +
      '<h1 class="ficha__title">' + esc(g.titulo) + '</h1>' +
      '<div class="ficha__body">' + enriquecerCuerpoConAudio(richText(g.cuerpo)) + '</div>' +
      ejemplos +
    '</article>';
  }

  function pintarFichas(lista) {
    return lista.map(pintarFicha).join('');
  }

  /* Las fichas van de una en una, como en el diseño: la barra de arriba
     dice por cuál vas, y al final se pasa directo a practicar. */
  function pantallaGramatica(idx) {
    var u = estado.unidad;
    var fichas = gramaticaVisible(delSubnivel(u.gramatica, estado.subnivel));
    if (!fichas.length) return;
    idx = (typeof idx === 'number') ? Math.max(0, Math.min(idx, fichas.length - 1)) : 0;
    estado.fichaIdx = idx;
    desbloquearTema();
    ponerFamilia(u);
    cabecera('pasos', { total: fichas.length, hechos: idx + 1, etiqueta: (idx + 1) + '/' + fichas.length });

    var ultima = idx === fichas.length - 1;
    var hayPractica = delSubnivel(u.ejercicios, estado.subnivel).length > 0;
    var cta = !ultima ? 'Siguiente ficha' : (hayPractica ? 'Empezar práctica' : 'Volver al tema');

    el.screens.gram.innerHTML =
      '<div class="stack">' + pintarFicha(fichas[idx]) +
        '<button class="btn btn--ink btn--lg btn--block" type="button" id="fichaSig">' + cta + '</button>' +
      '</div>';

    $('fichaSig').addEventListener('click', function () {
      if (!ultima) pantallaGramatica(idx + 1);
      else if (hayPractica) empezarPractica();
      else atras();
    });
    mostrar('gram');
  }

  // ─────────── Pantalla: vocabulario ───────────

  /* Etiqueta de registro (sección 5.1 del brief): ninguna forma se oculta,
     batua y bizkaiera se enseñan juntas, marcadas para no mezclarlas sin
     querer. La forma batua no lleva marca: es la de por defecto. */
  function etiquetaRegistro(v) {
    return (v.registro && v.registro !== 'batua')
      ? '<span class="pill pill--dialect">' + esc(abrevRegistro(v.registro)) + '</span>' : '';
  }

  function abrevRegistro(r) {
    return { bizkaiera: 'Biz', gipuzkera: 'Gip' }[r] || r;
  }

  function fichaVocabulario(v) {
    var nota = v.nota ? '<span class="vi__nota">' + esc(v.nota) + '</span>' : '';
    var variantes = (v.variantes || []).map(function (x) {
      return '<span class="vi__var">' + esc(x.eu) + botonAudio(x) + etiquetaRegistro(x) + '</span>' +
        (x.nota ? '<span class="vi__nota">' + esc(x.nota) + '</span>' : '');
    }).join('');
    return '<div class="vi">' +
      '<span class="vi__w">' + esc(v.eu) + botonAudio(v) + etiquetaRegistro(v) + '</span>' +
      '<span class="vi__m">' + esc(v.es) + '</span>' + nota + variantes +
    '</div>';
  }

  /* Filtro por tipo de palabra del vocabulario del tema. Solo cambia qué
     se ve en la lista, no toca el progreso ni el calendario. */
  var CATEGORIAS = [['', 'Todas'], ['verbo', 'Verb'], ['sustantivo', 'Sust'], ['adjetivo', 'Adj']];

  /* La píldora del seleccionado es una capa propia, colocada por CSS con
     --i (índice) y --n (opciones); al tocar otra opción se desliza hasta
     ella (ver deslizarSeg). */
  function segmentado(id, opciones, activa) {
    var i = Math.max(0, opciones.map(function (o) { return o[0]; }).indexOf(activa));
    return '<div class="seg" id="' + id + '" role="tablist" style="--n:' + opciones.length + ';--i:' + i + '">' +
      '<span class="seg__pill" aria-hidden="true"></span>' + opciones.map(function (o) {
      return '<button class="seg__opt' + (o[0] === activa ? ' is-on' : '') + '" type="button" role="tab"' +
        ' data-valor="' + esc(o[0]) + '" aria-selected="' + (o[0] === activa) + '">' +
        (o[2] || '') + '<span>' + esc(o[1]) + '</span></button>';
    }).join('') + '</div>';
  }

  function pintarVocabulario() {
    var u = estado.unidad, cat = estado.vocabCat || '';
    // Dentro de un subnivel se enseña solo su vocabulario; el filtro de
    // tipo se aplica encima de esa selección.
    var todas = delSubnivel(u.vocabulario, estado.subnivel);
    var lista = todas.filter(function (v) { return !cat || v.categoria === cat; });
    var hayPractica = delSubnivel(u.ejercicios, estado.subnivel).length > 0;

    el.screens.vocab.innerHTML =
      '<div class="stack">' +
        '<h1 class="pagetitle">Vocabulario</h1>' +
        '<p class="lead">' + esc(plural(todas.length, 'palabra del tema', 'palabras del tema')) + '</p>' +
        segmentado('vocabSeg', CATEGORIAS, cat) +
        (lista.length
          ? '<div class="vlist">' + lista.map(fichaVocabulario).join('') + '</div>'
          : '<p class="dict__vacio">Ninguna palabra de este tema es de ese tipo.</p>') +
        (hayPractica ? '<button class="btn btn--ink btn--lg btn--block" type="button" id="vocabPractica">Empezar práctica</button>' : '') +
      '</div>';

    $('vocabSeg').addEventListener('click', function (e) {
      var b = e.target.closest('.seg__opt');
      if (!b) return;
      estado.vocabCat = b.dataset.valor;
      pintarVocabulario();
    });
    if ($('vocabPractica')) $('vocabPractica').addEventListener('click', empezarPractica);
  }

  function pantallaVocabulario() {
    var u = estado.unidad;
    // La marca de unidad entera solo tiene sentido donde no hay temas: si
    // los hay, dejarla puesta desbloquearía las 74 palabras de la unidad
    // por haber asomado a un tema.
    if (tieneSubniveles(u)) desbloquearTema();
    else { progUnidad(u.id).vocab = true; guardarProgreso(); }
    ponerFamilia(u);
    cabecera('atras', { derecha: '<span class="hdr__code">U' + esc(u.numero) + '</span>' });
    estado.vocabCat = '';
    pintarVocabulario();
    mostrar('vocab');
  }

  // ─────────── Repaso mezclado ───────────

  /* Al repaso mezclado solo entran las unidades SUPERADAS: las que has
     ganado en su test final. Antes bastaba con haberlas «visitado», y
     eso se pone al abrir la portada de la unidad —ni siquiera hacía
     falta leer una explicación—, así que sus 25-48 ejercicios entraban
     al calendario de golpe, la mayoría de cosas que aún no habías
     estudiado. Criterio de Ric: mientras no ganas la unidad, sus
     ejercicios no son repaso, son materia; se practican en la unidad,
     que es su sitio.

     El calendario de los que salen no se pierde: sus fichas siguen
     guardadas y vuelven con su historial en cuanto superas la unidad. */
  function fondoRepaso() {
    var fondo = [];
    CURSO.unidades.forEach(function (u) {
      if (!progUnidad(u.id).completada) return;
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
        if (e.audio) r.push({ eu: e.eu, es: e.es, audio: e.audio, subnivel: g.subnivel,
                              unidad: u.numero, titulo: u.titulo });
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
      alert('Aquí se mezcla lo de las unidades que ya has superado. Gana el test de la primera y vuelve.');
      return;
    }
    estado.unidad = null;
    estado.modo = 'repaso';
    var base = elegirSesion(fondo, LARGO_REPASO, claveDeFondo)
      .map(function (x) { return prepararVariante(x.grupo, x.unidad); });
    var extra = candidatosEscuchar(fondoVocabulario().concat(fondoEjemplos()), ESCUCHAR_REPASO);
    estado.ejercicios = barajar(base.concat(extra));
    if (!estado.ejercicios.length) {
      alert('Por hoy ya está: no queda nada vencido y los ejercicios nuevos del día ya han salido. Mañana entran más.');
      pantallaHome();
      return;
    }
    guardarProgreso();
    estado.indice = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
    mostrar('quiz');
    pintarEjercicio();
  }

  // ─────────── Repaso de vocabulario ───────────

  /* Solo palabras de unidades cuyo vocabulario ya has abierto (no basta
     con haber entrado a la portada), sin repetir la misma palabra en
     euskera aunque salga en dos unidades. Se guarda la unidad de origen
     para poder sacar distractores de la misma lección. */
  /* Las palabras que ya se han desbloqueado, de todas las unidades. Es
     aditivo: se van sumando conforme abres temas, y las de atrás no se
     caen nunca (petición de Ric).

     Antes esto iba por unidad entera y con la señal equivocada: bastaba
     abrir la pantalla de Vocabulario para meter sus 74 palabras, incluidos
     los temas sin tocar.

     Se conservan dos vías de respaldo para no dejar a nadie sin bolsa:
     las unidades sin temas (el curso viejo de data/unidades/), y el
     progreso guardado de antes de este cambio, que marcaba la unidad y no
     los temas — si esa marca está y no hay ningún tema abierto, se
     entiende que la unidad se vio entera. */
  function temaDesbloqueado(u, subId) {
    var p = progUnidad(u.id);
    return !!(p.subs && p.subs[subId] && p.subs[subId].desbloqueado);
  }

  function fondoVocabulario(categoria) {
    var vistas = {}, fondo = [];
    CURSO.unidades.forEach(function (u) {
      var conTemas = tieneSubniveles(u);
      var p = progUnidad(u.id);
      var algunTema = conTemas && (u.subniveles || []).some(function (s) {
        return temaDesbloqueado(u, s.id);
      });
      var unidadEntera = !conTemas ? !!p.vocab : (!!p.vocab && !algunTema);
      if (!unidadEntera && !algunTema) return;
      u.vocabulario.forEach(function (v) {
        if (categoria && (v.categoria || 'otros') !== categoria) return;
        if (!unidadEntera && !temaDesbloqueado(u, v.subnivel)) return;
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
      // `esAlt` recoge las otras formas castellanas que valen y que no
      // se pueden deducir del texto: «muchas gracias» debe aceptar
      // «gracias» (detectado por Ric). No se puede quitar el
      // intensificador por regla general, porque «muy bien» → «bien»
      // chocaría con `ondo`, que es otra palabra del curso.
      respuestas: [entrada.es].concat(entrada.esAlt || []),
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
    q.__sub     = entrada.subnivel;
    q.__unum    = entrada.unidad;
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
    /* Con el cupo del día gastado y nada vencido no queda nada que
       preguntar, y entrar llevaba derecho a la pantalla de resultado con
       un 0 de 0: parecía que la app no hacía nada. */
    if (!estado.ejercicios.length) {
      alert('Por hoy ya está: has estrenado las palabras nuevas que tocaban y no queda nada vencido. Mañana entran más.');
      pantallaHome();
      return;
    }
    estado.indice = 0;
    estado.total = estado.ejercicios.length;
    estado.aprendidas = 0;
    estado.primeras = 0;
    estado.respuestas = 0;
    estado.aciertos = 0;
    estado.fallos = 0;
    estado.falladas = [];
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
    } else if (ej.tipo === 'orden' || ej.tipo === 'escribir') {
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

  var dictCatActiva = '';

  /* Las palabras sin letra delante —los sufijos, «-ena»— van juntas en un
     primer grupo con raya, como en el diseño. */
  function letraDe(v) {
    return /^[A-ZÑ]$/.test(v.letra) ? v.letra : '—';
  }

  function ordenLetras(a, b) {
    if (a === '—') return -1;
    if (b === '—') return 1;
    return a.localeCompare(b, 'es');
  }

  function pintarDiccionario(filtro) {
    var q = plegar(filtro || '');
    var lista = diccionario().filter(function (v) {
      if (dictCatActiva && v.categoria !== dictCatActiva) return false;
      return !q || v.busca.indexOf(q) !== -1;
    });

    /* Las palabras que ya han entrado en tu repaso salen con la unidad
       marcada; las que aún no has abierto, con la unidad apagada. */
    var vistas = {};
    fondoVocabulario().forEach(function (v) { vistas[normalizar(v.eu)] = true; });

    var grupos = {};
    lista.forEach(function (v) {
      var l = letraDe(v);
      (grupos[l] || (grupos[l] = [])).push(v);
    });
    var letras = Object.keys(grupos).sort(ordenLetras);

    el.dictLetras.innerHTML = letras.map(function (l, i) {
      return '<button class="alfa__l' + (i === 0 ? ' is-on' : '') + '" type="button" data-letra="' + l + '">' + l + '</button>';
    }).join('');

    if (!lista.length) {
      el.dictContent.innerHTML = '<p class="dict__vacio">Ninguna palabra coincide.</p>';
      actualizarFlechasAlfa();
      return;
    }

    el.dictContent.innerHTML = letras.map(function (l) {
      return '<section class="dsec" id="dsec-' + (l === '—' ? 'raya' : l) + '">' +
        '<span class="dsec__h">' + l + '</span>' +
        '<div class="dsec__items">' + grupos[l].map(function (v) {
          var vista = !!vistas[normalizar(v.eu)];
          return '<div class="dentry">' +
            '<div class="dentry__row">' +
              '<span class="dentry__w">' + esc(v.eu) + botonAudio(v) + etiquetaRegistro(v) + '</span>' +
              '<span class="dentry__m">' + esc(v.es) + '</span>' +
              '<span class="dentry__u' + (vista ? '' : ' is-off') + '">u' + esc(v.unidad) + '</span>' +
            '</div>' +
            (v.nota ? '<span class="dentry__x">' + esc(v.nota) + '</span>' : '') +
          '</div>';
        }).join('') + '</div></section>';
    }).join('');
    actualizarFlechasAlfa();
  }

  function actualizarFlechasAlfa() {
    var r = el.dictLetras;
    el.alfaPrev.disabled = r.scrollLeft <= 1;
    el.alfaNext.disabled = r.scrollLeft + r.clientWidth >= r.scrollWidth - 1;
  }

  function pantallaDiccionario() {
    ponerFamilia(null);
    cabecera('atras', { raiz: true });
    el.dictTitulo.textContent = 'Hiztegia ' + diccionario().length + '\npalabras';
    el.dictSeg.outerHTML = segmentado('dictSeg', CATEGORIAS, dictCatActiva);
    el.dictSeg = $('dictSeg');
    pintarDiccionario(el.dictInput.value);
    mostrar('dict');
    actualizarFlechasAlfa();
  }

  // ─────────── Modal ───────────

  function abrirModal(html, clase) {
    el.modalPanel.className = 'modal__panel' + (clase ? ' ' + clase : '');
    el.modalPanel.innerHTML = html;
    el.modal.hidden = false;
  }

  function cerrarModal() {
    if (el.modal.hidden) return;
    el.modal.hidden = true;
    el.modalPanel.innerHTML = '';
  }

  /* Un diálogo de dos botones: confirmar y cancelar. `campo` añade una
     caja de texto (cambiar correo, cambiar contraseña). */
  function dialogo(o) {
    abrirModal(
      '<h2>' + esc(o.titulo) + '</h2>' +
      '<p>' + esc(o.texto) + '</p>' +
      (o.campo ? '<input class="field" id="modalCampo" type="' + o.campo.tipo + '" placeholder="' + esc(o.campo.placeholder) + '"' +
                 ' autocomplete="' + o.campo.autocomplete + '"' + (o.campo.valor ? ' value="' + esc(o.campo.valor) + '"' : '') + '>' : '') +
      '<p class="modal__msg" id="modalMsg" hidden></p>' +
      '<div class="btns">' +
        '<button class="btn btn--lg btn--block ' + (o.peligro ? 'btn--main' : 'btn--ink') + '" type="button" id="modalOk">' + esc(o.confirmar) + '</button>' +
        '<button class="btn btn--lg btn--block ' + (o.peligro ? 'btn--quiet-main' : 'btn--quiet') + '" type="button" id="modalNo">Cancelar</button>' +
      '</div>');
    $('modalNo').addEventListener('click', cerrarModal);
    $('modalOk').addEventListener('click', function () {
      o.alConfirmar($('modalCampo') ? $('modalCampo').value : null);
    });
    if ($('modalCampo')) $('modalCampo').focus();
  }

  function mensajeModal(texto, esError) {
    var m = $('modalMsg');
    if (!m) return;
    m.textContent = texto;
    m.hidden = !texto;
    m.classList.toggle('is-mal', !!esError);
  }

  // ─────────── Ajustes (cuenta) ───────────

  /* Cuánto has estrenado de cada montón, para mirarlo cuando te apetezca
     en vez de tenerlo delante en la portada. «Sin estrenar» son las que
     la app no te ha preguntado nunca: van entrando de dos en dos en cada
     sesión, así que el número baja despacio y a propósito. */
  function resumenEstado() {
    var filas = [
      { t: 'Vocabulario', r: recuento(fondoVocabulario(), claveDeVocab) },
      { t: 'Repaso de ejercicios', r: recuento(fondoRepaso(), claveDeFondo) }
    ];
    return filas.map(function (f) {
      if (!f.r.total) return '';
      var salidas = f.r.total - f.r.nuevos, det = [];
      if (f.r.nuevos) det.push(f.r.nuevos + ' sin estrenar');
      if (f.r.vencidos) det.push(f.r.hoy + ' para hoy');
      return '<div class="estado__l">' +
        '<b>' + esc(f.t) + '</b>' +
        '<span>' + salidas + ' de ' + f.r.total + ' ya han salido' +
        (det.length ? ' · ' + esc(det.join(' · ')) : '') + '</span>' +
      '</div>';
    }).join('');
  }

  function pantallaCuenta(mensajeInicial) {
    ponerFamilia(null);
    cabecera('ajustes', { raiz: true });
    var estadoHtml = CURSO ? resumenEstado() : '';

    el.screens.cuenta.innerHTML =
      '<div class="stack">' +
        '<h1 class="pagetitle">' + esc(saludo()) + '\nZure kontua</h1>' +
        '<section class="sec">' +
          '<span class="eyebrow">Aprendizaje</span>' +
          '<div class="blk">' +
            '<h3>Tu variante dialectal</h3>' +
            '<p>Elige si quieres aprender solo batua (euskera unificado) o si también quieres que se te muestren explicaciones y ejercicios en bizkaiera.</p>' +
            segmentado('segDialecto', [['batua', 'Batua'], ['bizkaiera', 'Bizkaiera']], incluirDialectales ? 'bizkaiera' : 'batua') +
            '<div class="nota"><b>*</b><span><b>Bizkaiera</b> (Bizkaia y zonas de Álava y Gipuzkoa). De momento es la única variante del curso.</span></div>' +
          '</div>' +
          '<div class="sep"></div>' +
          '<div class="blk">' +
            '<h3>Modo silencioso</h3>' +
            '<p>Ideal para momentos donde no puedas reproducir audio (sin audio en ningún sitio de la app).</p>' +
            segmentado('segSonido', [['sonido', 'Sonido', icono('speaker', 12.149)], ['silencio', 'Silencioso', icono('speaker-off', 11.953)]],
                       modoSilencioso ? 'silencio' : 'sonido') +
          '</div>' +
          (estadoHtml
            ? '<div class="sep"></div><div class="blk"><h3>Lo que llevas estrenado</h3><div class="estado">' + estadoHtml + '</div></div>'
            : '') +
        '</section>' +
        '<section class="sec">' +
          '<span class="eyebrow">Cuenta</span>' +
          '<div class="navrows">' +
            filaNav('ctaEmail', '', 'Cambiar email', usuarioEmail || 'Sin sesión') +
            filaNav('ctaPass', '', 'Cambiar contraseña', 'Elige una contraseña nueva') +
            filaNav('ctaSalir', '', 'Cerrar sesión', 'Cerrar sesión en este dispositivo') +
            filaNav('ctaReset', 'danger', 'Reiniciar progreso',
              'Volverás a la lección 1 y perderás todos los datos de racha y progreso. No se puede deshacer.',
              icono('warning', 14)) +
          '</div>' +
        '</section>' +
      '</div>';

    $('segDialecto').addEventListener('click', function (e) {
      var b = e.target.closest('.seg__opt');
      if (!b) return;
      setIncluirDialectales(b.dataset.valor === 'bizkaiera');
      pantallaCuenta();
    });
    $('segSonido').addEventListener('click', function (e) {
      var b = e.target.closest('.seg__opt');
      if (!b) return;
      setModoSilencioso(b.dataset.valor === 'silencio');
      pantallaCuenta();
    });
    $('ctaEmail').addEventListener('click', abrirCambioEmail);
    $('ctaPass').addEventListener('click', function () { abrirCambioPassword(); });
    $('ctaSalir').addEventListener('click', function () { sb.auth.signOut(); });
    $('ctaReset').addEventListener('click', abrirReinicio);

    mostrar('cuenta');
    if (mensajeInicial) abrirCambioPassword(mensajeInicial);
  }

  function abrirCambioEmail() {
    dialogo({
      titulo: 'Cambiar email',
      texto: 'Te enviaremos un enlace de confirmación a la dirección nueva antes de hacer el cambio.',
      campo: { tipo: 'email', placeholder: 'tu.nuevo@correo.com', autocomplete: 'email' },
      confirmar: 'Enviar email',
      alConfirmar: function (email) {
        email = (email || '').trim();
        if (!email) { mensajeModal('Escribe la dirección nueva.', true); return; }
        mensajeModal('Enviando…', false);
        sb.auth.updateUser({ email: email }).then(function (r) {
          if (r.error) { mensajeModal(r.error.message, true); return; }
          mensajeModal('Hecho. Revisa ' + email + ' para confirmar el cambio.', false);
        });
      }
    });
  }

  function abrirCambioPassword(aviso) {
    dialogo({
      titulo: 'Cambiar contraseña',
      texto: aviso || 'Escribe la contraseña nueva. Mínimo seis caracteres.',
      campo: { tipo: 'password', placeholder: 'Contraseña nueva', autocomplete: 'new-password' },
      confirmar: 'Guardar contraseña',
      alConfirmar: function (password) {
        if (!password || password.length < 6) { mensajeModal('Tiene que tener al menos seis caracteres.', true); return; }
        mensajeModal('Guardando…', false);
        sb.auth.updateUser({ password: password }).then(function (r) {
          if (r.error) { mensajeModal(r.error.message, true); return; }
          mensajeModal('Contraseña guardada.', false);
          setTimeout(cerrarModal, 900);
        });
      }
    });
  }

  function abrirReinicio() {
    dialogo({
      titulo: '¿Reiniciar tu progreso?',
      texto: 'Perderás las unidades hechas, las palabras vistas, la racha y las fechas de repaso. Esto no se puede deshacer.',
      confirmar: 'Sí, reiniciar',
      peligro: true,
      alConfirmar: function () {
        progreso = progresoVacio();
        if (guardarTimer) { clearTimeout(guardarTimer); guardarTimer = null; }
        guardarProgresoAhora();
        try {
          localStorage.removeItem(CLAVE); localStorage.removeItem(CLAVE_VIEJA);
          localStorage.removeItem(claveLocal());   // el de probar sin cuenta
        } catch (e) {}
        cerrarModal();
        pantallaHome();
      }
    });
  }

  // ─────────── Práctica ───────────

  /* La práctica de unidad sigue siendo la unidad entera y en orden
     barajado: es la primera pasada, aquí no hay nada que dosificar.
     Lo que sí hace es alimentar el calendario, para que el repaso
     posterior sepa qué se falló. */
  /* Grupos de los temas para completar el test, repartidos por turnos: uno
     del primer tema, uno del segundo, y así hasta tener los que faltan. Si
     se cogieran seguidos, los primeros temas se llevarían todas. */
  function relleno(u, yaPuestos, cuantos) {
    if (cuantos <= 0 || !tieneSubniveles(u)) return [];
    var usados = {};
    yaPuestos.forEach(function (g) { usados[g.id] = true; });
    /* Se baraja también el orden de los temas, no solo los grupos dentro
       de cada uno: si no, en las unidades que solo necesitan dos o tres de
       relleno saldrían siempre de los primeros temas y los últimos no
       entrarían nunca en el test. */
    var porTema = barajar((u.subniveles || []).map(function (s) {
      return barajar(delSubnivel(u.ejercicios, s.id).filter(function (g) {
        return !usados[g.id];
      }));
    }));
    var salida = [], vuelta = 0;
    while (salida.length < cuantos) {
      var metidoAlguno = false;
      for (var i = 0; i < porTema.length && salida.length < cuantos; i++) {
        if (porTema[i].length > vuelta) { salida.push(porTema[i][vuelta]); metidoAlguno = true; }
      }
      if (!metidoAlguno) break;      // no hay más grupos disponibles
      vuelta++;
    }
    return salida;
  }

  function empezarPractica() {
    var u = estado.unidad;
    estado.modo = 'unidad';
    // En una unidad con subniveles se practica solo el subnivel
    // abierto; el test ('test') mezcla los grupos marcados como tales.
    var grupos = tieneSubniveles(u) ? delSubnivel(u.ejercicios, estado.subnivel) : u.ejercicios;
    if (!grupos.length) grupos = u.ejercicios;
    /* El test de la unidad se queda corto con solo sus grupos: cinco en casi
       todas, que con las dos de escuchar son siete preguntas. Como es «todo
       lo anterior mezclado», se completa hasta doce tirando de los temas,
       uno de cada por turnos, para que ningún tema quede fuera ni acapare
       (pedido por Ric). */
    if (estado.subnivel === 'test') grupos = grupos.concat(
      relleno(u, grupos, LARGO_TEST - ESCUCHAR_PRACTICA - grupos.length));
    var base = barajar(grupos).map(function (g) {
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
      cabecera('pasos', { total: t, hechos: estado.aprendidas, etiqueta: estado.aprendidas + '/' + t });
      return;
    }
    var total = estado.ejercicios.length || 1;
    var i = Math.min(estado.indice, total - 1);
    cabecera('pasos', { total: total, hechos: estado.indice + (estado.resuelto ? 1 : 0.5),
                        etiqueta: (i + 1) + '/' + total });
  }

  function pintarEjercicio() {
    estado.resuelto = false;
    estado.sel = null;
    ocultarFeedback();

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
    // El color es el de la unidad de la pregunta: en los repasos cambia
    // de una a otra, y así se ve de dónde viene cada una.
    ponerFamilia(estado.modo === 'unidad' ? estado.unidad : unidadDe(ej));
    actualizarBarra();
    precargarAudio(audioDeRespuesta(ej));

    switch (ej.tipo) {
      case 'opcion':   pintarOpcion(ej); break;
      case 'pares':    pintarPares(ej); break;
      case 'orden':    pintarOrden(ej); break;
      case 'escribir': pintarEscribir(ej); break;
      case 'traducir': pintarTraducir(ej); break;
      case 'teclear':  pintarTeclear(ej); break;
      default:         siguiente();
    }

    window.scrollTo(0, 0);
  }

  /* Encabezado del ejercicio: arriba la píldora con el tema o la unidad de
     donde sale (en los repasos conviene saberlo), la marca de bizkaiera si
     la palabra en juego es una variante, y la instrucción; debajo, la
     pregunta en grande. */
  function cabeceraEj(ej, preguntaHtml) {
    var etiqueta = '';
    if (estado.modo === 'unidad' && ej.__sub && ej.__sub !== 'test') etiqueta = ej.__sub;
    else {
      var u = estado.modo === 'unidad' ? estado.unidad : unidadDe(ej);
      if (u) etiqueta = String(u.numero);
    }
    return '<div class="exh">' +
      '<div class="exh__meta">' +
        (etiqueta ? '<span class="pill">' + esc(etiqueta) + '</span>' : '') +
        etiquetaRegistroEj(ej) +
        '<span class="exh__inst">' + esc(ej.instruccion || '') + '</span>' +
      '</div>' +
      (preguntaHtml ? '<h2 class="exh__q">' + preguntaHtml + '</h2>' : '') +
    '</div>';
  }

  /* Aviso de "esto es bizkaiera" en las preguntas que salen de una
     variante dialectal — para no confundirlo con un error de tecleo si se
     responde rápido. Solo cuando la forma en juego no es la batua. */
  function etiquetaRegistroEj(ej) {
    if (!ej.__registro || ej.__registro === 'batua') return '';
    return '<span class="pill pill--dialect">' + esc(abrevRegistro(ej.__registro)) + '</span>';
  }

  // — Opción múltiple —

  /* En los formatos "escuchar" la pregunta ES el audio: no hay euskera
     escrito que enseñar, solo una tarjeta grande para reproducirlo. */
  function pintarPrompt(ej) {
    if (!ej.__escuchar) return cabeceraEj(ej, richInline(ej.pregunta));
    return cabeceraEj(ej, esc(ej.__labelEscuchar || 'Escucha')) +
      '<button class="escuchar" type="button" id="btnEscuchar" aria-label="Escuchar">' +
        '<span class="escuchar__btn">' + icono('volume', 32) + '</span>' +
        '<span>Toca para escuchar</span>' +
      '</button>';
  }

  /* Cablea la tarjeta de escuchar y reproduce en cuanto se pinta el
     ejercicio — aquí el audio es la pregunta en sí: sin oírla no hay
     nada que responder. */
  function activarEscuchar(ej) {
    if (!ej.__escuchar) return;
    var audio = ej.__palabra.audio;
    var btn = $('btnEscuchar');
    btn.addEventListener('click', function () { if (audio) reproducir(audio); });
    if (audio) reproducir(audio);
  }

  function pintarOpcion(ej) {
    var orden = barajar(ej.opciones.map(function (txt, i) { return { txt: txt, i: i }; }));

    el.quizContent.innerHTML =
      pintarPrompt(ej) +
      '<div class="opts" id="opts">' + orden.map(function (o, n) {
        return '<button class="opt" type="button" aria-pressed="false" data-i="' + o.i + '">' +
          '<span class="opt__key">' + (n + 1) + '</span>' +
          '<span class="opt__txt">' + esc(o.txt) + '</span>' +
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

  /* La respuesta buena en la hoja de feedback, con su tick delante. */
  function htmlSolucion(texto) {
    return '<span class="fb__answer">' + icono('check-bold', 20) + '<span>' + esc(texto) + '</span></span>';
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
        cuerpo = htmlSolucion(ej.opciones[ej.correcta]) +
                 (ej.explicacion ? '<p>' + ej.explicacion + '</p>' : '');
      }
    }
    return { ok: ok, cuerpo: cuerpo };
  }

  // — Emparejar —

  function pintarPares(ej) {
    var eus = barajar(ej.pares.map(function (p, i) { return { txt: p.eu, i: i }; }));
    var ess = barajar(ej.pares.map(function (p, i) { return { txt: p.es, i: i }; }));

    el.quizContent.innerHTML =
      cabeceraEj(ej, 'Toca las parejas') +
      '<div class="pairs">' +
        '<div class="paircol" id="colEu">' + eus.map(function (o) {
          return '<button class="pair pair--eu" type="button" aria-pressed="false" data-i="' + o.i + '">' +
            '<span class="pair__txt">' + esc(o.txt) + '</span>' +
            '<span class="pair__play" data-play="1" aria-label="Escuchar «' + esc(o.txt) + '»">' + icono('volume', 16) + '</span>' +
          '</button>';
        }).join('') + '</div>' +
        '<div class="paircol" id="colEs">' + ess.map(function (o) {
          return '<button class="pair pair--es" type="button" aria-pressed="false" data-i="' + o.i + '">' +
            '<span class="pair__txt">' + esc(o.txt) + '</span></button>';
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
    el.btnCheck.textContent = 'Empareja las ' + total + ' parejas';
  }

  // — Ordenar palabras —

  function pintarOrden(ej) {
    el.quizContent.innerHTML =
      cabeceraEj(ej, esc(ej.es)) +
      '<div class="answer">' +
      '<div class="build" id="build"></div>' +
      /* Al banco se le suman los distractores: fichas que NO son de la frase.
         Sin ellos bastaba con colocar todas las que había, y con la mayúscula
         y el punto puestos se resolvía sin saber euskera (detectado por Ric).
         La corrección no cambia: compara lo construido contra `eu`, así que
         usar un distractor sale mal solo. Por lo mismo, el hueco de arriba
         no enseña cuántas palabras lleva la frase. */
      '<div class="bank" id="bank">' +
      barajar(ej.palabras.concat(ej.distractores || [])).map(function (p, i) {
        return '<button class="chip" type="button" data-p="' + esc(p) + '" data-k="' + i + '">' + esc(p) + '</button>';
      }).join('') + '</div></div>';

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
    var fichas = Array.prototype.slice.call($('build').children);
    var construido = fichas.map(function (c) { return c.textContent; }).join(' ');
    var ok = normalizar(construido) === normalizar(ej.eu);
    /* Cada ficha se pinta según si está en su sitio: así se ve dónde se
       torció la frase, no solo que se torció. */
    var buenas = normalizar(ej.eu).split(' ');
    fichas.forEach(function (c, i) {
      c.classList.add(ok || normalizar(c.textContent) === buenas[i] ? 'is-ok' : 'is-mal');
    });
    return {
      ok: ok,
      cuerpo: ok ? '' : htmlSolucion(ej.eu)
    };
  }

  /* — Escribir con la bolsa a la vista —

     Mismo material que «orden», pero en vez de arrastrar fichas hay que
     teclear cada palabra. La bolsa de abajo se queda como ayuda visual y
     no se puede pinchar: si se pudiera, volvería a ser un ejercicio de
     reconocer. Cada palabra acertada se pone en verde, se bloquea, y su
     ficha se apaga abajo.

     La razón de existir de este formato está en la nota de investigación:
     recuperar produciendo (teclear la forma) gana con diferencia a
     reconocerla, y los formatos híbridos —algo de andamio, pero
     produciendo— fueron los más eficaces del metaanálisis. */

  var SOLO_SIGNO = /^[\u00bf?\u00a1!.,;:]+$/;

  function pintarEscribir(ej) {
    var esperadas = ej.palabras.slice();

    el.quizContent.innerHTML =
      cabeceraEj(ej, esc(ej.es)) +
      '<div class="answer"><div class="slots" id="slots">' +
      esperadas.map(function (p, i) {
        /* Los signos sueltos —el «?» que va aparte desde que Ric pidió que
           no delatara la forma— se pintan fijos, no como hueco: teclear un
           interrogante no enseña nada. */
        if (SOLO_SIGNO.test(p)) {
          return '<span class="slot slot--fijo" data-i="' + i + '">' + esc(p) + '</span>';
        }
        return '<input class="slot" type="text" data-i="' + i +
               '" size="' + Math.max(p.length, 3) + '" autocomplete="off" ' +
               'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
               'aria-label="palabra ' + (i + 1) + '">';
      }).join('') + '</div>' +
      '<div class="bank bank--ayuda" id="bank">' +
      barajar(esperadas.filter(function (p) { return !SOLO_SIGNO.test(p); })
                       .concat(ej.distractores || [])).map(function (p) {
        return '<span class="chip chip--ayuda" data-n="' + esc(normalizar(p)) + '">' + esc(p) + '</span>';
      }).join('') + '</div></div>';

    var slots = $('slots'), bank = $('bank');

    function apagarFicha(pal) {
      var libres = bank.querySelectorAll('.chip[data-n="' + normalizar(pal) + '"]:not(.is-used)');
      if (libres.length) libres[0].classList.add('is-used');
    }
    function encenderFicha(pal) {
      var usadas = bank.querySelectorAll('.chip[data-n="' + normalizar(pal) + '"].is-used');
      if (usadas.length) usadas[usadas.length - 1].classList.remove('is-used');
    }
    function refrescar() {
      var pendientes = 0;
      Array.prototype.forEach.call(slots.children, function (s) {
        if (s.classList.contains('slot--fijo')) return;
        var resuelto = s.classList.contains('is-ok') || s.classList.contains('is-mal');
        if (!resuelto && !s.value.trim()) pendientes++;
      });
      el.btnCheck.disabled = pendientes > 0;
    }

    /* Dos intentos por hueco y se cierra en rojo.

       Sin esto el ejercicio no mide nada: se pueden ir tecleando palabras
       hasta que una se pone verde, y entonces siempre sale bien — lo que
       además le miente al calendario de repaso, que registra un acierto
       donde hubo tanteo. Lo vio Ric probándolo.

       Un intento se cuenta al SALIR del hueco (al pulsar Tab o Enter, o
       al pinchar fuera), no en cada tecla: si no, escribir «lagunak»
       gastaría los dos intentos antes de llegar a la k. */
    var TOPE = 2;

    function acertar(s, i) {
      s.classList.add('is-ok');
      s.readOnly = true;
      apagarFicha(esperadas[i]);
      var sig = slots.querySelector('input.slot:not(.is-ok):not(.is-mal)');
      if (sig) sig.focus();
    }

    function cerrar(s, i) {
      s.classList.add('is-mal');
      s.readOnly = true;
      var sig = slots.querySelector('input.slot:not(.is-ok):not(.is-mal)');
      if (sig) sig.focus();
    }

    function evaluar(s, definitivo) {
      if (estado.resuelto || s.classList.contains('is-ok') || s.classList.contains('is-mal')) return;
      var i = +s.dataset.i;
      if (normalizar(s.value) === normalizar(esperadas[i])) { acertar(s, i); refrescar(); return; }
      if (!definitivo || !s.value.trim()) return;
      var fallos = (+s.dataset.fallos || 0) + 1;
      s.dataset.fallos = fallos;
      if (fallos >= TOPE) cerrar(s, i);
      else s.classList.add('is-tocado');
      refrescar();
    }

    slots.addEventListener('input', function (e) {
      var s = e.target;
      if (!s.classList.contains('slot')) return;
      s.classList.remove('is-tocado');
      evaluar(s, false);
    });
    slots.addEventListener('focusout', function (e) {
      if (e.target.classList.contains('slot')) evaluar(e.target, true);
    });
    slots.addEventListener('keydown', function (e) {
      var s = e.target;
      if (!s.classList.contains('slot')) return;
      if (e.key === 'Tab') { evaluar(s, true); return; }   // el foco lo mueve el navegador
      if (e.key !== 'Enter') return;
      e.preventDefault();
      evaluar(s, true);
      var sig = slots.querySelector('input.slot:not(.is-ok):not(.is-mal)');
      if (sig && sig !== s) { sig.focus(); return; }
      if (!el.btnCheck.disabled) el.btnCheck.click();
    });

    var primero = slots.querySelector('input.slot');
    if (primero) primero.focus();
  }

  function corregirEscribir(ej) {
    /* Cuenta bien solo si los huecos están todos en verde. Uno cerrado en
       rojo por agotar intentos es un fallo aunque el texto acabe siendo el
       correcto. */
    var celdas = Array.prototype.slice.call($('slots').children);
    var dado = celdas.map(function (s) {
      return s.classList.contains('slot--fijo') ? s.textContent : s.value;
    }).join(' ');
    var ok = celdas.every(function (s) {
      return s.classList.contains('slot--fijo') || s.classList.contains('is-ok');
    }) && normalizar(dado) === normalizar(ej.palabras.join(' '));
    Array.prototype.forEach.call($('slots').children, function (s) { s.blur(); });
    return {
      ok: ok,
      cuerpo: ok ? '' : htmlSolucion(ej.eu)
    };
  }

  // — Escribir la traducción —

  /* La pista va escondida tras un botón: verla es decisión de quien
     responde, no algo que se le da por defecto. */
  function botonPista(pista) {
    if (!pista) return '';
    return '<button class="hintchip" type="button" id="btnPista">' + icono('eye', 15) + '<span>ver pista</span></button>';
  }

  function activarPista(pista) {
    var b = $('btnPista');
    if (!b) return;
    b.addEventListener('click', function () {
      if (b.classList.contains('is-open')) return;
      b.classList.add('is-open');
      b.innerHTML = '<span>' + esc(pista) + '</span>';
    });
  }

  function pintarTraducir(ej) {
    el.quizContent.innerHTML =
      cabeceraEj(ej, esc(ej.es)) +
      '<div class="answer">' +
        '<textarea class="typebox" id="typebox" rows="3" autocomplete="off" autocorrect="off" ' +
        'autocapitalize="off" spellcheck="false" placeholder="Escribe aquí en euskera…"></textarea>' +
        botonPista(ej.pista) +
      '</div>';

    var ta = $('typebox');
    ta.addEventListener('input', function () {
      el.btnCheck.disabled = ta.value.trim().length === 0;
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (!el.btnCheck.disabled) el.btnCheck.click(); }
    });
    activarPista(ej.pista);
  }

  function corregirTraducir(ej) {
    var crudo = $('typebox').value;
    var dado  = normalizar(crudo);
    var variantes = todasLasVariantes(ej.respuestas);
    var exacto = aciertaTecleado(dado, ej.respuestas);
    $('typebox').blur();
    if (exacto) {
      var nota = notaDeGenero(ej.respuestas);
      return { ok: true, leve: false, cuerpo: nota ? '<p class="dif__nota">' + esc(nota) + '</p>' : '' };
    }
    var cercana = respuestaMasCercana(dado, variantes.length ? variantes : ej.respuestas);
    var leve = esCasiCorrecto(dado, cercana);
    /* Un «casi correcto» se da por bueno, pero hay que enseñar la forma
       buena igualmente o el fallo se repite (pedido por Ric). Se compara
       contra la variante a la que te acercaste, no contra respuestas[0]:
       si escribiste algo parecido a la segunda forma válida, corregirte
       hacia la primera sería desconcertante. */
    var objetivo = leve ? cercana.texto : normalizar(ej.respuestas[0]);
    return {
      ok: leve, leve: leve,
      cuerpo: comparacion(dado, objetivo, true)
    };
  }

  // — Teclear una palabra suelta (vocabulario) —

  /* Igual que traducir una frase, pero de una sola palabra: una línea,
     no dos, y la comparación letra a letra en vez de palabra a palabra. */
  function pintarTeclear(ej) {
    var placeholder = ej.__objetivo === 'es' ? 'Escríbelo en castellano…' : 'Escríbelo en euskera…';
    el.quizContent.innerHTML =
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
    var variantes = todasLasVariantes(ej.respuestas);
    var exacto = aciertaTecleado(dado, ej.respuestas);
    $('typebox').blur();
    if (exacto) {
      var extra = notaDeGenero(ej.respuestas);
      var base  = ej.explicacion ? esc(ej.explicacion) : '';
      if (extra) base += '<p class="dif__nota">' + esc(extra) + '</p>';
      return { ok: true, leve: false, cuerpo: base };
    }
    var cercana = respuestaMasCercana(dado, variantes.length ? variantes : ej.respuestas);
    var leve = esCasiCorrecto(dado, cercana);
    // Letra a letra para una palabra suelta, por palabras si la solución
    // tiene más de una — comparar "tu propio" contra lo escrito letra a
    // letra mezclaba coincidencias sueltas sin sentido (ver comparacion()).
    var porPalabras = normalizar(ej.solucion).indexOf(' ') !== -1;
    // Traduciendo al castellano la etiqueta «se escribe» no encaja: no
    // has fallado la grafía, has fallado el significado. Y la nota de
    // la palabra, que habla de otras formas en euskera, aquí despista
    // más que ayuda (las dos cosas, detectadas por Ric).
    var traduciendo = ej.__objetivo === 'es';
    var nota2 = (ej.explicacion && !traduciendo)
      ? '<p class="dif__nota">' + esc(ej.explicacion) + '</p>' : '';
    /* El «casi correcto» también enseña la forma buena: antes se daba por
       válido y se pasaba de largo, así que la errata volvía a la siguiente
       (pedido por Ric). Se compara contra la variante a la que te
       acercaste, no contra la solución principal. */
    return {
      ok: leve, leve: leve,
      cuerpo: comparacion(dado, leve ? cercana.texto : normalizar(ej.solucion),
                          porPalabras, traduciendo ? 'dijiste' : undefined) + nota2
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

  /* Cuántas unidades (letras o palabras) no coinciden entre lo escrito
     y la respuesta correcta, reusando el mismo alineado que ya monta el
     diff visual — no hace falta una distancia de edición aparte. Cuenta
     el lado más largo de sobras/faltas, así que una letra cambiada por
     otra (una sustitución) cuenta una vez, no dos. */
  function distanciaAlineada(dado, bueno, porPalabras) {
    var a = porPalabras ? dado.split(' ') : dado.split('');
    var b = porPalabras ? bueno.split(' ') : bueno.split('');
    var al = alinear(a, b);
    var malIzq = al.izq.filter(function (p) { return p[1]; }).length;
    var malDer = al.der.filter(function (p) { return p[1]; }).length;
    return Math.max(malIzq, malDer);
  }

  /* De las respuestas válidas (puede haber sinónimos), la que menos se
     aleja de lo escrito — para juzgar "casi correcto" contra la más
     parecida, no contra la primera de la lista al azar. */
  function respuestaMasCercana(dado, respuestas) {
    var mejorTexto = normalizar(respuestas[0]), mejorDistancia = Infinity;
    respuestas.forEach(function (r) {
      var texto = normalizar(r);
      var d = distanciaAlineada(dado, texto, texto.indexOf(' ') !== -1);
      if (d < mejorDistancia) { mejorDistancia = d; mejorTexto = texto; }
    });
    return { texto: mejorTexto, distancia: mejorDistancia };
  }

  /* Segundo nivel de acierto: un fallo tan pequeño que no vale la pena
     tratarlo como un fallo de verdad —falta un sufijo/artículo, una
     letra cambiada en una palabra larga—, frente a uno que sí lo es
     —la palabra está irreconocible, o falta más de una pieza en una
     frase—. Palabras de tres letras o menos no dan margen: en euskera
     ahí una sola letra puede ser otra palabra entera ("ni"/"hi"), así
     que no hay "casi" que valga. */
  function esCasiCorrecto(dado, cercana) {
    if (!dado) return false;
    if (cercana.texto.indexOf(' ') !== -1) return cercana.distancia === 1;
    return cercana.texto.length > 3 && cercana.distancia === 1;
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
           '<span class="dif__par"><span class="dif__lbl">' +
             (verbo === 'dijiste' ? 'significa' : 'se escribe') + '</span>' +
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
    else if (ej.tipo === 'escribir') r = corregirEscribir(ej);
    else if (ej.tipo === 'traducir') r = corregirTraducir(ej);
    else if (ej.tipo === 'teclear')  r = corregirTeclear(ej);
    else return;

    var titulo = r.leve ? 'Casi correcto!' : (r.ok ? 'Oso ondo!' : 'No exactamente!');
    resolver(r.ok, titulo, r.cuerpo, r.leve);
  }

  /* Único punto por el que pasa toda respuesta, venga del botón de
     comprobar o del emparejado, que se autocorrige. Es aquí donde el
     calendario se entera de si se ha acertado.

     `leve` distingue un acierto limpio de uno con un fallo pequeño
     (falta un sufijo, una letra cambiada en una palabra larga — ver
     esCasiCorrecto) que se da por resuelto igual —cuenta como acierto
     para el calendario y el marcador— pero se avisa con otro color y
     otro título, en vez de fingir que no ha pasado nada. Solo lo
     producen corregirTraducir/corregirTeclear; el resto de tipos
     siempre llega con leve=false. */
  function resolver(ok, titulo, cuerpo, leve) {
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
    feedback(ok, titulo, cuerpo, leve);
  }

  function registrar(ok) {
    apuntarActividad(ok);
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

  /* ── La ficha del tema, sin salir del ejercicio ──────────────────────

     Un ejercicio sabe de qué tema viene (`__sub`) y de qué unidad
     (`__uid`, o `__unum` cuando viene del vocabulario, que guarda el
     número). Con eso se sacan las mismas fichas que enseña la pantalla de
     Gramática. No desbloquea nada: abrirla aquí no mete las palabras del
     tema en el repaso, que es lo que hace entrar por la pantalla. */
  function unidadDe(ej) {
    if (!CURSO) return null;
    var us = CURSO.unidades;
    for (var i = 0; i < us.length; i++) {
      if (ej.__uid && us[i].id === ej.__uid) return us[i];
      if (ej.__unum && us[i].numero === ej.__unum) return us[i];
    }
    /* Practicando una unidad, prepararVariante() no recibe la unidad
       —ya está en el estado y la etiqueta no hace falta—, así que el
       ejercicio no la lleva encima. Aquí es la que tienes abierta. */
    return estado.unidad || null;
  }

  /* Dónde se explica lo que pregunta este ejercicio: su propio tema, o el
     que señale `explica` si practica algo de otra parte del curso. Los ids
     de tema llevan la unidad delante («4.4»), así que se busca en todas. */
  function temaDe(ej) {
    if (!ej) return null;
    var id = ej.__explica || ej.__sub;
    if (!id || !CURSO) return null;
    var us = CURSO.unidades, propia = unidadDe(ej);
    var orden = ej.__explica ? us : [propia].concat(us);
    for (var i = 0; i < orden.length; i++) {
      var u = orden[i];
      if (!u) continue;
      var t = (u.subniveles || []).filter(function (s) { return s.id === id; })[0];
      if (t || (!ej.__explica && u === propia)) return { unidad: u, tema: t, id: id };
    }
    return null;
  }

  function fichasDe(ej) {
    var d = temaDe(ej);
    if (!d) return [];
    return gramaticaVisible(delSubnivel(d.unidad.gramatica, d.id));
  }

  function abrirHoja() {
    var ej = ejActual(), fichas = fichasDe(ej);
    if (!fichas.length) return;
    var d = temaDe(ej), u = d.unidad, tema = d.tema;
    abrirModal(
      '<button class="modal__x" type="button" id="hojaCerrar" aria-label="Cerrar">' + icono('close', 24) + '</button>' +
      '<p class="modal__ruta">' + esc(u.numero + '. ' + u.titulo + (tema ? ' · ' + tema.id + ' ' + tema.titulo : '')) + '</p>' +
      pintarFichas(fichas),
      'modal__panel--ficha');
    $('hojaCerrar').addEventListener('click', cerrarModal);
    el.modalPanel.scrollTop = 0;
  }

  function feedback(ok, titulo, cuerpo, leve) {
    el.sheet.className = 'sheet ' + (leve ? 'is-leve' : (ok ? 'is-ok' : 'is-mal'));
    el.feedback.hidden = false;
    el.feedbackIcon.innerHTML = icono(leve ? 'eye' : (ok ? 'check-bold' : 'cross-bold'), 20);
    el.feedbackTitle.textContent = titulo;
    el.feedbackBody.innerHTML = cuerpo || '';
    // En vocabulario la sesión no acaba en la última pregunta, acaba
    // cuando la cola se vacía: solo es la última si esta palabra ya sale.
    var ultimo = (estado.modo === 'vocab')
      ? (estado.ejercicios.length === 1 && estado.ejercicios[0].faltan === 0)
      : (estado.indice === estado.ejercicios.length - 1);
    el.btnCheck.textContent = ultimo ? 'Ver resultado' : 'Continuar';
    el.btnCheck.disabled = false;
    // El libro solo se ofrece si ese tema tiene algo que enseñar.
    el.btnFicha.hidden = !fichasDe(ejActual()).length;
    el.btnCheck.focus({ preventScroll: true });
  }

  function ocultarFeedback() {
    el.sheet.className = 'sheet';
    el.feedback.hidden = true;
    el.feedbackBody.innerHTML = '';
    el.btnFicha.hidden = true;
    el.btnCheck.textContent = 'Comprobar';
    el.btnCheck.disabled = true;
  }

  // ─────────── Pantalla: resultado ───────────

  /* El siguiente tema de la unidad que tenga algo dentro, o null si este
     era el último. Al acabar los ejercicios de un tema, la pantalla solo
     ofrecía repetir o volver al inicio: un callejón, justo cuando lo
     natural es seguir (detectado por Ric haciendo el curso). */
  function temaSiguiente(u, subId) {
    if (!tieneSubniveles(u) || !subId || subId === 'test') return null;
    var ids = u.subniveles.map(function (s) { return s.id; });
    for (var k = ids.indexOf(subId) + 1; k > 0 && k < u.subniveles.length; k++) {
      var c = contenidoSub(u, u.subniveles[k].id);
      if (c.gramatica.length || c.vocabulario.length || c.ejercicios.length) {
        return u.subniveles[k];
      }
    }
    return null;
  }

  /* Entra en un tema por su explicación, que es por donde se empieza. Si
     no tiene gramática (los hay que son solo vocabulario), se queda en la
     portada del tema en vez de abrir una pantalla vacía. */
  function seguirConTema(s) {
    var u = estado.unidad;
    estado.subnivel = s.id;
    progSub(u.id, s.id).visitado = true;
    guardarProgreso();
    if (gramaticaVisible(delSubnivel(u.gramatica, s.id)).length) pantallaGramatica();
    else pantallaSubnivel(s.id);
  }

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
    /* Un subnivel puntúa el subnivel; el test de la unidad puntúa la
       unidad. Antes todo iba a la unidad, así que hacer bien una porción
       la dejaba «Completada · 100%» sin haber visto el resto (detectado
       por Ric). El progreso de la unidad se calcula ahora sumando sus
       partes, en progresoUnidad(). */
    if (estado.modo === 'unidad') {
      if (estado.subnivel && estado.subnivel !== 'test') {
        var ps = progSub(u.id, estado.subnivel);
        ps.visitado = true;
        ps.mejor = Math.max(ps.mejor || 0, ratio);
      } else {
        var p = progUnidad(u.id);
        p.intentos++;
        p.mejor = Math.max(p.mejor, ratio);
        if (ratio >= 0.7) p.completada = true;
      }
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
    else {
      /* Un subnivel no es la unidad: decirle «unidad superada» por hacer
         una porción confundía y daba la sensación de que ya no quedaba
         nada (detectado por Ric). */
      var esParte = !!(estado.subnivel && estado.subnivel !== 'test');
      var queEs = esParte ? 'este tema' : 'esta unidad';
      var restantes = 0;
      if (esParte && tieneSubniveles(u)) {
        var pr = progresoUnidad(u);
        restantes = pr.total - pr.hechos;
      }
      var cola = restantes > 0
        ? ' Te quedan ' + plural(restantes, 'tema', 'temas') + ' en la unidad.'
        : '';
      if (ratio === 1)      { titulo = 'Bikain!';   sub = 'Perfecto. Todas correctas.' + cola; }
      else if (ratio >= 0.8){ titulo = 'Oso ondo!'; sub = 'Muy bien. Dominas ' + queEs + '.' + cola; }
      else if (ratio >= 0.7){ titulo = 'Ondo!';     sub = 'Bien. ' + (esParte ? 'Tema superado.' : 'Unidad superada.') + cola; }
      else                  { titulo = 'Ia-ia…';    sub = 'Casi. Repasa la explicación y vuelve a intentarlo.'; }
    }

    // El título va en el color de la unidad cuando ha ido bien; el «casi»
    // se queda en negro — no es un fallo, es ánimo para seguir.
    var tituloBien = titulo !== 'Ia-ia…';

    // Tras el vocabulario, la lista de lo fallado: es lo único que hay
    // que mirar antes de cerrar, y evita ir a buscarlo al diccionario.
    var repaso = '';
    if (estado.modo === 'vocab' && estado.falladas.length) {
      repaso = '<div class="divider divider--light"></div>' +
        '<span class="eyebrow">Las que costaron</span>' +
        '<div class="vlist">' + estado.falladas.map(function (v) {
          return '<div class="vi"><span class="vi__w">' + esc(v.eu) + botonAudio(v) + '</span>' +
            '<span class="vi__m">' + esc(v.es) + '</span></div>';
        }).join('') + '</div>';
    }

    function boton(id, texto, primario) {
      return '<button class="btn btn--lg btn--block ' + (primario ? 'btn--ink' : 'btn--outline') + '" type="button" id="' + id + '">' + esc(texto) + '</button>';
    }

    var acciones;
    if (estado.modo === 'repaso') {
      acciones = boton('rRepetir', 'Otra ronda de repaso', true) + boton('rHome', 'Volver a hoy');
    } else if (estado.modo === 'vocab') {
      acciones = boton('rRepetir', 'Otras palabras', true) + boton('rDicc', 'Abrir el diccionario') + boton('rHome', 'Volver a hoy');
    } else if (estado.subnivel && estado.subnivel !== 'test') {
      // Acabas de terminar un tema: lo primero que ofrecemos es continuar.
      var sig = temaSiguiente(u, estado.subnivel);
      acciones = (sig ? boton('rSeguir', 'Seguir: ' + (sig.titulo_eu || sig.titulo), true) + boton('rUnidad', 'Volver a la unidad')
                      : boton('rUnidad', 'Volver a la unidad', true)) +
                 boton('rRepetir', 'Repetir este tema');
    } else {
      acciones = boton('rRepetir', 'Repetir la unidad', true) + boton('rUnidad', 'Volver a la unidad') + boton('rHome', 'Volver a hoy');
    }

    /* El marcador del vocabulario cuenta otra historia: no aciertos y
       fallos, sino cuántas salieron limpias, cuántas necesitaron vuelta
       y cuánto trabajo costó en total. */
    var verde = ['rgb(11,183,80)', 'rgb(226,248,234)'], rojo = ['rgb(229,48,52)', 'rgb(253,224,225)'],
        gris = ['rgb(20,19,20)', 'rgb(232,231,232)'];
    function casilla(n, etiqueta, tono) {
      return '<div class="scard" style="--sc:' + tono[0] + ';--sc-soft:' + tono[1] + '">' +
        '<span class="scard__t">' + esc(etiqueta) + '</span><span class="scard__v">' + n + '</span></div>';
    }
    var marcador = estado.modo === 'vocab'
      ? casilla(estado.primeras, 'A la primera', verde) +
        casilla(estado.total - estado.primeras, 'Con vuelta', rojo) +
        casilla(estado.respuestas, 'Respuestas', gris)
      : casilla(estado.aciertos, 'Aciertos', verde) +
        casilla(estado.fallos, 'Fallos', rojo) +
        casilla(Math.round(ratio * 100) + '%', 'Nota', gris);

    if (estado.modo !== 'unidad') ponerFamilia(null);
    cabecera('atras');
    el.screens.result.innerHTML =
      '<div class="stack">' +
        '<h1 class="pagetitle"' + (tituloBien ? ' style="color:var(--c-strong)"' : '') + '>' + esc(titulo) + '</h1>' +
        '<p class="lead">' + esc(sub) + '</p>' +
        '<div class="res__tiles">' + marcador + '</div>' +
        repaso +
        '<div class="btns">' + acciones + '</div>' +
      '</div>';

    mostrar('result');

    var otra = estado.modo === 'repaso' ? empezarRepaso
             : estado.modo === 'vocab'  ? empezarVocab
             : empezarPractica;
    if ($('rRepetir')) $('rRepetir').addEventListener('click', otra);
    if ($('rDicc'))    $('rDicc').addEventListener('click', pantallaDiccionario);
    if ($('rHome'))    $('rHome').addEventListener('click', pantallaHome);
    if ($('rUnidad'))  $('rUnidad').addEventListener('click', function () {
      estado.subnivel = null;
      pantallaUnidad(estado.unidad);
    });
    if ($('rSeguir'))  $('rSeguir').addEventListener('click', function () {
      seguirConTema(temaSiguiente(estado.unidad, estado.subnivel));
    });
  }

  // ─────────── Eventos globales ───────────

  pintarNavegacion();

  // Pestañas y menú lateral
  [el.tabbarItems, el.sidenav].forEach(function (cont) {
    cont.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (b) irATab(b.dataset.tab);
    });
  });

  // Cabecera: volver, logo, cuenta
  el.hdr.addEventListener('click', function (e) {
    var b = e.target.closest('[data-accion]');
    if (!b) return;
    var a = b.dataset.accion;
    if (a === 'atras') atras();
    else if (a === 'home') irATab('today');
    else if (a === 'cuenta') pantallaCuenta();
  });

  // Hoy: la pila de lecciones y los dos repasos
  el.screens.home.addEventListener('click', function (e) {
    var peek = e.target.closest('[data-pila]');
    if (peek) { estado.homeActiva = peek.dataset.pila; pantallaHome(); return; }
    var card = e.target.closest('.lcard');
    if (card) { abrirUnidad(card.dataset.unidad, 'home'); return; }
    if (e.target.closest('#goVocabRepaso')) empezarVocab();
    else if (e.target.closest('#goRepaso')) empezarRepaso();
  });

  el.screens.lessons.addEventListener('click', function (e) {
    var b = e.target.closest('.lrow');
    if (b) abrirUnidad(b.dataset.unidad, 'lessons');
  });

  function abrirUnidad(id, desde) {
    var u = CURSO.unidades.filter(function (x) { return x.id === id; })[0];
    if (u) pantallaUnidad(u, desde);
  }

  // Unidad y subunidad: temas, test y las tres puertas
  function puertas(e) {
    var fila = e.target.closest('.srow[data-sub]');
    if (fila) {
      var id = fila.dataset.sub;
      if (id === 'test') { estado.subnivel = 'test'; empezarPractica(); }
      else pantallaSubnivel(id);
      return;
    }
    if (e.target.closest('#goGram')) pantallaGramatica(0);
    else if (e.target.closest('#goVoc')) pantallaVocabulario();
    else if (e.target.closest('#goPrac')) empezarPractica();
  }
  el.screens.unit.addEventListener('click', puertas);
  el.screens.sub.addEventListener('click', puertas);

  // Audio en todas las listas que lo llevan
  [el.screens.gram, el.screens.vocab, el.screens.result, el.dictContent, el.modalPanel].forEach(activarAudioEnLista);

  // Ejercicio
  el.btnCheck.addEventListener('click', comprobar);
  el.btnFicha.innerHTML = icono('dictionary', 24);
  el.btnFicha.addEventListener('click', abrirHoja);

  // Modal: se cierra tocando fuera o con Escape
  $('modalScrim').addEventListener('click', cerrarModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarModal();
  });

  // Atajos de teclado para quien use ordenador
  document.addEventListener('keydown', function (e) {
    if (estado.pantalla !== 'quiz' || !el.modal.hidden) return;
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!el.btnCheck.disabled) el.btnCheck.click();
      return;
    }
    /* En un ejercicio de opción, el número (o la letra) elige esa opción,
       igual que tocarla — no la comprueba sola. */
    if (estado.resuelto) return;
    var opts = document.querySelectorAll('#opts .opt');
    if (!opts.length) return;
    var i = /^[1-6]$/.test(e.key) ? parseInt(e.key, 10) - 1 : ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(e.key.toLowerCase());
    if (i < 0 || i >= opts.length) return;
    e.preventDefault();
    opts[i].click();
  });

  /* Los segmentados se repintan enteros al elegir (cambia la pantalla de
     debajo), así que la transición se hace FLIP: antes del repintado se
     apunta dónde estaba la píldora y, ya repintado, la nueva sale de ahí
     y se desliza a su sitio. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.seg__opt');
    if (!b || b.classList.contains('is-on')) return;
    var seg = b.closest('.seg'), desde = seg.style.getPropertyValue('--i');
    requestAnimationFrame(function () {
      var ahora = $(seg.id) || seg, opts = ahora.querySelectorAll('.seg__opt');
      var hasta = Array.prototype.indexOf.call(opts, ahora.querySelector('.seg__opt.is-on'));
      if (hasta < 0) return;
      var pill = ahora.querySelector('.seg__pill');
      pill.style.transition = 'none';
      ahora.style.setProperty('--i', desde);
      void pill.offsetWidth;
      pill.style.transition = '';
      ahora.style.setProperty('--i', hasta);
    });
  }, true);

  // Diccionario
  el.dictInput.addEventListener('input', function () {
    pintarDiccionario(this.value);
  });
  el.screens.dict.addEventListener('click', function (e) {
    var seg = e.target.closest('#dictSeg .seg__opt');
    if (seg) {
      dictCatActiva = seg.dataset.valor;
      Array.prototype.forEach.call(el.dictSeg.children, function (b) {
        b.classList.toggle('is-on', b === seg);
      });
      pintarDiccionario(el.dictInput.value);
      return;
    }
    var l = e.target.closest('.alfa__l');
    if (l) {
      Array.prototype.forEach.call(el.dictLetras.children, function (b) { b.classList.toggle('is-on', b === l); });
      var sec = $('dsec-' + (l.dataset.letra === '—' ? 'raya' : l.dataset.letra));
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  el.alfaPrev.innerHTML = icono('chevron-right', 14);
  el.alfaNext.innerHTML = icono('chevron-right', 14);
  el.alfaPrev.addEventListener('click', function () { el.dictLetras.scrollBy({ left: -(el.dictLetras.clientWidth - 16), behavior: 'smooth' }); });
  el.alfaNext.addEventListener('click', function () { el.dictLetras.scrollBy({ left: el.dictLetras.clientWidth - 16, behavior: 'smooth' }); });
  el.dictLetras.addEventListener('scroll', actualizarFlechasAlfa);
  document.querySelector('#screenDict .search__ico').innerHTML = icono('search', 20);
  $('authLogo').innerHTML = icono('logo', 48);

  // ─────────── Arranque ───────────

  function errorDeCarga(msg) {
    el.screenAuth.hidden = true;
    document.getElementById('screenHome').innerHTML =
      '<div class="ficha">' +
      '<h1 class="ficha__title">No se ha podido cargar el curso</h1>' +
      '<div class="ficha__body"><p>' + esc(msg) + '</p>' +
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
     tocar un archivo gigante. La versión de un solo archivo deja el curso
     ya montado en window.__CURSO__, y entonces no hace falta pedir nada. */
  function cargarCurso() {
    if (window.__CURSO__) return Promise.resolve(window.__CURSO__);
    /* Reestructuración en 10 unidades con subniveles: decidida — es el
       curso, ya no hace falta el flag ?v2 ni la comparación con el
       antiguo data/curso.json (que se deja en el repo sin usar por si
       hiciera falta volver atrás). Ver docs/propuesta-10-unidades.md. */
    window.__CURSO_V2__ = true;
    var indicePath = 'data/curso-v2.json';
    return traer(indicePath).then(function (indice) {
      return Promise.all(indice.unidades.map(function (ruta) {
        return traer('data/' + ruta);
      })).then(function (unidades) {
        return { meta: indice.meta, unidades: unidades };
      });
    });
  }

  // ─────────── Acceso (usuario + contraseña) ───────────

  function mostrarAuth() {
    estado.pantalla = 'auth';
    el.screenAuth.hidden = false;
    for (var k in el.screens) el.screens[k].hidden = true;
    el.hdr.className = 'hdr';
    el.hdr.innerHTML = '';
    document.body.classList.remove('con-tabbar', 'con-lateral');
    el.sheet.hidden = true;
    el.authPassword.value = '';
  }

  /* El nombre para el saludo, si la cuenta lo tiene. Solo el primero:
     «Kaixo, Miguel!», no el nombre completo. */
  function nombreDe(user) {
    var m = (user && user.user_metadata) || {};
    var n = m.nombre || m.name || m.full_name || m.first_name || '';
    return String(n).trim().split(/\s+/)[0] || '';
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
        adoptarProgreso(r[1]);
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
      usuarioEmail = session.user.email || '';
      usuarioNombre = nombreDe(session.user);
      pintarCuentaLateral();
      arrancarApp();
    } else if (MODO_LOCAL) {
      // En local se entra directamente, sin cuenta — el progreso vive
      // en localStorage (ver cargarProgreso/guardarProgresoAhora).
      usuarioId = null;
      arrancarApp();
    } else if (event !== 'INITIAL_SESSION' || !arrancado) {
      arrancado = false;
      usuarioId = null;
      mostrarAuth();
    }
  });

})();
