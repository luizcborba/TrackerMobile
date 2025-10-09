const CACHE_NAME = 'wyd-quest-tracker-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-72x72.png',
  './icon-192x192.png',
  './icon-192x192.svg'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Arquivos em cache');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro ao fazer cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado');
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', function(event) {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache se disponível
        if (response) {
          console.log('Service Worker: Servindo do cache:', event.request.url);
          return response;
        }

        // Faz a requisição de rede
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
        ).catch(function() {
          // Em caso de erro de rede, retorna uma página de fallback se for HTML
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
    );
});

// Notificações push (para futuras implementações)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push recebido');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova notificação do WYD Quest Tracker',
      icon: './icon-192x192.png',
      badge: './icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'wyd-quest',
      requireInteraction: true,
      actions: [
        {
          action: 'confirm',
          title: '✅ Confirmar',
          icon: './icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: '❌ Descartar',
          icon: './icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'WYD Quest Tracker', options)
    );
  }
});

// Manipulação de cliques nas notificações
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Clique na notificação:', event.action);
  event.notification.close();

  if (event.action === 'confirm') {
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'dismiss') {
    console.log('Notificação descartada');
  } else {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});