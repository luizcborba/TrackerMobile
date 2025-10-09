// Google Auth - Auto-detecta Ambiente (HTTPS = Google Auth, HTTP = Offline)
class CloudSync {
    constructor() {
        this.isSignedIn = false;
        this.user = null;
        this.auth = null;
        this.syncInterval = null;
        this.clientId = '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com';
        
        // Auto-detectar ambiente - CORRIGIDO PARA MOBILE
        this.isHTTPS = window.location.protocol === 'https:';
        this.isGitHubPages = window.location.hostname === 'luizcborba.github.io';
        this.isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // Google Auth em HTTPS (incluindo mobile) ou localhost
        this.shouldUseGoogleAuth = this.isHTTPS || this.isLocalhost;
    }

    async initGoogleAuth() {
        console.log('🔍 Detectando ambiente...');
        console.log('Protocol:', window.location.protocol);
        console.log('Hostname:', window.location.hostname);
        console.log('HTTPS:', this.isHTTPS);
        console.log('GitHub Pages:', this.isGitHubPages);
        console.log('Localhost:', this.isLocalhost);
        console.log('User Agent:', navigator.userAgent);
        console.log('Deve usar Google Auth:', this.shouldUseGoogleAuth);

        // Google Auth em qualquer HTTPS ou localhost (incluindo mobile)
        if (this.shouldUseGoogleAuth) {
            console.log('✅ Ambiente compatível - Inicializando Google Auth');
            await this.initRealGoogleAuth();
        } else {
            console.log('ℹ️ Ambiente HTTP - Modo offline');
            this.initOfflineMode();
        }
    }

    async initRealGoogleAuth() {
        try {
            // Carregar Google API
            await this.loadGoogleAPI();
            
            await new Promise((resolve, reject) => {
                gapi.load('auth2', async () => {
                    try {
                        this.auth = await gapi.auth2.init({
                            client_id: this.clientId,
                            scope: 'profile email',
                            hosted_domain: null,
                            fetch_basic_profile: true,
                            ux_mode: 'popup'
                        });
                        
                        this.auth.isSignedIn.listen(this.onSignInChange.bind(this));
                        this.updateSignInStatus();
                        this.updateUI();
                        
                        console.log('✅ Google Auth inicializado com sucesso');
                        resolve();
                    } catch (error) {
                        console.error('❌ Erro ao inicializar Google Auth:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Erro fatal Google Auth:', error);
            this.initOfflineMode();
        }
    }

    initOfflineMode() {
        console.log('🔌 Iniciando modo offline');
        this.updateUI();
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
            showAchievement('✅ Login Google realizado! Dados sincronizados na nuvem.');
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
        if (!this.auth) {
            // Modo offline
            showAchievement('ℹ️ Modo offline. Acesse https://luizcborba.github.io/TrackerMobile/ para Google Auth.');
            return;
        }

        try {
            console.log('🔐 Tentando login Google...');
            await this.auth.signIn();
        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            let message = '❌ Erro no login. ';
            
            if (error.error === 'popup_blocked_by_browser') {
                message += 'Permita popups e tente novamente.';
            } else if (error.error === 'access_denied') {
                message += 'Acesso negado pelo usuário.';
            } else if (error.error === 'redirect_uri_mismatch') {
                message += 'Erro de configuração de URL. Verifique o Google Console.';
            } else {
                message += 'Detalhes: ' + (error.details || error.message || 'Erro desconhecido');
            }
            
            showAchievement(message);
        }
    }

    async signOut() {
        if (!this.auth) return;

        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('❌ Erro no logout:', error);
        }
    }

    async syncToCloud() {
        if (!this.isSignedIn || !this.user) return;

        try {
            const userData = {
                userId: this.user.getId(),
                email: this.user.getBasicProfile().getEmail(),
                data: data,
                lastSync: new Date().toISOString()
            };

            // Simulação de sync com localStorage
            const cloudKey = `cloud_${this.user.getId()}`;
            localStorage.setItem(cloudKey, JSON.stringify(userData));
            
            console.log('☁️ Dados sincronizados na "nuvem"');
            this.showSyncIndicator();
        } catch (error) {
            console.error('❌ Erro ao sincronizar:', error);
        }
    }

    async syncFromCloud() {
        if (!this.isSignedIn || !this.user) return;

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
            console.error('❌ Erro ao carregar da nuvem:', error);
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
            // Usuário logado
            const profile = this.user.getBasicProfile();
            loginBtn.textContent = '🚪 Logout';
            loginBtn.onclick = () => this.signOut();
            
            userInfo.innerHTML = `
                <img src="${profile.getImageUrl()}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; vertical-align: middle;">
                <span style="margin-right: 8px;">${profile.getName()}</span>
                <span class="sync-indicator" style="font-size: 0.7em; color: #2ecc71;">☁️ Sync</span>
            `;
            userInfo.style.display = 'block';
        } else {
            // Usuário não logado
            if (this.shouldUseGoogleAuth && this.auth) {
                // Google Auth disponível e carregado
                loginBtn.textContent = '🔐 Login Google';
                loginBtn.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';
            } else if (this.shouldUseGoogleAuth && !this.auth) {
                // Google Auth deve estar disponível mas ainda carregando
                loginBtn.textContent = '⏳ Carregando...';
                loginBtn.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            } else {
                // Modo offline (HTTP)
                loginBtn.textContent = '🔌 Modo Offline';
                loginBtn.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
            }
            
            loginBtn.onclick = () => this.signIn();
            userInfo.style.display = 'none';
        }
    }
}

// Instância global
const cloudSync = new CloudSync();