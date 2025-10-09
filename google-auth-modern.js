// Google Identity Services (Método Alternativo - Mais Moderno)
class GoogleAuthModern {
    constructor() {
        this.isSignedIn = false;
        this.user = null;
        this.clientId = '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com';
    }

    async initGoogleAuth() {
        try {
            // Carregar Google Identity Services
            await this.loadGoogleIdentity();
            
            // Inicializar com callback
            window.google.accounts.id.initialize({
                client_id: this.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: false
            });

            this.updateUI();
        } catch (error) {
            console.log('Erro ao carregar Google Identity:', error);
            showAchievement('❌ Erro ao carregar Google Auth. Verifique conexão.');
        }
    }

    loadGoogleIdentity() {
        return new Promise((resolve, reject) => {
            if (window.google?.accounts?.id) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    handleCredentialResponse(response) {
        try {
            // Decodificar JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            this.user = {
                getId: () => payload.sub,
                getBasicProfile: () => ({
                    getName: () => payload.name,
                    getEmail: () => payload.email,
                    getImageUrl: () => payload.picture
                })
            };
            
            this.isSignedIn = true;
            this.startSync();
            showAchievement('✅ Login realizado com sucesso!');
            this.updateUI();
        } catch (error) {
            console.log('Erro ao processar login:', error);
            showAchievement('❌ Erro ao processar login.');
        }
    }

    signIn() {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        } else {
            showAchievement('❌ Google Auth não carregado. Recarregue a página.');
        }
    }

    signOut() {
        this.isSignedIn = false;
        this.user = null;
        this.stopSync();
        showAchievement('👋 Logout realizado.');
        this.updateUI();
        
        // Opcional: revogar token
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }

    // Métodos de sync iguais ao CloudSync original
    async syncToCloud() {
        if (!this.isSignedIn) return;

        try {
            const userData = {
                userId: this.user.getId(),
                email: this.user.getBasicProfile().getEmail(),
                data: data,
                lastSync: new Date().toISOString()
            };

            const cloudKey = `cloud_${this.user.getId()}`;
            localStorage.setItem(cloudKey, JSON.stringify(userData));
            
            console.log('✅ Dados sincronizados na "nuvem"');
            this.showSyncIndicator();
        } catch (error) {
            console.log('❌ Erro ao sincronizar:', error);
        }
    }

    async syncFromCloud() {
        if (!this.isSignedIn) return;

        try {
            const cloudKey = `cloud_${this.user.getId()}`;
            const cloudData = localStorage.getItem(cloudKey);
            
            if (cloudData) {
                const userData = JSON.parse(cloudData);
                
                const localLastSync = data.lastSync || '1970-01-01T00:00:00.000Z';
                const cloudLastSync = userData.lastSync || '1970-01-01T00:00:00.000Z';
                
                if (new Date(cloudLastSync) > new Date(localLastSync)) {
                    Object.assign(data, userData.data);
                    data.lastSync = cloudLastSync;
                    saveData();
                    updateUI();
                    showAchievement('📥 Dados restaurados da nuvem!');
                }
            }
        } catch (error) {
            console.log('❌ Erro ao carregar da nuvem:', error);
        }
    }

    startSync() {
        this.syncFromCloud();
        this.syncInterval = setInterval(() => {
            this.syncToCloud();
        }, 5 * 60 * 1000);
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    showSyncIndicator() {
        const syncIndicator = document.querySelector('.sync-indicator');
        if (syncIndicator) {
            syncIndicator.style.opacity = '1';
            setTimeout(() => {
                syncIndicator.style.opacity = '0.6';
            }, 1000);
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (!loginBtn) return;
        
        if (this.isSignedIn && this.user) {
            const profile = this.user.getBasicProfile();
            loginBtn.textContent = 'Logout';
            loginBtn.onclick = () => this.signOut();
            
            userInfo.innerHTML = `
                <img src="${profile.getImageUrl()}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; vertical-align: middle;">
                <span style="margin-right: 8px;">${profile.getName()}</span>
                <span class="sync-indicator" style="font-size: 0.7em; color: #2ecc71;">☁️ Sincronizado</span>
            `;
            userInfo.style.display = 'block';
        } else {
            loginBtn.textContent = '🔐 Login Google';
            loginBtn.onclick = () => this.signIn();
            userInfo.style.display = 'none';
        }
    }
}

// Para testar a versão moderna, descomente a linha abaixo:
// const cloudSync = new GoogleAuthModern();