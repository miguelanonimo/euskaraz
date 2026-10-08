/* Service worker de Euskaraz: solo recibe los avisos del recordatorio (Web
   Push). No guarda nada en caché ni intercepta peticiones, así que no puede
   dejar la app «vieja». El servidor que los envía está en supabase/avisos/. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

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
