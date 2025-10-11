const CACHE_NAME = 'wyd-quest-tracker-v4.0-standalone';
const urlsToCache = [
  './',
  './index.html',
  './index.html?source=pwa&standalone=true',
  './manifest.json',
  './icon-72x72.png',
  './icon-192x192.png',
  './icon-192x192.svg'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando versão standalone...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto para modo standalone');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Arquivos em cache para app standalone');
        // Força ativação imediata para modo app
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro ao fazer cache standalone:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando modo standalone...');
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
      console.log('Service Worker: Ativado em modo standalone');
      // Toma controle imediato de todas as páginas
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições para modo standalone
self.addEventListener('fetch', function(event) {
  // Ignora métodos que não sejam GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Prioriza cache para modo standalone (offline-first)
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache se disponível
        if (response) {
          console.log('Service Worker: Servindo do cache (standalone):', event.request.url);
          return response;
        }
        
        // Busca da rede com timeout para apps
        return Promise.race([
          fetch(event.request),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Network timeout')), 5000)
          )
        ]).then(function(response) {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta para cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(function() {
        console.log('Service Worker: Falha na rede, tentando cache...');
        // Se offline e não há cache, retorna página principal
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Notificações push para modo standalone
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push notification recebida em modo standalone');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || '🎃 Nova notificação do WYD Quest Tracker! 👻',
    icon: './icon-192x192.png',
    badge: './icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'wyd-quest-standalone',
    renotify: true,
    requireInteraction: true,
    silent: false,
    actions: [
      {
        action: 'open',
        title: '🎮 Abrir App',
        icon: './icon-72x72.png'
      },
      {
        action: 'close',
        title: '❌ Fechar',
        icon: './icon-72x72.png'
      }
    ],
    data: {
      url: './index.html?source=notification',
      timestamp: Date.now()
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('🎃 WYD Quest Tracker 👻', options)
  );
});

// Manipulação de cliques em notificações (modo standalone)
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Clique na notificação (standalone):', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // Procura por janela já aberta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não há janela aberta, abre nova
        if (clients.openWindow) {
          return clients.openWindow('./index.html?source=notification&standalone=true');
        }
      })
    );
  }
});

// Sincronização em background para modo standalone
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync (standalone):', event.tag);
  
  if (event.tag === 'arena-reminder-standalone') {
    event.waitUntil(
      // Verifica horários e envia notificações em modo standalone
      checkArenaReminders()
    );
  }
});

function checkArenaReminders() {
  const now = new Date();
  const currentHour = now.getHours();
  const arenaHours = [11, 13, 15, 18, 19, 20, 22, 23];
  
  if (arenaHours.includes(currentHour)) {
    return self.registration.showNotification('🎃 WYD Quest Tracker 👻', {
      body: `⚔️ Arena às ${currentHour}:00 começou! Participe agora! 🏆`,
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      tag: 'arena-' + currentHour,
      requireInteraction: true
    });
  }
  
  return Promise.resolve();
}

// Mensagens do app principal (modo standalone)
self.addEventListener('message', function(event) {
  console.log('Service Worker: Mensagem recebida (standalone):', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ 
      version: CACHE_NAME,
      mode: 'standalone',
      timestamp: Date.now()
    });
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Força atualização do cache
    caches.delete(CACHE_NAME).then(() => {
      self.registration.update();
    });
  }
});