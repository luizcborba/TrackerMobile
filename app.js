const data = {
    quests: {},
    subquests: {},
    streak: 0,
    totalXP: 0,
    level: 1,
    lastCompletedDate: null,
    theme: 'default',
    notifiedQuests: {},
    notificationInterval: null
};

// Sistema de notificação sonora
const questSchedule = [
    { id: 'arena1', name: 'Arena 13:00', hour: 13, minute: 0 },
    { id: 'arena2', name: 'Arena 19:00', hour: 19, minute: 0 },
    { id: 'arena3', name: 'Arena 20:30', hour: 20, minute: 30 },
    { id: 'arena4', name: 'Arena 23:00', hour: 23, minute: 0 }
];

function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.3;
        
        // Primeira nota
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        oscillator1.frequency.value = 800;
        gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        
        // Segunda nota (mais aguda)
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.value = 1000;
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + duration);
        }, 150);
    } catch (error) {
        console.log('Erro ao reproduzir som:', error);
    }
}

function startNotificationLoop() {
    if (data.notificationInterval) {
        clearInterval(data.notificationInterval);
    }
    data.notificationInterval = setInterval(() => {
        playNotificationSound();
    }, 3000); // Repete a cada 3 segundos
}

function stopNotificationLoop() {
    if (data.notificationInterval) {
        clearInterval(data.notificationInterval);
        data.notificationInterval = null;
    }
}

function checkQuestNotifications() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toDateString();
    
    // Reseta notificações no início do dia
    if (!data.notifiedQuests[today]) {
        data.notifiedQuests = { [today]: {} };
        saveData();
    }
    
    questSchedule.forEach(quest => {
        // Calcula o horário de notificação (5 minutos antes)
        let notifyHour = quest.hour;
        let notifyMinute = quest.minute - 5;
        
        if (notifyMinute < 0) {
            notifyMinute += 60;
            notifyHour -= 1;
        }
        
        // Verifica se é hora de notificar
        if (currentHour === notifyHour && currentMinute === notifyMinute) {
            const notificationKey = `${quest.id}_${today}`;
            
            if (!data.notifiedQuests[today][notificationKey] && !data.quests[quest.id]) {
                startNotificationLoop(); // Inicia loop de som
                showPersistentNotification(`⏰ ${quest.name} começa em 5 minutos!`, quest.id);
                
                // Notificação do navegador se disponível
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('WYD Quest Tracker', {
                        body: `⏰ ${quest.name} começa em 5 minutos!`,
                        icon: '/icon-192x192.png',
                        tag: quest.id
                    });
                }
            }
        }
    });
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ Permissão de notificação concedida');
                    showAchievement('🔔 Notificações ativadas! Você será alertado antes das arenas.');
                    
                    // Teste de notificação
                    setTimeout(() => {
                        new Notification('⚔️ WYD Quest Tracker', {
                            body: 'Notificações configuradas com sucesso! 🎉',
                            icon: './icon-192x192.png',
                            tag: 'test'
                        });
                    }, 1000);
                } else {
                    console.log('❌ Permissão de notificação negada');
                }
            });
        } else if (Notification.permission === 'granted') {
            console.log('✅ Permissões já concedidas');
        } else {
            console.log('❌ Notificações bloqueadas pelo usuário');
        }
    } else {
        console.log('❌ Navegador não suporta notificações');
    }
}

function loadData() {
    const saved = localStorage.getItem('wydQuestData');
    if (saved) {
        Object.assign(data, JSON.parse(saved));
        applyTheme();
        checkDailyReset();
        updateUI();
    }
    
    // Solicita permissão para notificações
    requestNotificationPermission();
}

function applyTheme() {
    document.body.className = '';
    if (data.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    if (data.theme === 'dark') {
        data.theme = 'default';
    } else {
        data.theme = 'dark';
    }
    applyTheme();
    saveData();
}

function saveData() {
    // Adicionar timestamp da última modificação
    data.lastSync = new Date().toISOString();
    localStorage.setItem('wydQuestData', JSON.stringify(data));
    
    // Dados salvos localmente - ultimate-sync cuida da sincronização
    console.log('� Dados salvos localmente');
}

function checkDailyReset() {
    const now = new Date();
    const today = now.toDateString();
    
    if (data.lastCompletedDate !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (data.lastCompletedDate === yesterday.toDateString() && Object.values(data.quests).some(q => q)) {
            data.streak++;
        } else if (data.lastCompletedDate && data.lastCompletedDate !== yesterday.toDateString()) {
            data.streak = 0;
        }
        
        data.quests = {};
        data.subquests = {};
        data.lastCompletedDate = null;
        saveData();
    }
}

function updateUI() {
    let completed = 0;
    const total = document.querySelectorAll('.quest-item').length;
    
    // Conta quests normais completadas
    document.querySelectorAll('.quest-item:not(.multi-quest)').forEach(item => {
        if (data.quests[item.dataset.quest]) {
            completed++;
        }
    });
    
    // Conta multi-quests (expedição e infernal)
    const expedicaoCompleted = ['expedicao-1', 'expedicao-2', 'expedicao-3'].every(id => data.subquests[id]);
    const infernalCompleted = ['infernal-1', 'infernal-2'].every(id => data.subquests[id]);
    
    if (expedicaoCompleted) completed++;
    if (infernalCompleted) completed++;
    
    document.getElementById('completed').textContent = completed;
    document.getElementById('total').textContent = total;
    document.getElementById('streak').textContent = data.streak;
    document.getElementById('level').textContent = data.level;
    document.getElementById('totalXP').textContent = data.totalXP;
    
    const progress = (data.totalXP % 100);
    document.getElementById('levelProgress').style.width = progress + '%';
    
    // Atualiza quests normais
    document.querySelectorAll('.quest-item:not(.multi-quest)').forEach(item => {
        const questId = item.dataset.quest;
        if (data.quests[questId]) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
    });
    
    // Atualiza subquests
    document.querySelectorAll('.quest-subcheck').forEach(subcheck => {
        const subquestId = subcheck.dataset.subquest;
        if (data.subquests[subquestId]) {
            subcheck.classList.add('completed');
        } else {
            subcheck.classList.remove('completed');
        }
    });
    
    // Atualiza visual das multi-quests
    if (expedicaoCompleted) {
        document.querySelector('[data-quest="expedicao"]').classList.add('completed');
    } else {
        document.querySelector('[data-quest="expedicao"]').classList.remove('completed');
    }
    
    if (infernalCompleted) {
        document.querySelector('[data-quest="infernal"]').classList.add('completed');
    } else {
        document.querySelector('[data-quest="infernal"]').classList.remove('completed');
    }
}

function showAchievement(text) {
    const popup = document.getElementById('achievementPopup');
    document.getElementById('achievementText').textContent = text;
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

function showPersistentNotification(text, questId) {
    const popup = document.getElementById('achievementPopup');
    const closeBtn = document.getElementById('notificationClose');
    
    document.getElementById('achievementText').textContent = text;
    popup.classList.add('show', 'persistent');
    closeBtn.style.display = 'block';
    
    closeBtn.onclick = () => {
        stopNotificationLoop(); // Para o loop de som
        popup.classList.remove('show', 'persistent');
        closeBtn.style.display = 'none';
        
        // Marca como notificado para não repetir
        const today = new Date().toDateString();
        if (!data.notifiedQuests[today]) {
            data.notifiedQuests[today] = {};
        }
        const notificationKey = `${questId}_${today}`;
        data.notifiedQuests[today][notificationKey] = true;
        saveData();
    };
}

function addXP(amount) {
    data.totalXP += amount;
    const newLevel = Math.floor(data.totalXP / 100) + 1;
    
    if (newLevel > data.level) {
        data.level = newLevel;
        showAchievement(`Level Up! Você alcançou o nível ${data.level}!`);
    }
}

function updateTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    document.getElementById('resetTimer').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Quest items (não multi-quest)
    document.querySelectorAll('.quest-item:not(.multi-quest)').forEach(item => {
        item.addEventListener('click', function() {
            const questId = this.dataset.quest;
            const wasCompleted = data.quests[questId];
            
            data.quests[questId] = !wasCompleted;
            
            if (!wasCompleted) {
                const now = new Date();
                data.lastCompletedDate = now.toDateString();
                addXP(10);
                
                checkAllQuestsCompleted();
            } else {
                data.totalXP = Math.max(0, data.totalXP - 10);
                data.level = Math.floor(data.totalXP / 100) + 1;
            }
            
            saveData();
            updateUI();
        });
    });

    // Handler para sub-checkboxes
    document.querySelectorAll('.quest-subcheck').forEach(subcheck => {
        subcheck.addEventListener('click', function(e) {
            e.stopPropagation();
            const subquestId = this.dataset.subquest;
            const wasCompleted = data.subquests[subquestId];
            
            data.subquests[subquestId] = !wasCompleted;
            
            if (!wasCompleted) {
                const now = new Date();
                data.lastCompletedDate = now.toDateString();
                addXP(10);
                
                checkAllQuestsCompleted();
            } else {
                data.totalXP = Math.max(0, data.totalXP - 10);
                data.level = Math.floor(data.totalXP / 100) + 1;
            }
            
            saveData();
            updateUI();
        });
    });
});

function checkAllQuestsCompleted() {
    let completed = 0;
    const total = document.querySelectorAll('.quest-item').length;
    
    // Conta quests normais
    document.querySelectorAll('.quest-item:not(.multi-quest)').forEach(item => {
        if (data.quests[item.dataset.quest]) {
            completed++;
        }
    });
    
    // Conta multi-quests
    const expedicaoCompleted = ['expedicao-1', 'expedicao-2', 'expedicao-3'].every(id => data.subquests[id]);
    const infernalCompleted = ['infernal-1', 'infernal-2'].every(id => data.subquests[id]);
    
    if (expedicaoCompleted) completed++;
    if (infernalCompleted) completed++;
    
    if (completed === total) {
        addXP(50);
        showAchievement('Todas as quests completadas! +50 XP Bônus!');
        document.querySelector('.stats-container').classList.add('celebrating');
        setTimeout(() => {
            document.querySelector('.stats-container').classList.remove('celebrating');
        }, 500);
    }
}

function testNotification() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('⚔️ Teste de Notificação', {
                body: '🎉 Perfeito! As notificações estão funcionando.\nVocê será alertado antes das arenas!',
                icon: './icon-192x192.png',
                tag: 'test',
                vibrate: [200, 100, 200]
            });
            showAchievement('✅ Teste realizado! Notificação enviada.');
        } else if (Notification.permission === 'default') {
            requestNotificationPermission();
        } else {
            showAchievement('❌ Notificações bloqueadas. Ative nas configurações do navegador.');
        }
    } else {
        showAchievement('❌ Seu navegador não suporta notificações.');
    }
}

// Inicialização
loadData();
updateTimer();
setInterval(updateTimer, 1000);
setInterval(checkDailyReset, 60000);
setInterval(checkQuestNotifications, 60000); // Verifica notificações a cada minuto
checkQuestNotifications(); // Verifica imediatamente ao carregar

// Registra background sync se disponível
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('quest-notification');
    }).catch(err => {
        console.log('Background sync não disponível:', err);
    });
}

// Inicialização removida - agora é feita pelo ultimate-sync.js