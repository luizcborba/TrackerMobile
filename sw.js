const CACHE_NAME = 'wyd-quest-tracker-v1.0.0';
const urlsToCache = [
  '/TrackerMobile/',
  '/TrackerMobile/index.html',
  '/TrackerMobile/app.js',
  '/TrackerMobile/cloud-sync.js',
  '/TrackerMobile/manifest.json',
  '/TrackerMobile/icon-72x72.png',
  '/TrackerMobile/icon-96x96.png',
  '/TrackerMobile/icon-128x128.png',
  '/TrackerMobile/icon-144x144.png',
  '/TrackerMobile/icon-152x152.png',
  '/TrackerMobile/icon-192x192.png',
  '/TrackerMobile/icon-384x384.png',
  '/TrackerMobile/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for quest notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'quest-notification') {
    event.waitUntil(
      checkQuestSchedule()
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do WYD Quest Tracker',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WYD Quest Tracker', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/TrackerMobile/')
    );
  }
});

// Function to check quest schedule
async function checkQuestSchedule() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = now.toDateString();
  
  const questSchedule = [
    { id: 'arena1', name: 'Arena 13:00', hour: 13, minute: 0 },
    { id: 'arena2', name: 'Arena 19:00', hour: 19, minute: 0 },
    { id: 'arena3', name: 'Arena 20:30', hour: 20, minute: 30 },
    { id: 'arena4', name: 'Arena 23:00', hour: 23, minute: 0 }
  ];

  // Recupera dados do localStorage via postMessage
  const clients = await self.clients.matchAll();
  
  questSchedule.forEach(quest => {
    // Notificar 5 minutos antes
    let notifyHour = quest.hour;
    let notifyMinute = quest.minute - 5;
    
    if (notifyMinute < 0) {
      notifyMinute += 60;
      notifyHour -= 1;
    }
    
    // Notificação principal (5 min antes)
    if (currentHour === notifyHour && currentMinute === notifyMinute) {
      self.registration.showNotification('⚔️ WYD Quest Tracker', {
        body: `⏰ ${quest.name} começa em 5 minutos!\nToque para abrir o app.`,
        icon: '/TrackerMobile/icon-192x192.png',
        badge: '/TrackerMobile/icon-72x72.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: `${quest.id}_5min`,
        requireInteraction: true,
        silent: false,
        actions: [
          {
            action: 'open',
            title: 'Abrir App',
            icon: '/TrackerMobile/icon-72x72.png'
          },
          {
            action: 'dismiss',
            title: 'Dispensar',
            icon: '/TrackerMobile/icon-72x72.png'
          }
        ],
        data: {
          url: '/TrackerMobile/',
          questId: quest.id
        }
      });
    }
    
    // Notificação no horário exato
    if (currentHour === quest.hour && currentMinute === quest.minute) {
      self.registration.showNotification('⚔️ Arena Começou!', {
        body: `🔥 ${quest.name} começou agora!\nEntre no jogo!`,
        icon: '/TrackerMobile/icon-192x192.png',
        badge: '/TrackerMobile/icon-72x72.png',
        vibrate: [300, 100, 300, 100, 300],
        tag: `${quest.id}_now`,
        requireInteraction: true,
        silent: false,
        actions: [
          {
            action: 'open',
            title: 'Abrir App',
            icon: '/TrackerMobile/icon-72x72.png'
          }
        ],
        data: {
          url: '/TrackerMobile/',
          questId: quest.id
        }
      });
    }
  });
}

// Executa verificação periodicamente (a cada minuto)
setInterval(checkQuestSchedule, 60000);