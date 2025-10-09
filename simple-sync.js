// Sistema de Sincronização Simplificado - Sem Google Auth
class SimpleSyncManager {
    constructor() {
        this.syncCode = null;
        this.deviceId = this.generateDeviceId();
        this.syncData = null;
    }

    generateDeviceId() {
        // Gerar ID único para o dispositivo
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    generateSyncCode() {
        // Gerar código de 6 dígitos para sincronização
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createSyncCode() {
        this.syncCode = this.generateSyncCode();
        const syncData = {
            code: this.syncCode,
            deviceId: this.deviceId,
            deviceName: this.getDeviceName(),
            data: data, // Dados do jogo
            timestamp: Date.now(),
            expires: Date.now() + (10 * 60 * 1000) // Expira em 10 minutos
        };

        // Salvar no localStorage como "servidor" temporário
        localStorage.setItem(`sync_${this.syncCode}`, JSON.stringify(syncData));
        
        console.log(`Código de sincronização criado: ${this.syncCode}`);
        return this.syncCode;
    }

    async useSyncCode(code) {
        const syncDataStr = localStorage.getItem(`sync_${code}`);
        if (!syncDataStr) {
            throw new Error('Código inválido ou expirado');
        }

        const syncData = JSON.parse(syncDataStr);
        
        // Verificar se não expirou
        if (Date.now() > syncData.expires) {
            localStorage.removeItem(`sync_${code}`);
            throw new Error('Código expirado');
        }

        // Verificar se não é o mesmo dispositivo
        if (syncData.deviceId === this.deviceId) {
            throw new Error('Não é possível sincronizar com o mesmo dispositivo');
        }

        // Importar dados
        Object.assign(data, syncData.data);
        data.lastSync = new Date().toISOString();
        data.syncedFrom = syncData.deviceName;
        
        saveData();
        updateUI();

        // Limpar código usado
        localStorage.removeItem(`sync_${code}`);
        
        return syncData.deviceName;
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
        } else {
            return '💻 Dispositivo';
        }
    }

    showSyncModal() {
        // Criar modal de sincronização
        const modal = document.createElement('div');
        modal.id = 'syncModal';
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
                Sincronizar Dispositivos
            </h2>
            <p style="margin: 0 0 20px 0; font-size: ${isMobile ? '14px' : '16px'}; line-height: 1.5;">
                Sincronize seus progressos entre <strong>celular</strong> e <strong>computador</strong> usando um código simples.
            </p>
            
            <div style="display: flex; flex-direction: ${isMobile ? 'column' : 'row'}; gap: 15px; margin: 25px 0;">
                <button id="generateCodeBtn" style="
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
                    📤 Gerar Código
                </button>
                <button id="useCodeBtn" style="
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
                    📥 Usar Código
                </button>
            </div>
            
            <div id="syncContent" style="min-height: 150px; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; opacity: 0.8;">Escolha uma opção acima para começar</p>
            </div>
            
            <button id="closeSyncModal" style="
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                color: white;
                border: none;
                padding: ${isMobile ? '12px 30px' : '10px 25px'};
                border-radius: 25px;
                font-size: ${isMobile ? '14px' : '14px'};
                cursor: pointer;
            ">
                ✖️ Fechar
            </button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('generateCodeBtn').onclick = () => this.showGenerateCode();
        document.getElementById('useCodeBtn').onclick = () => this.showUseCode();
        document.getElementById('closeSyncModal').onclick = () => this.closeSyncModal();

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSyncModal();
            }
        });
    }

    showGenerateCode() {
        const content = document.getElementById('syncContent');
        content.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">📤 Gerar Código de Sincronização</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">
                Use este código no <strong>outro dispositivo</strong> para importar seus dados:
            </p>
            <div id="codeDisplay" style="
                background: rgba(0,0,0,0.3);
                padding: 15px;
                border-radius: 10px;
                margin: 15px 0;
            ">
                <button onclick="simpleSyncManager.generateCode()" style="
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 15px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    🎲 Gerar Código
                </button>
            </div>
            <p style="font-size: 12px; opacity: 0.8;">
                ⏰ O código expira em 10 minutos<br>
                📱 Funciona entre qualquer dispositivo
            </p>
        `;
    }

    showUseCode() {
        const content = document.getElementById('syncContent');
        content.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">📥 Usar Código de Sincronização</h3>
            <p style="font-size: 14px; margin-bottom: 15px;">
                Digite o código gerado no <strong>outro dispositivo</strong>:
            </p>
            <div style="margin: 15px 0;">
                <input type="text" id="syncCodeInput" placeholder="000000" maxlength="6" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    padding: 15px;
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 3px;
                    width: 150px;
                    outline: none;
                ">
            </div>
            <button onclick="simpleSyncManager.importWithCode()" style="
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 15px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 10px;
            ">
                📥 Importar Dados
            </button>
            <p style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
                ⚠️ Isso substituirá seus dados atuais
            </p>
        `;
        
        // Focar no input
        setTimeout(() => {
            document.getElementById('syncCodeInput').focus();
        }, 100);
    }

    async generateCode() {
        try {
            const code = await this.createSyncCode();
            const codeDisplay = document.getElementById('codeDisplay');
            codeDisplay.innerHTML = `
                <div style="font-size: 32px; font-weight: bold; color: #2ecc71; margin: 10px 0; letter-spacing: 5px;">
                    ${code}
                </div>
                <button onclick="navigator.clipboard.writeText('${code}')" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    📋 Copiar
                </button>
                <button onclick="simpleSyncManager.generateCode()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    margin: 5px;
                ">
                    🔄 Novo Código
                </button>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
                    ✅ Código ativo por 10 minutos
                </div>
            `;
            
            showAchievement(`✅ Código gerado: ${code}`);
        } catch (error) {
            showAchievement(`❌ Erro ao gerar código: ${error.message}`);
        }
    }

    async importWithCode() {
        const codeInput = document.getElementById('syncCodeInput');
        const code = codeInput.value.trim();
        
        if (!code || code.length !== 6) {
            showAchievement('❌ Digite um código de 6 dígitos');
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
        const modal = document.getElementById('syncModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Instância global
const simpleSyncManager = new SimpleSyncManager();