// Service worker mínimo: deja instalar el panel como app y enseña las notificaciones push del NAS.
// No guarda nada en caché: el panel necesita el NAS para funcionar y así siempre se ve la última versión desplegada.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));

// El NAS manda { title, body, tag, url }: `tag` hace que una notificación nueva sustituya a la anterior igual
self.addEventListener('push', event => {
  const { title, body, tag, url } = event.data.json();
  event.waitUntil(self.registration.showNotification(title, { body, tag, icon: 'icon-192.png', badge: 'icon-192.png', data: { url } }));
});

// Al tocarla, enseña el panel si ya está abierto y, si no, lo abre
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const panelUrl = new URL(event.notification.data.url, self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const openPanel = windows.find(panel => panel.url.startsWith(self.registration.scope));
    return openPanel ? openPanel.navigate(panelUrl).then(panel => panel.focus()) : self.clients.openWindow(panelUrl);
  }));
});
