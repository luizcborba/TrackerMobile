// Google Sign-In - Implementação Oficial Atualizada
class ModernGoogleAuth {
    constructor() {
        this.isSignedIn = false;
        this.user = null;
        this.clientId = '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com';
        this.initAttempted = false;
    }

    async init() {
        if (this.initAttempted) return;
        this.initAttempted = true;

        console.log('🔄 Iniciando Google Sign-In moderno...');
        
        try {
            // Carregar a biblioteca da plataforma (método oficial)
            await this.loadPlatformLibrary();
            
            // Inicializar usando método oficial
            await this.initializeGapi();
            
            console.log('✅ Google Sign-In inicializado com sucesso');
            this.updateUI();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Google Sign-In:', error);
            this.handleInitError(error);
        }
    }

    loadPlatformLibrary() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregado
            if (window.gapi) {
                resolve();
                return;
            }

            console.log('📡 Carregando Google Platform Library...');
            
            // Usar a biblioteca oficial conforme documentação
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/platform.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('✅ Platform library carregada');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Erro ao carregar platform library');
                reject(new Error('Falha ao carregar Google Platform Library'));
            };
            
            document.head.appendChild(script);
        });
    }

    initializeGapi() {
        return new Promise((resolve, reject) => {
            // Aguardar gapi estar disponível
            const checkGapi = () => {
                if (window.gapi && window.gapi.load) {
                    this.startGapiInit(resolve, reject);
                } else {
                    setTimeout(checkGapi, 100);
                }
            };
            checkGapi();
        });
    }

    startGapiInit(resolve, reject) {
        try {
            console.log('🔧 Inicializando GAPI auth2...');
            
            window.gapi.load('auth2', () => {
                // Verificar se já existe uma instância
                let authInstance = window.gapi.auth2.getAuthInstance();
                
                if (authInstance) {
                    console.log('♻️ Usando instância existente do auth2');
                    this.setupAuthInstance(authInstance);
                    resolve();
                } else {
                    console.log('🆕 Criando nova instância do auth2');
                    
                    window.gapi.auth2.init({
                        client_id: this.clientId,
                        scope: 'profile email',
                        fetch_basic_profile: true
                    }).then(
                        (authInstance) => {
                            console.log('✅ Auth2 inicializado com sucesso');
                            this.setupAuthInstance(authInstance);
                            resolve();
                        },
                        (error) => {
                            console.error('❌ Erro na inicialização do auth2:', error);
                            reject(error);
                        }
                    );
                }
            });
            
        } catch (error) {
            console.error('❌ Erro crítico no startGapiInit:', error);
            reject(error);
        }
    }

    setupAuthInstance(authInstance) {
        this.authInstance = authInstance;
        
        // Configurar listeners
        this.authInstance.isSignedIn.listen((isSignedIn) => {
            this.handleSignInChange(isSignedIn);
        });
        
        // Verificar estado atual
        if (this.authInstance.isSignedIn.get()) {
            this.handleSignInChange(true);
        }
    }

    handleSignInChange(isSignedIn) {
        console.log(`🔄 Status de login mudou: ${isSignedIn ? 'Logado' : 'Deslogado'}`);
        
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            this.user = this.authInstance.currentUser.get();
            const profile = this.user.getBasicProfile();
            console.log(`👤 Usuário logado: ${profile.getName()}`);
            showAchievement(`✅ Login realizado! Bem-vindo, ${profile.getName()}`);
        } else {
            this.user = null;
            console.log('👋 Usuário deslogado');
            showAchievement('👋 Logout realizado');
        }
        
        this.updateUI();
    }

    handleInitError(error) {
        console.error('Detalhes do erro:', error);
        
        let errorMessage = '';
        
        if (error.message && error.message.includes('idpiframe_initialization_failed')) {
            errorMessage = 'Cookies de terceiros bloqueados. Configure seu navegador.';
        } else if (error.message && error.message.includes('popup_blocked')) {
            errorMessage = 'Popup bloqueado. Permita popups para este site.';
        } else if (error.message && error.message.includes('network')) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else {
            errorMessage = 'Erro na inicialização. Tente recarregar a página.';
        }
        
        showAchievement(`⚠️ ${errorMessage}`);
        this.updateUI();
    }

    async signIn() {
        if (!this.authInstance) {
            showAchievement('⚠️ Google Sign-In não está disponível');
            return;
        }

        try {
            console.log('🔐 Tentando fazer login...');
            
            // Usar método oficial de sign-in
            const googleUser = await this.authInstance.signIn();
            
            console.log('✅ Login bem-sucedido');
            // O handleSignInChange será chamado automaticamente
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            let message = 'Erro no login: ';
            
            if (error.error === 'popup_closed_by_user') {
                message += 'Popup fechado pelo usuário';
            } else if (error.error === 'access_denied') {
                message += 'Acesso negado';
            } else if (error.error === 'popup_blocked_by_browser') {
                message += 'Popup bloqueado pelo navegador';
            } else {
                message += error.details || error.message || 'Erro desconhecido';
            }
            
            showAchievement(`❌ ${message}`);
        }
    }

    async signOut() {
        if (!this.authInstance) {
            return;
        }

        try {
            console.log('🚪 Fazendo logout...');
            await this.authInstance.signOut();
            console.log('✅ Logout realizado');
            // O handleSignInChange será chamado automaticamente
            
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            showAchievement('❌ Erro ao fazer logout');
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
            
            if (userInfo) {
                userInfo.innerHTML = `
                    <img src="${profile.getImageUrl()}" alt="Avatar" 
                         style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; vertical-align: middle;">
                    <span style="margin-right: 8px;">${profile.getName()}</span>
                    <span style="font-size: 0.7em; color: #2ecc71;">✅ Logado</span>
                `;
                userInfo.style.display = 'block';
            }
            
        } else if (this.authInstance) {
            // Google Auth disponível mas não logado
            loginBtn.textContent = '🔐 Login Google';
            loginBtn.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';
            loginBtn.onclick = () => this.signIn();
            
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            
        } else if (this.initAttempted) {
            // Falha na inicialização
            loginBtn.textContent = '⚠️ Google Auth Indisponível';
            loginBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            loginBtn.onclick = () => {
                showAchievement('ℹ️ Google Auth não pôde ser carregado. Verifique sua conexão e cookies.');
            };
            
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            
        } else {
            // Ainda carregando
            loginBtn.textContent = '⏳ Carregando Google Auth...';
            loginBtn.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            loginBtn.onclick = () => {
                showAchievement('⏳ Aguarde, carregando Google Auth...');
            };
            
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }

    // Método para verificar se está funcionando
    getStatus() {
        return {
            initiated: this.initAttempted,
            hasAuthInstance: !!this.authInstance,
            isSignedIn: this.isSignedIn,
            user: this.user ? this.user.getBasicProfile().getName() : null
        };
    }
}

// Instância global
const modernGoogleAuth = new ModernGoogleAuth();

// Auto-inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        modernGoogleAuth.init();
    });
} else {
    modernGoogleAuth.init();
}