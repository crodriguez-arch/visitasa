// Trabajador de VisiTasa: recibe los avisos y los enseña aunque la app esté cerrada.
// El servidor manda un «toque» vacío; aquí se recoge el texto del aviso preguntando a la app.
var APP = 'https://script.google.com/macros/s/AKfycbyyTviYXK8w6ycannW6rSxASrYa7P6ocqmJaYO5uUVKKIUoQbhfASR_FTYQAnbwjnUnyg/exec';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (ev) { ev.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (ev) {
  ev.waitUntil(self.registration.pushManager.getSubscription().then(function (sub) {
    return fetch(APP + '?avisos=1&ep=' + encodeURIComponent(sub.endpoint)).then(function (r) { return r.json(); });
  }).catch(function () { return null; }).then(function (a) {
    a = a || { titulo: 'VisiTasa', texto: 'Tienes novedades en la agenda de visitas.', url: self.registration.scope };
    return self.registration.showNotification(a.titulo, {
      body: a.texto, icon: 'icono-192.png', badge: 'icono-aviso-96.png', lang: 'es', data: { url: a.url }
    });
  }));
});

self.addEventListener('notificationclick', function (ev) {
  ev.notification.close();
  var url = (ev.notification.data && ev.notification.data.url) || self.registration.scope;
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ventanas) {
    for (var i = 0; i < ventanas.length; i++) {
      if (ventanas[i].url.indexOf(self.registration.scope) === 0 && 'navigate' in ventanas[i]) {
        return ventanas[i].navigate(url).then(function (v) { return v && v.focus(); });
      }
    }
    return self.clients.openWindow(url);
  }));
});
