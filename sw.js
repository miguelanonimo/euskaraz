/* Service worker de Euskaraz.
 *
 * Hace dos cosas: recibe los avisos del recordatorio (Web Push, el
 * servidor está en supabase/avisos/) y guarda la app para poder usarla
 * sin conexión — en un avión, por ejemplo. Lo segundo es de 11/11/2026 y
 * lo pidió Ric.
 *
 * LO QUE MÁS IMPORTA DE ESTE ARCHIVO. Antes no cacheaba nada a propósito,
 * «así que no puede dejar la app vieja». Ese riesgo es real y sigue
 * siéndolo: una caché mal hecha deja a Miguel y a quien esté probando
 * atrapados en una versión antigua, recargando sin que sirva de nada.
 * Por eso:
 *
 *   · Todo lo de la app —html, css, js, datos del curso— va a RED
 *     PRIMERO. Con conexión siempre se ve lo último; la copia guardada
 *     solo entra cuando la red falla.
 *   · La caché lleva el número de versión del `?v=` que ya se sube en
 *     cada publicación. Versión nueva, caché nueva: la vieja se borra
 *     entera al activarse.
 *   · Lo único que va a caché primero es lo que no cambia nunca: los
 *     audios y las fuentes.
 *
 * Resultado: con red, esto es invisible. Sin red, la app abre igual.
 */

var VERSION = new URLSearchParams(self.location.search).get('v') || 'dev';
var CACHE = 'euskaraz-' + VERSION;

/* Lo imprescindible para que la app abra. Si algo de esto falla, la
   instalación falla y se reintenta: más vale eso que una caché a medias
   que arranque rota. */
var ESENCIAL = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/vendor/supabase.js',
  'site.webmanifest',
  'data/curso-v2.json',
  'data/palabras-del-dia.json',
  'css/fonts/Lastik-Regular.woff',
  'css/fonts/PPNeueMontreal-Bold.woff',
  'css/fonts/PPNeueMontreal-Regular.woff',
  'icons/icon-192.png',
  'icons/apple-touch-icon.png'
];

function esAudio(u) { return u.pathname.indexOf('/euskaraz-audio/') !== -1; }
function esFuente(u) { return /fonts\.(gstatic|googleapis)\.com$/.test(u.hostname); }
function esApiSupabase(u) {
  return /supabase\.co$/.test(u.hostname) && !esAudio(u);
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ESENCIAL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
      .then(llenarDeFondo)
  );
});

/* El curso y los audios, en segundo plano y sin bloquear la activación.
   Van de uno en uno con un tope de peticiones a la vez: son 1.581
   archivos de 6 KB y no tiene sentido lanzarlos todos de golpe. Si
   alguno falla, se queda sin guardar y ya está — se bajará cuando haga
   falta, si hay red. */
function llenarDeFondo() {
  return caches.open(CACHE).then(function (c) {
    return fetch('data/curso-v2.json').then(function (r) { return r.json(); })
      .then(function (idx) {
        var unidades = (idx.unidades || []).map(function (u) { return 'data/' + u; });
        return enTandas(unidades, 4, function (u) { return guardar(c, u); })
          .then(function () { return Promise.all(unidades.map(function (u) {
            return c.match(u).then(function (res) { return res ? res.json() : null; });
          })); })
          .then(function (datos) {
            var audios = {};
            datos.concat([idx]).forEach(function (d) { recogerAudios(d, audios); });
            return fetch('data/palabras-del-dia.json')
              .then(function (r) { return r.json(); })
              .then(function (p) { recogerAudios(p, audios); })
              .catch(function () {})
              .then(function () {
                return enTandas(Object.keys(audios), 6, function (a) { return guardar(c, a); });
              });
          });
      })
      .catch(function () {});
  });
}

function recogerAudios(o, acc) {
  if (!o) return;
  if (Array.isArray(o)) { o.forEach(function (x) { recogerAudios(x, acc); }); return; }
  if (typeof o !== 'object') return;
  Object.keys(o).forEach(function (k) {
    var v = o[k];
    if (k === 'audio' && typeof v === 'string' && v.slice(-4) === '.mp3') {
      acc[self.AUDIO_BASE + v] = 1;
    } else { recogerAudios(v, acc); }
  });
}

function enTandas(lista, a_la_vez, hacer) {
  var i = 0;
  function siguiente() {
    if (i >= lista.length) return Promise.resolve();
    return hacer(lista[i++]).catch(function () {}).then(siguiente);
  }
  var hilos = [];
  for (var n = 0; n < a_la_vez; n++) hilos.push(siguiente());
  return Promise.all(hilos);
}

function guardar(c, url) {
  return fetch(url, { cache: 'no-cache' }).then(function (r) {
    if (r && r.ok) return c.put(url, r.clone());
  });
}

self.addEventListener('message', function (e) {
  // La app manda el bucket al activarse: el sw no puede adivinarlo.
  if (e.data && e.data.tipo === 'audio-base') self.AUDIO_BASE = e.data.base;
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);

  // La cuenta y el progreso no se cachean jamás: son datos vivos.
  if (esApiSupabase(u)) return;

  if (esAudio(u) || esFuente(u)) {          // no cambian: copia primero
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || fetch(req).then(function (r) {
          if (r && (r.ok || r.type === 'opaque')) {
            var copia = r.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copia); });
          }
          return r;
        });
      })
    );
    return;
  }

  if (u.origin !== self.location.origin) return;

  /* La app y sus datos: red primero, y la copia solo si no hay red.
     Dos detalles que costaron una prueba sin servidor:

     · `ignoreSearch`. La página pide `js/app.js?v=134` y en la caché
       está guardado como `js/app.js`: sin esto no se encuentran y el
       archivo se da por perdido.
     · El index.html de reserva es SOLO para la navegación. Devolverlo
       ante cualquier fallo significaba contestar una página html a quien
       pedía un .js, y el navegador se comía un «Unexpected token '<'»
       con la app ya medio arrancada. Peor que no contestar. */
  e.respondWith(
    fetch(req).then(function (r) {
      if (r && r.ok) {
        var copia = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copia); });
      }
      return r;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('index.html');
        return new Response('', { status: 504, statusText: 'sin conexión' });
      });
    })
  );
});

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'Euskaraz', {
    body: d.cuerpo || '¿Euskaraz pixka bat?',
    icon: 'icons/icon-192.png',
    tag: 'euskaraz-aviso',          // un aviso nuevo sustituye al anterior
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ventanas) {
    for (var i = 0; i < ventanas.length; i++) {
      if ('focus' in ventanas[i]) return ventanas[i].focus();
    }
    return self.clients.openWindow(url);
  }));
});
