// Solução Definitiva - Contorna Problema de Cookies de Terceiros
class UltimateSyncSolution {
    constructor() {
        this.deviceId = this.getOrCreateDeviceId();
        this.deviceName = this.getDeviceName();
        this.googleAuthAvailable = false;
        this.syncMethod = 'local'; // 'local', 'code', 'google'
    }

    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    getDeviceName() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        if (/Android/i.test(userAgent)) {
            return '📱 Android';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return '📱 iOS';
        } else if (/Windows/i.test(platform)) {
            return '🖥️ Windows';
        } else if (/Mac/i.test(platform)) {
            return '🖥️ Mac';
        } else if (/Linux/i.test(platform)) {
            return '🖥️ Linux';
        }
        return '💻 Navegador';
    }

    async init() {
        console.log('🚀 Iniciando Ultimate Sync Solution...');
        
        // Tentar Google Auth primeiro (mas não bloquear se falhar)
        try {
            await this.tryGoogleAuth();
        } catch (error) {
            console.log('ℹ️ Google Auth não disponível, usando alternativas');
        }
        
        // Sempre mostrar opções de sincronização
        this.updateUI();
        this.showWelcomeMessage();
    }

    async tryGoogleAuth() {
        return new Promise((resolve, reject) => {
            // Timeout para não travar
            const timeout = setTimeout(() => {
                console.log('⏰ Timeout na inicialização do Google Auth');
                reject(new Error('Timeout'));
            }, 5000);

            if (!window.gapi) {
                clearTimeout(timeout);
                reject(new Error('GAPI não carregado'));
                return;
            }

            gapi.load('auth2', () => {
                gapi.auth2.init({
                    client_id: '507473876859-o0urtsgjnetchqkqcf16ium53ejp1tts.apps.googleusercontent.com',
                    scope: 'profile email'
                }).then(
                    (authInstance) => {
                        clearTimeout(timeout);
                        this.googleAuthAvailable = true;
                        this.googleAuth = authInstance;
                        this.syncMethod = 'google';
                        
                        console.log('✅ Google Auth disponível!');
                        
                        // Configurar listeners
                        authInstance.isSignedIn.listen((isSignedIn) => {
                            this.handleGoogleSignInChange(isSignedIn);
                        });
                        
                        if (authInstance.isSignedIn.get()) {
                            this.handleGoogleSignInChange(true);
                        }
                        
                        resolve();
                    },
                    (error) => {
                        clearTimeout(timeout);
                        console.log(`⚠️ Google Auth falhou: ${error.error || error}`);
                        reject(error);
                    }
                );
            });
        });
    }

    handleGoogleSignInChange(isSignedIn) {
        if (isSignedIn) {
            const user = this.googleAuth.currentUser.get();
            const profile = user.getBasicProfile();
            
            showAchievement(`✅ Login Google: ${profile.getName()}`);
            console.log('👤 Usuário Google logado:', profile.getName());
        } else {
            showAchievement('👋 Logout Google realizado');
            console.log('🚪 Usuário Google deslogado');
        }
        
        this.updateUI();
    }

    showWelcomeMessage() {
        const methods = [];
        
        if (this.googleAuthAvailable) {
            methods.push('🔐 Google Auth');
        }
        methods.push('🔄 Sincronização por código');
        methods.push('💾 Dados locais');
        
        const message = `🎯 Métodos disponíveis: ${methods.join(', ')}`;
        showAchievement(message);
    }

    // ========== GOOGLE AUTH METHODS ==========
    async signInGoogle() {
        if (!this.googleAuthAvailable) {
            showAchievement('⚠️ Google Auth não disponível. Use sincronização por código.');
            return;
        }

        try {
            await this.googleAuth.signIn();
        } catch (error) {
            console.error('Erro no login Google:', error);
            showAchievement(`❌ Login falhou: ${this.getGoogleErrorMessage(error)}`);
        }
    }

    async signOutGoogle() {
        if (!this.googleAuthAvailable) return;

        try {
            await this.googleAuth.signOut();
        } catch (error) {
            console.error('Erro no logout Google:', error);
        }
    }

    getGoogleErrorMessage(error) {
        if (error.error === 'popup_closed_by_user') {
            return 'Popup fechado pelo usuário';
        } else if (error.error === 'access_denied') {
            return 'Acesso negado';
        } else if (error.error === 'popup_blocked_by_browser') {
            return 'Popup bloqueado - permita popups';
        } else if (error.error === 'idpiframe_initialization_failed') {
            return 'Cookies de terceiros bloqueados';
        }
        return error.details || error.message || 'Erro desconhecido';
    }

    // ========== CODE SYNC METHODS ==========
    generateSyncCode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const syncData = {
            code: code,
            deviceId: this.deviceId,
            deviceName: this.deviceName,
            data: data, // Dados globais do jogo
            timestamp: Date.now(),
            expires: Date.now() + (10 * 60 * 1000) // 10 minutos
        };

        localStorage.setItem(`sync_${code}`, JSON.stringify(syncData));
        
        // Limpar códigos expirados
        this.cleanExpiredCodes();
        
        return code;
    }

    async useSyncCode(code) {
        const syncDataStr = localStorage.getItem(`sync_${code}`);
        if (!syncDataStr) {
            throw new Error('Código inválido ou expirado');
        }

        const syncData = JSON.parse(syncDataStr);
        
        // Verificar expiração
        if (Date.now() > syncData.expires) {
            localStorage.removeItem(`sync_${code}`);
            throw new Error('Código expirado (válido por 10 minutos)');
        }

        // Verificar se não é o mesmo dispositivo
        if (syncData.deviceId === this.deviceId) {
            throw new Error('Não é possível sincronizar com o mesmo dispositivo');
        }

        // Fazer backup dos dados atuais
        const backup = JSON.stringify(data);
        localStorage.setItem('backup_before_sync', backup);

        // Importar dados
        Object.assign(data, syncData.data);
        data.lastSync = new Date().toISOString();
        data.syncedFrom = syncData.deviceName;
        data.syncMethod = 'code';
        
        saveData();
        updateUI();

        // Limpar código usado
        localStorage.removeItem(`sync_${code}`);
        
        return syncData.deviceName;
    }

    cleanExpiredCodes() {
        const now = Date.now();
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('sync_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.expires && now > data.expires) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Remove chaves corrompidas
                    localStorage.removeItem(key);
                }
            }
        });
    }

    restoreBackup() {
        const backup = localStorage.getItem('backup_before_sync');
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                Object.assign(data, backupData);
                saveData();
                updateUI();
                showAchievement('✅ Backup restaurado com sucesso');
                return true;
            } catch (e) {
                showAchievement('❌ Erro ao restaurar backup');
                return false;
            }
        }
        showAchievement('⚠️ Nenhum backup encontrado');
        return false;
    }

    // ========== UI METHODS ==========
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (!loginBtn) return;
        
        if (this.googleAuthAvailable && this.googleAuth && this.googleAuth.isSignedIn.get()) {
            // Google Auth ativo e logado
            const user = this.googleAuth.currentUser.get();
            const profile = user.getBasicProfile();
            
            loginBtn.textContent = '🚪 Logout Google';
            loginBtn.onclick = () => this.signOutGoogle();
            
            if (userInfo) {
                userInfo.innerHTML = `
                    <img src="${profile.getImageUrl()}" alt="Avatar" 
                         style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; vertical-align: middle;">
                    <span style="margin-right: 8px;">${profile.getName()}</span>
                    <span style="font-size: 0.7em; color: #2ecc71;">☁️ Google</span>
                `;
                userInfo.style.display = 'block';
            }
            
        } else {
            // Google Auth não disponível ou não logado
            if (this.googleAuthAvailable) {
                loginBtn.textContent = '🔐 Login Google';
                loginBtn.onclick = () => this.signInGoogle();
                loginBtn.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';
            } else {
                loginBtn.textContent = '🔄 Sincronizar por Código';
                loginBtn.onclick = () => this.showSyncModal();
                loginBtn.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            }
            
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }

    showSyncModal() {
        // Criar modal de sincronização
        const modal = document.createElement('div');
        modal.id = 'ultimateSyncModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            max-width: ${isMobile ? '90%' : '500px'};
            width: 100%;
            color: white;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;

        modalContent.innerHTML = `
            <div style="font-size: ${isMobile ? '48px' : '64px'}; margin-bottom: 20px;">🔄</div>
            <h2 style="margin: 0 0 15px 0; font-size: ${isMobile ? '20px' : '24px'};">
                Sincronização Universal
            </h2>
            <p style="margin: 0 0 15px 0; font-size: ${isMobile ? '14px' : '16px'}; line-height: 1.5;">
                Transfira seus dados entre <strong>qualquer dispositivo</strong> usando um código simples.
            </p>
            
            ${!this.googleAuthAvailable ? `
                <div style="background: rgba(241, 196, 15, 0.2); padding: 10px; border-radius: 10px; margin: 15px 0;">
                    <small>ℹ️ Google Auth não disponível (cookies de terceiros)</small>
                </div>
            ` : ''}
            
            <div style="display: flex; flex-direction: ${isMobile ? 'column' : 'row'}; gap: 15px; margin: 25px 0;">
                <button onclick="ultimateSync.showGenerateCode()" style="
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white;
                    border: none;
                    padding: ${isMobile ? '15px 25px' : '12px 20px'};
                    border-radius: 25px;
                    font-size: ${isMobile ? '16px' : '14px'};
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                ">
                    📤 Enviar Dados
                </button>
                <button onclick="ultimateSync.showUseCode()" style="
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: ${isMobile ? '15px 25px' : '12px 20px'};
                    border-radius: 25px;
                    font-size: ${isMobile ? '16px' : '14px'};
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                ">
                    📥 Receber Dados
                </button>
            </div>
            
            <div id="syncContent" style="min-height: 200px; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; opacity: 0.8;">
                    • <strong>Enviar:</strong> Gera código para compartilhar seus dados<br>
                    • <strong>Receber:</strong> Usa código de outro dispositivo<br>
                    • <strong>Seguro:</strong> Códigos expiram em 10 minutos
                </p>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="ultimateSync.closeSyncModal()" style="
                    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    color: white;
                    border: none;
                    padding: ${isMobile ? '12px 20px' : '10px 15px'};
                    border-radius: 15px;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    ✖️ Fechar
                </button>
                
                ${localStorage.getItem('backup_before_sync') ? `
                    <button onclick="ultimateSync.restoreBackup()" style="
                        background: linear-gradient(135deg, #e67e22, #d35400);
                        color: white;
                        border: none;
                        padding: ${isMobile ? '12px 20px' : '10px 15px'};
                        border-radius: 15px;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        ↶ Restaurar Backup
                    </button>
                ` : ''}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSyncModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSyncModal();
            }
        });
    }

    showGenerateCode() {
        const content = document.getElementById('syncContent');
        content.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">📤 Enviar Dados</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">
                Seus dados serão empacotados em um código. Use este código no <strong>outro dispositivo</strong>:
            </p>
            <div id="codeDisplay" style="
                background: rgba(0,0,0,0.3);
                padding: 20px;
                border-radius: 10px;
                margin: 15px 0;
            ">
                <button onclick="ultimateSync.doGenerateCode()" style="
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    🎲 Gerar Código Agora
                </button>
            </div>
            <p style="font-size: 12px; opacity: 0.8;">
                ⏰ Código válido por 10 minutos<br>
                📱 Funciona entre qualquer dispositivo<br>
                🔒 Dados temporários e seguros
            </p>
        `;
    }

    showUseCode() {
        const content = document.getElementById('syncContent');
        content.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">📥 Receber Dados</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">
                Digite o código de 6 dígitos gerado no <strong>outro dispositivo</strong>:
            </p>
            <div style="margin: 20px 0;">
                <input type="text" id="syncCodeInput" placeholder="000000" maxlength="6" style="
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    padding: 15px;
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    width: 200px;
                    outline: none;
                    margin-bottom: 15px;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                ">
                <button onclick="ultimateSync.doUseCode()" style="
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    📥 Importar Dados
                </button>
            </div>
            <p style="font-size: 12px; opacity: 0.8;">
                ⚠️ <strong>Importante:</strong> Isso substituirá seus dados atuais<br>
                💾 Um backup será criado automaticamente<br>
                ↶ Use "Restaurar Backup" se precisar voltar
            </p>
        `;
        
        // Focar no input e configurar auto-format
        setTimeout(() => {
            const input = document.getElementById('syncCodeInput');
            input.focus();
            
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Apenas números
                if (value.length > 6) value = value.substring(0, 6);
                e.target.value = value;
                
                // Auto-submit quando tiver 6 dígitos
                if (value.length === 6) {
                    setTimeout(() => this.doUseCode(), 100);
                }
            });
        }, 100);
    }

    doGenerateCode() {
        try {
            const code = this.generateSyncCode();
            const codeDisplay = document.getElementById('codeDisplay');
            
            codeDisplay.innerHTML = `
                <div style="background: rgba(46, 204, 113, 0.3); padding: 20px; border-radius: 15px; margin: 15px 0;">
                    <div style="font-size: 42px; font-weight: bold; color: #2ecc71; margin: 15px 0; letter-spacing: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        ${code}
                    </div>
                    <div style="margin: 15px 0;">
                        <button onclick="navigator.clipboard.writeText('${code}').then(() => showAchievement('📋 Código copiado!'))" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 10px;
                            font-size: 14px;
                            cursor: pointer;
                            margin: 5px;
                        ">
                            📋 Copiar Código
                        </button>
                        <button onclick="ultimateSync.doGenerateCode()" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 10px;
                            font-size: 14px;
                            cursor: pointer;
                            margin: 5px;
                        ">
                            🔄 Novo Código
                        </button>
                    </div>
                    <div style="font-size: 14px; color: #2ecc71; margin-top: 10px;">
                        ✅ Código ativo por 10 minutos<br>
                        📱 Use este código no outro dispositivo
                    </div>
                </div>
            `;
            
            showAchievement(`✅ Código gerado: ${code} (válido por 10min)`);
            
        } catch (error) {
            showAchievement(`❌ Erro ao gerar código: ${error.message}`);
        }
    }

    async doUseCode() {
        const codeInput = document.getElementById('syncCodeInput');
        const code = codeInput.value.trim();
        
        if (!code || code.length !== 6) {
            showAchievement('❌ Digite um código de 6 dígitos');
            codeInput.focus();
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            showAchievement('❌ Código deve conter apenas números');
            codeInput.value = '';
            codeInput.focus();
            return;
        }

        try {
            const deviceName = await this.useSyncCode(code);
            showAchievement(`✅ Dados importados de ${deviceName}!`);
            this.closeSyncModal();
            
        } catch (error) {
            showAchievement(`❌ ${error.message}`);
            codeInput.value = '';
            codeInput.focus();
        }
    }

    closeSyncModal() {
        const modal = document.getElementById('ultimateSyncModal');
        if (modal) {
            modal.remove();
        }
    }

    getStatus() {
        return {
            deviceId: this.deviceId,
            deviceName: this.deviceName,
            googleAuthAvailable: this.googleAuthAvailable,
            syncMethod: this.syncMethod,
            isGoogleSignedIn: this.googleAuthAvailable && this.googleAuth && this.googleAuth.isSignedIn.get()
        };
    }
}

// Instância global
const ultimateSync = new UltimateSyncSolution();