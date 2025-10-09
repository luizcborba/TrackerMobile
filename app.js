// Dados do jogador
const data = {
    quests: {},
    subquests: {},
    streak: 0,
    totalXP: 0,
    level: 1,
    lastCompletedDate: null,
    theme: 'default',
    notifiedQuests: {},
    lastSync: null,
    notificationInterval: null
};

// Sistema de notificação sonora
const questSchedule = [
    { id: 'arena1', name: 'Arena 13:00', hour: 13, minute: 0 },
    { id: 'arena2', name: 'Arena 19:00', hour: 19, minute: 0 },
    { id: 'arena3', name: 'Arena 20:30', hour: 20, minute: 30 },
    { id: 'arena4', name: 'Arena 23:00', hour: 23, minute: 0 }
];

// Lista de quests principais
const questsData = [
    { id: 'checkin', name: 'Check-in Diário', emoji: '✅', xp: 50, category: 'daily' },
    { id: 'spoils', name: 'Espólios', emoji: '💰', xp: 100, category: 'daily', 
      subquests: [
          { id: 'spoils_1', name: 'Espólio 1', xp: 20 },
          { id: 'spoils_2', name: 'Espólio 2', xp: 20 },
          { id: 'spoils_3', name: 'Espólio 3', xp: 20 },
          { id: 'spoils_4', name: 'Espólio 4', xp: 20 },
          { id: 'spoils_5', name: 'Espólio 5', xp: 20 }
      ]
    },
    { id: 'expedition', name: 'Expedição', emoji: '🗺️', xp: 150, category: 'daily' },
    { id: 'infernal', name: 'Infernal', emoji: '🔥', xp: 200, category: 'weekly' },
    { id: 'mirage', name: 'Miragem', emoji: '🌫️', xp: 180, category: 'special' },
    { id: 'ares', name: 'Ares', emoji: '⚔️', xp: 250, category: 'weekly' },
    { id: 'events', name: 'Eventos', emoji: '🎉', xp: 120, category: 'special' },
    { id: 'ketra', name: 'Ketra', emoji: '🏰', xp: 300, category: 'weekly' },
    { id: 'colosseum', name: 'Coliseu', emoji: '🏛️', xp: 220, category: 'pvp' },
    { id: 'castle', name: 'Castelo', emoji: '👑', xp: 400, category: 'guild' },
    { id: 'guildwar', name: 'Guerra de Guild', emoji: '⚡', xp: 350, category: 'guild' }
];

// Inicializar aplicação
function initializeApp() {
    loadData();
    updateUI();
    updateTimeToReset();
    
    // Verificar se precisa resetar as quests
    const lastResetDate = data.lastResetDate || '';
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
        resetDailyQuests();
    }
    
    // Atualizar timer a cada minuto
    setInterval(updateTimeToReset, 60000);
    
    // Configurar tema
    applyTheme();
    
    // Inicializar notificações
    initializeNotifications();
}

// Carregar dados salvos
function loadData() {
    const saved = localStorage.getItem('wydQuestData');
    if (saved) {
        const savedData = JSON.parse(saved);
        Object.assign(data, savedData);
    }
    
    // Inicializar quests se não existirem
    questsData.forEach(quest => {
        if (!data.quests[quest.id]) {
            data.quests[quest.id] = false;
        }
        
        if (quest.subquests) {
            quest.subquests.forEach(subquest => {
                if (!data.subquests[subquest.id]) {
                    data.subquests[subquest.id] = false;
                }
            });
        }
    });
}

// Salvar dados
function saveData() {
    data.lastSync = new Date().toISOString();
    localStorage.setItem('wydQuestData', JSON.stringify(data));
    console.log('💾 Dados salvos localmente');
    
    // Sincronizar com nuvem se usuário estiver logado
    if (window.supabaseSync) {
        supabaseSync.autoSync();
    }
}

// Verificar reset diário
function checkDailyReset() {
    const now = new Date();
    const today = now.toDateString();
    
    if (data.lastCompletedDate !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (data.lastCompletedDate === yesterday.toDateString()) {
            data.streak++;
        } else if (data.lastCompletedDate !== null) {
            data.streak = 0;
        }
    }
}

// Resetar quests diárias
function resetDailyQuests() {
    const today = new Date().toDateString();
    
    questsData.forEach(quest => {
        if (quest.category === 'daily') {
            data.quests[quest.id] = false;
            
            if (quest.subquests) {
                quest.subquests.forEach(subquest => {
                    data.subquests[subquest.id] = false;
                });
            }
        }
    });
    
    data.lastResetDate = today;
    data.notifiedQuests = {};
    saveData();
    updateUI();
    showAchievement('🌅 Quests diárias resetadas!');
}

// Alternar conclusão de quest
function toggleQuest(questId) {
    const quest = questsData.find(q => q.id === questId);
    if (!quest) return;
    
    data.quests[questId] = !data.quests[questId];
    
    if (data.quests[questId]) {
        // Quest completada
        data.totalXP += quest.xp;
        
        // Calcular nível baseado no XP
        data.level = Math.floor(data.totalXP / 1000) + 1;
        
        checkDailyReset();
        const today = new Date().toDateString();
        data.lastCompletedDate = today;
        
        showAchievement(`✅ ${quest.name} completada! +${quest.xp} XP`);
        
        // Efeito sonoro
        playCompletionSound();
        
        // Efeito visual
        addCelebrationEffect(questId);
    } else {
        // Quest desmarcada
        data.totalXP = Math.max(0, data.totalXP - quest.xp);
        data.level = Math.floor(data.totalXP / 1000) + 1;
        showAchievement(`↩️ ${quest.name} desmarcada! -${quest.xp} XP`);
    }
    
    updateUI();
    saveData();
}

// Alternar subquest
function toggleSubquest(subquestId) {
    const parentQuest = questsData.find(quest => 
        quest.subquests && quest.subquests.some(sub => sub.id === subquestId)
    );
    
    if (!parentQuest) return;
    
    const subquest = parentQuest.subquests.find(sub => sub.id === subquestId);
    data.subquests[subquestId] = !data.subquests[subquestId];
    
    if (data.subquests[subquestId]) {
        data.totalXP += subquest.xp;
        data.level = Math.floor(data.totalXP / 1000) + 1;
        showAchievement(`✅ ${subquest.name} completada! +${subquest.xp} XP`);
        playCompletionSound();
    } else {
        data.totalXP = Math.max(0, data.totalXP - subquest.xp);
        data.level = Math.floor(data.totalXP / 1000) + 1;
        showAchievement(`↩️ ${subquest.name} desmarcada! -${subquest.xp} XP`);
    }
    
    // Verificar se todas as subquests estão completas
    const allSubquestsComplete = parentQuest.subquests.every(sub => data.subquests[sub.id]);
    if (allSubquestsComplete && !data.quests[parentQuest.id]) {
        toggleQuest(parentQuest.id);
        return; // toggleQuest já chama updateUI e saveData
    }
    
    updateUI();
    saveData();
}

// Atualizar interface
function updateUI() {
    updateStats();
    updateQuestList();
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('level').textContent = data.level;
    document.getElementById('xp').textContent = data.totalXP;
    document.getElementById('streak').textContent = data.streak;
    
    // Calcular XP até próximo nível
    const currentLevelXP = (data.level - 1) * 1000;
    const nextLevelXP = data.level * 1000;
    const progressXP = data.totalXP - currentLevelXP;
    const neededXP = nextLevelXP - data.totalXP;
    
    document.getElementById('nextLevel').textContent = neededXP;
    
    // Barra de progresso
    const progressPercent = (progressXP / 1000) * 100;
    document.getElementById('progressBar').style.width = progressPercent + '%';
}

// Atualizar lista de quests
function updateQuestList() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';
    
    questsData.forEach(quest => {
        const questElement = createQuestElement(quest);
        questList.appendChild(questElement);
    });
}

// Criar elemento de quest
function createQuestElement(quest) {
    const questDiv = document.createElement('div');
    questDiv.className = 'quest-item';
    questDiv.id = `quest-${quest.id}`;
    
    const isCompleted = data.quests[quest.id];
    if (isCompleted) {
        questDiv.classList.add('completed');
    }
    
    let subquestHTML = '';
    if (quest.subquests) {
        const completedSubs = quest.subquests.filter(sub => data.subquests[sub.id]).length;
        const totalSubs = quest.subquests.length;
        
        subquestHTML = `
            <div class="subquest-progress">
                <span class="subquest-counter">${completedSubs}/${totalSubs}</span>
                <div class="subquest-bar">
                    <div class="subquest-fill" style="width: ${(completedSubs/totalSubs)*100}%"></div>
                </div>
            </div>
            <div class="subquest-list">
                ${quest.subquests.map(subquest => `
                    <div class="subquest-item ${data.subquests[subquest.id] ? 'completed' : ''}" 
                         onclick="toggleSubquest('${subquest.id}')">
                        <span class="checkbox">${data.subquests[subquest.id] ? '✅' : '⬜'}</span>
                        <span>${subquest.name}</span>
                        <span class="xp">+${subquest.xp} XP</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    questDiv.innerHTML = `
        <div class="quest-header" onclick="toggleQuest('${quest.id}')">
            <div class="quest-info">
                <span class="quest-emoji">${quest.emoji}</span>
                <span class="quest-name">${quest.name}</span>
                <span class="quest-category ${quest.category}">${getCategoryName(quest.category)}</span>
            </div>
            <div class="quest-reward">
                <span class="xp">+${quest.xp} XP</span>
                <span class="checkbox">${isCompleted ? '✅' : '⬜'}</span>
            </div>
        </div>
        ${subquestHTML}
    `;
    
    return questDiv;
}

// Obter nome da categoria
function getCategoryName(category) {
    const names = {
        'daily': 'Diária',
        'weekly': 'Semanal',
        'special': 'Especial',
        'pvp': 'PvP',
        'guild': 'Guild'
    };
    return names[category] || category;
}

// Alternar tema
function toggleTheme() {
    data.theme = data.theme === 'default' ? 'dark' : 'default';
    applyTheme();
    saveData();
}

// Aplicar tema
function applyTheme() {
    if (data.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Atualizar tempo para reset
function updateTimeToReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('timeToReset').textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Sistema de notificações
function initializeNotifications() {
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Configurar verificação de horários
    setInterval(checkQuestSchedule, 60000); // Verificar a cada minuto
}

// Verificar horários das quests
function checkQuestSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    questSchedule.forEach(quest => {
        const questKey = `${quest.id}_${now.toDateString()}`;
        
        if (currentHour === quest.hour && currentMinute === quest.minute) {
            if (!data.notifiedQuests[questKey]) {
                showQuestNotification(quest);
                data.notifiedQuests[questKey] = true;
                saveData();
            }
        }
    });
}

// Mostrar notificação de quest
function showQuestNotification(quest) {
    const message = `🎮 ${quest.name} está disponível agora!`;
    
    // Notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WYD Quest Tracker', {
            body: message,
            icon: 'icon-192x192.png',
            badge: 'icon-192x192.png'
        });
    }
    
    // Notificação visual no app
    showAchievement(message);
    
    // Som de notificação
    playNotificationSound();
}

// Reproduzir som de conclusão
function playCompletionSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Áudio não disponível:', e);
    }
}

// Reproduzir som de notificação
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    } catch (e) {
        console.log('Áudio não disponível:', e);
    }
}

// Mostrar conquista/achievement
function showAchievement(message) {
    // Remover achievement anterior se existir
    const existing = document.querySelector('.achievement');
    if (existing) {
        existing.remove();
    }
    
    const achievement = document.createElement('div');
    achievement.className = 'achievement';
    achievement.textContent = message;
    
    document.body.appendChild(achievement);
    
    // Mostrar com animação
    setTimeout(() => achievement.classList.add('show'), 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        achievement.classList.remove('show');
        setTimeout(() => achievement.remove(), 300);
    }, 3000);
}

// Adicionar efeito de celebração
function addCelebrationEffect(questId) {
    const questElement = document.getElementById(`quest-${questId}`);
    if (questElement) {
        questElement.classList.add('celebration');
        setTimeout(() => {
            questElement.classList.remove('celebration');
        }, 500);
    }
}

// Teste de notificação
function testNotification() {
    showQuestNotification({
        id: 'test',
        name: 'Teste de Notificação',
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
    });
}

// Inicialização do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Inicializar Supabase após um delay para garantir que tudo carregou
    setTimeout(() => {
        if (window.supabaseSync) {
            supabaseSync.init();
        }
    }, 1000);
});