// Google Auth e Sincronização
class CloudSync {
    constructor() {
        this.isSignedIn = false;
        this.user = null;
        this.auth = null;
        this.syncInterval = null;
        this.demoMode = false; // Google Auth configurado
        this.clientId = '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com';
    }

    async initGoogleAuth() {
        // Verificar se está em ambiente compatível
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        const isHTTPS = window.location.protocol === 'https:';
        
        if (!isLocalhost && !isHTTPS) {
            console.log('Google Auth só funciona em HTTPS ou localhost');
            this.initDemoMode();
            return;
        }

        try {
            // Carregar Google API
            await this.loadGoogleAPI();
            
            await gapi.load('auth2', () => {
                this.auth = gapi.auth2.init({
                    client_id: this.clientId,
                    scope: 'profile email',
                    // Configurações extras para compatibilidade
                    hosted_domain: null,
                    fetch_basic_profile: true,
                    ux_mode: 'popup' // Usar popup ao invés de redirect
                });
                
                this.auth.isSignedIn.listen(this.onSignInChange.bind(this));
                this.updateSignInStatus();
                this.updateUI();
            });
        } catch (error) {
            console.log('Erro ao inicializar Google Auth:', error);
            // Fallback para modo demo se houver erro
            this.demoMode = true;
            this.initDemoMode();
        }
    }

    initDemoMode() {
        // Simula interface de login para demonstração
        this.demoMode = true;
        setTimeout(() => {
            this.updateUI();
        }, 1000);
    }

    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    onSignInChange(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            this.user = this.auth.currentUser.get();
            this.startSync();
            showAchievement('✅ Login realizado! Dados sincronizados na nuvem.');
        } else {
            this.user = null;
            this.stopSync();
            showAchievement('👋 Logout realizado. Dados salvos localmente.');
        }
        this.updateUI();
    }

    updateSignInStatus() {
        if (this.auth && this.auth.isSignedIn.get()) {
            this.onSignInChange(true);
        }
    }

    async signIn() {
        if (this.demoMode) {
            // Simular login demo
            this.isSignedIn = true;
            this.user = {
                getId: () => 'demo_user_123',
                getBasicProfile: () => ({
                    getName: () => 'Usuário Demo',
                    getEmail: () => 'demo@wydtracker.com',
                    getImageUrl: () => './icon-72x72.png'
                })
            };
            this.startSync();
            showAchievement('✅ Login demo realizado! (Configure Google Auth para login real)');
            this.updateUI();
            return;
        }

        try {
            await this.auth.signIn();
        } catch (error) {
            console.log('Erro no login:', error);
            
            if (error.error === 'popup_blocked_by_browser') {
                showAchievement('❌ Popup bloqueado! Permita popups e tente novamente.');
            } else if (error.error === 'access_denied') {
                showAchievement('❌ Acesso negado. Tente novamente.');
            } else if (error.error === 'redirect_uri_mismatch') {
                showAchievement('❌ Erro de configuração. Verifique as URLs no Google Console.');
            } else {
                showAchievement('❌ Erro no login. Verifique se está em HTTPS ou localhost.');
            }
        }
    }

    async signOut() {
        if (this.demoMode) {
            this.isSignedIn = false;
            this.user = null;
            this.stopSync();
            showAchievement('👋 Logout demo realizado.');
            this.updateUI();
            return;
        }

        try {
            await this.auth.signOut();
        } catch (error) {
            console.log('Erro no logout:', error);
        }
    }

    async syncToCloud() {
        if (!this.isSignedIn) return;

        try {
            const userData = {
                userId: this.user.getId(),
                email: this.user.getBasicProfile().getEmail(),
                data: data,
                lastSync: new Date().toISOString()
            };

            // Usando localStorage como "nuvem" simulada
            const cloudKey = `cloud_${this.user.getId()}`;
            localStorage.setItem(cloudKey, JSON.stringify(userData));
            
            console.log('✅ Dados sincronizados na "nuvem" (localStorage)');
            
            // Mostrar indicador visual de sync
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
                
                // Verificar se dados da nuvem são mais recentes
                const localLastSync = data.lastSync || '1970-01-01T00:00:00.000Z';
                const cloudLastSync = userData.lastSync || '1970-01-01T00:00:00.000Z';
                
                if (new Date(cloudLastSync) > new Date(localLastSync)) {
                    // Mesclar dados da nuvem
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
        // Sincronizar imediatamente
        this.syncFromCloud();
        
        // Auto-sync a cada 5 minutos
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
        
        if (!loginBtn) return; // UI ainda não carregada
        
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
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            const isHTTPS = window.location.protocol === 'https:';
            
            if (this.demoMode || (!isLocalhost && !isHTTPS)) {
                loginBtn.textContent = '🔐 Login Demo (Local)';
            } else {
                loginBtn.textContent = '🔐 Login Google';
            }
            
            loginBtn.onclick = () => this.signIn();
            userInfo.style.display = 'none';
        }
    }
}

// Instância global
const cloudSync = new CloudSync();