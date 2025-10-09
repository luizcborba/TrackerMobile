// Google Auth - Versão Robusta com Fallbacks
class CloudSync {
    constructor() {
        this.isSignedIn = false;
        this.user = null;
        this.auth = null;
        this.syncInterval = null;
        this.clientId = '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com';
        
        // Auto-detectar ambiente
        this.isHTTPS = window.location.protocol === 'https:';
        this.isGitHubPages = window.location.hostname === 'luizcborba.github.io';
        this.isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // Google Auth em HTTPS ou localhost
        this.shouldUseGoogleAuth = this.isHTTPS || this.isLocalhost;
        this.initAttempted = false;
        this.fallbackMode = false;
    }

    async initGoogleAuth() {
        console.log('🔍 Detectando ambiente...');
        console.log('Protocol:', window.location.protocol);
        console.log('Hostname:', window.location.hostname);
        console.log('HTTPS:', this.isHTTPS);
        console.log('GitHub Pages:', this.isGitHubPages);
        console.log('Localhost:', this.isLocalhost);
        console.log('Deve usar Google Auth:', this.shouldUseGoogleAuth);

        if (this.shouldUseGoogleAuth) {
            console.log('✅ Ambiente compatível - Tentando Google Auth');
            await this.tryGoogleAuth();
        } else {
            console.log('ℹ️ Ambiente HTTP - Modo offline');
            this.initOfflineMode();
        }
    }

    async tryGoogleAuth() {
        if (this.initAttempted) return;
        this.initAttempted = true;

        try {
            console.log('📡 Carregando Google API...');
            await this.loadGoogleAPI();
            
            console.log('🔧 Inicializando Google Auth...');
            await this.initRealGoogleAuth();
            
        } catch (error) {
            console.log('❌ Google Auth falhou:', error);
            
            if (error.error === 'idpiframe_initialization_failed') {
                console.log('🔄 Erro de iframe - tentando modo alternativo...');
                await this.tryAlternativeAuth();
            } else {
                console.log('🔌 Fallback para modo offline');
                this.initOfflineMode();
            }
        }
    }

    async tryAlternativeAuth() {
        try {
            console.log('🔄 Tentando inicialização alternativa...');
            
            // Método alternativo com configurações diferentes
            await new Promise((resolve, reject) => {
                gapi.load('auth2', async () => {
                    try {
                        // Configuração alternativa para contornar problemas de iframe
                        this.auth = await gapi.auth2.init({
                            client_id: this.clientId,
                            scope: 'profile email',
                            fetch_basic_profile: true,
                            ux_mode: 'redirect', // Usar redirect ao invés de popup
                            redirect_uri: window.location.origin + window.location.pathname
                        });
                        
                        this.auth.isSignedIn.listen(this.onSignInChange.bind(this));
                        this.updateSignInStatus();
                        this.updateUI();
                        
                        console.log('✅ Autenticação alternativa funcionou!');
                        resolve();
                    } catch (altError) {
                        console.log('❌ Método alternativo também falhou:', altError);
                        reject(altError);
                    }
                });
            });
            
        } catch (error) {
            console.log('🔌 Todos os métodos falharam - modo offline');
            this.initOfflineMode();
        }
    }

    async initRealGoogleAuth() {
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
                    
                    console.log('✅ Google Auth inicializado');
                    resolve();
                } catch (error) {
                    console.error('❌ Erro ao inicializar Google Auth:', error);
                    reject(error);
                }
            });
        });
    }

    initOfflineMode() {
        console.log('🔌 Iniciando modo offline');
        this.fallbackMode = true;
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
            script.onerror = () => {
                console.log('❌ Falha ao carregar Google API');
                reject(new Error('Falha ao carregar Google API'));
            };
            document.head.appendChild(script);
        });
    }

    onSignInChange(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            this.user = this.auth.currentUser.get();
            this.startSync();
            showAchievement('✅ Login Google realizado! Dados sincronizados.');
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
        if (this.fallbackMode || !this.auth) {
            // Modo offline ou auth não disponível
            if (this.shouldUseGoogleAuth) {
                showAchievement('⚠️ Google Auth não disponível. Verifique cookies de terceiros.');
            } else {
                showAchievement('ℹ️ Modo offline. Acesse via HTTPS para Google Auth.');
            }
            return;
        }

        try {
            console.log('🔐 Tentando login...');
            await this.auth.signIn();
        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            let message = '❌ Erro no login: ';
            
            if (error.error === 'popup_blocked_by_browser') {
                message += 'Popup bloqueado. Permita popups.';
            } else if (error.error === 'access_denied') {
                message += 'Acesso negado.';
            } else if (error.error === 'redirect_uri_mismatch') {
                message += 'Erro de configuração de URL.';
            } else if (error.error === 'idpiframe_initialization_failed') {
                message += 'Problema com cookies. Tente permitir cookies de terceiros.';
            } else {
                message += (error.details || error.message || 'Erro desconhecido');
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

            const cloudKey = `cloud_${this.user.getId()}`;
            localStorage.setItem(cloudKey, JSON.stringify(userData));
            
            console.log('☁️ Dados sincronizados');
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
            if (this.auth && !this.fallbackMode) {
                // Google Auth disponível
                loginBtn.textContent = '🔐 Login Google';
                loginBtn.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';
            } else if (this.shouldUseGoogleAuth && !this.initAttempted) {
                // Ainda carregando
                loginBtn.textContent = '⏳ Carregando...';
                loginBtn.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            } else if (this.fallbackMode) {
                // Fallback por problemas técnicos
                loginBtn.textContent = '⚠️ Offline (Cookies?)';
                loginBtn.style.background = 'linear-gradient(135deg, #e67e22, #d35400)';
            } else {
                // Modo offline normal
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