const CACHE_NAME = 'wyd-quest-tracker-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Verifica se é uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Notificações push (para futuras implementações)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'wyd-quest',
      actions: [
        {
          action: 'confirm',
          title: 'Confirmar'
        },
        {
          action: 'dismiss',
          title: 'Descartar'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manipulação de cliques nas notificações
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'confirm') {
    // Ação para confirmar
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'dismiss') {
    // Ação para descartar
    console.log('Notificação descartada');
  } else {
    // Clique geral na notificação
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});