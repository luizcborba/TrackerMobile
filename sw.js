const CACHE_NAME = 'wyd-quest-tracker-v3.0';
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
      body: data.body || '🎃 Nova notificação do WYD Quest Tracker! 👻',
      icon: './icon-192x192.png',
      badge: './icon-72x72.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'wyd-quest',
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
      self.registration.showNotification(data.title || '🎃 WYD Quest Tracker 👻', options)
    );
  }
});

// Manipulação de cliques nas notificações
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Clique na notificação:', event.action);
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
          return clients.openWindow('./index.html?source=notification');
        }
      })
    );
  }
});

// === SISTEMA DE NOTIFICAÇÕES LOCAIS ===
// Agenda próximas notificações quando o service worker ativa
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
      
      // Agenda notificações locais
      scheduleQuestNotifications();
      
      return self.clients.claim();
    })
  );
});

// Horários das arenas e eventos
const questSchedule = [
  { id: 'arena1', name: 'Arena 13:00', hour: 13, minute: 0 },
  { id: 'arena2', name: 'Arena 19:00', hour: 19, minute: 0 },
  { id: 'arena3', name: 'Arena 20:30', hour: 20, minute: 30 },
  { id: 'arena4', name: 'Arena 23:00', hour: 23, minute: 0 },
  { id: 'evento1', name: 'Evento Halloween 11:00', hour: 11, minute: 0 },
  { id: 'evento2', name: 'Evento Halloween 15:00', hour: 15, minute: 0 },
  { id: 'evento3', name: 'Evento Halloween 18:00', hour: 18, minute: 0 },
  { id: 'evento4', name: 'Evento Halloween 22:00', hour: 22, minute: 0 },
  { id: 'teleporte1', name: 'Evento Teleporte 12:00', hour: 12, minute: 0 },
  { id: 'teleporte2', name: 'Evento Teleporte 20:00', hour: 20, minute: 0 },
  { id: 'teleporte3', name: 'Evento Teleporte Sábado 10:00', hour: 10, minute: 0, days: [6] }, // Sábado
  { id: 'teleporte4', name: 'Evento Teleporte Sábado 14:00', hour: 14, minute: 0, days: [6] }, // Sábado
  { id: 'teleporte5', name: 'Evento Teleporte Domingo 16:00', hour: 16, minute: 0, days: [0] }, // Domingo
  { id: 'teleporte6', name: 'Evento Teleporte Domingo 21:00', hour: 21, minute: 0, days: [0] }  // Domingo
];

function scheduleQuestNotifications() {
  console.log('Service Worker: Agendando notificações...');
  
  // Limpa timers anteriores
  if (self.questTimers) {
    self.questTimers.forEach(timer => clearTimeout(timer));
  }
  self.questTimers = [];
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  questSchedule.forEach(quest => {
    const questTime = quest.hour * 60 + quest.minute;
    
    // Verifica se o evento tem restrição de dias
    if (quest.days) {
      // Agenda para os próximos 7 dias
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + i);
        
        if (quest.days.includes(checkDate.getDay())) {
          scheduleNotificationForTime(quest, questTime, checkDate);
        }
      }
    } else {
      // Agenda para hoje se ainda não passou
      scheduleNotificationForTime(quest, questTime, now);
      
      // Agenda para amanhã
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduleNotificationForTime(quest, questTime, tomorrow);
    }
  });
}

function scheduleNotificationForTime(quest, questTime, targetDate) {
  const notifyTime = questTime - 5; // 5 minutos antes
  const notifyDate = new Date(targetDate);
  notifyDate.setHours(Math.floor(notifyTime / 60), notifyTime % 60, 0, 0);
  
  const now = new Date();
  const timeUntilNotification = notifyDate.getTime() - now.getTime();
  
  // Só agenda se for no futuro
  if (timeUntilNotification > 0) {
    const timer = setTimeout(() => {
      showQuestNotification(quest);
    }, timeUntilNotification);
    
    self.questTimers.push(timer);
    
    console.log(`SW: ${quest.name} agendado para ${notifyDate.toLocaleString()} (em ${Math.round(timeUntilNotification / 60000)} min)`);
  }
}

function showQuestNotification(quest) {
  console.log(`SW: Mostrando notificação para ${quest.name}`);
  
  const now = new Date();
  const questTime = quest.hour * 60 + quest.minute;
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  let title, body;
  
  if (currentTime < questTime) {
    const minutesLeft = questTime - currentTime;
    title = '⏰ WYD Quest Tracker';
    body = `🎃 ${quest.name} começa em ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}! 👻`;
  } else {
    title = '🚨 WYD Quest Tracker';
    body = `⚔️ ${quest.name} está começando AGORA! 🏆`;
  }
  
  const options = {
    body: body,
    icon: './icon-192x192.png',
    badge: './icon-72x72.png',
    tag: quest.id + '_' + Date.now(),
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    actions: [
      {
        action: 'open',
        title: '🎮 Abrir WYD Tracker',
        icon: './icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: '❌ Dispensar',
        icon: './icon-72x72.png'
      }
    ],
    data: {
      quest: quest,
      timestamp: Date.now(),
      url: './index.html?source=notification&quest=' + quest.id
    }
  };
  
  self.registration.showNotification(title, options);
}

// Reagenda notificações diariamente
setInterval(() => {
  const now = new Date();
  // Reagenda às 00:01 de cada dia
  if (now.getHours() === 0 && now.getMinutes() === 1) {
    console.log('Service Worker: Reagendando notificações para novo dia');
    scheduleQuestNotifications();
  }
}, 60000); // Verifica a cada minuto