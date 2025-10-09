// Sistema de Solicitação de Cookies
class CookieManager {
    constructor() {
        this.cookiesAccepted = this.getCookiePreference();
        this.modalShown = false;
    }

    getCookiePreference() {
        try {
            return localStorage.getItem('cookies_accepted') === 'true';
        } catch (e) {
            return false;
        }
    }

    setCookiePreference(accepted) {
        try {
            localStorage.setItem('cookies_accepted', accepted.toString());
        } catch (e) {
            // Fallback se localStorage não funcionar
        }
    }

    needsCookiePermission() {
        // Verificar se precisa pedir permissão
        const isHTTPS = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        return (isHTTPS || isLocalhost) && !this.cookiesAccepted && !this.modalShown;
    }

    async requestCookiePermission() {
        if (!this.needsCookiePermission()) {
            return this.cookiesAccepted;
        }

        this.modalShown = true;
        return new Promise((resolve) => {
            this.showCookieModal(resolve);
        });
    }

    showCookieModal(callback) {
        // Criar modal de cookies
        const modal = document.createElement('div');
        modal.id = 'cookieModal';
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
            animation: fadeIn 0.3s ease-in-out;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            color: white;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            position: relative;
            animation: slideIn 0.3s ease-out;
        `;

        // Detectar se é mobile para ajustar interface
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        modalContent.innerHTML = `
            <div style="font-size: ${isMobile ? '48px' : '64px'}; margin-bottom: 20px;">🍪</div>
            <h2 style="margin: 0 0 15px 0; font-size: ${isMobile ? '20px' : '24px'};">
                ${isMobile ? '📱 ' : '🖥️ '}Cookies para Google Auth
            </h2>
            <p style="margin: 0 0 20px 0; font-size: ${isMobile ? '14px' : '16px'}; line-height: 1.5;">
                Para usar o <strong>login Google</strong> e <strong>sincronizar</strong> seus dados entre dispositivos, 
                precisamos ativar cookies de terceiros.
            </p>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <h3 style="margin: 0 0 10px 0; font-size: ${isMobile ? '16px' : '18px'};">✅ O que você ganha:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: ${isMobile ? '13px' : '14px'};">
                    <li>🔐 <strong>Login Google</strong> rápido e seguro</li>
                    <li>☁️ <strong>Sincronização</strong> entre dispositivos</li>
                    <li>💾 <strong>Backup automático</strong> dos seus progressos</li>
                    <li>🎯 <strong>Experiência personalizada</strong></li>
                </ul>
            </div>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <h3 style="margin: 0 0 10px 0; font-size: ${isMobile ? '16px' : '18px'};">ℹ️ Sem cookies:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: ${isMobile ? '13px' : '14px'};">
                    <li>🔌 <strong>Modo offline</strong> - app funciona normalmente</li>
                    <li>📱 <strong>Dados locais</strong> - salvos apenas neste dispositivo</li>
                    <li>❌ <strong>Sem sincronização</strong> entre dispositivos</li>
                </ul>
            </div>
            <div style="margin-top: 25px;">
                <button id="acceptCookies" style="
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white;
                    border: none;
                    padding: ${isMobile ? '15px 25px' : '12px 30px'};
                    border-radius: 25px;
                    font-size: ${isMobile ? '16px' : '16px'};
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                    min-width: ${isMobile ? '140px' : '120px'};
                    transition: all 0.3s ease;
                ">
                    ✅ Permitir Cookies
                </button>
                <button id="declineCookies" style="
                    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    color: white;
                    border: none;
                    padding: ${isMobile ? '15px 25px' : '12px 30px'};
                    border-radius: 25px;
                    font-size: ${isMobile ? '16px' : '16px'};
                    cursor: pointer;
                    margin: 5px;
                    min-width: ${isMobile ? '140px' : '120px'};
                    transition: all 0.3s ease;
                ">
                    🔌 Modo Offline
                </button>
            </div>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
                Você pode alterar essa configuração a qualquer momento nas configurações do app.
            </p>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Adicionar animações CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #cookieModal button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            #cookieModal button:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);

        // Event listeners
        document.getElementById('acceptCookies').onclick = () => {
            this.setCookiePreference(true);
            this.cookiesAccepted = true;
            this.closeCookieModal();
            callback(true);
            
            // Tentar habilitar cookies automaticamente
            this.enableCookiesAutomatically();
        };

        document.getElementById('declineCookies').onclick = () => {
            this.setCookiePreference(false);
            this.cookiesAccepted = false;
            this.closeCookieModal();
            callback(false);
        };

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('declineCookies').click();
            }
        });
    }

    enableCookiesAutomatically() {
        // Tentar habilitar cookies automaticamente quando possível
        try {
            // Para Chrome/Edge: Tentar usar API de permissões
            if ('permissions' in navigator) {
                navigator.permissions.query({ name: 'persistent-storage' })
                    .then(result => {
                        if (result.state === 'granted') {
                            console.log('✅ Permissões de storage concedidas');
                        }
                    })
                    .catch(() => {
                        // API não suportada ou bloqueada
                    });
            }

            // Testar se cookies estão funcionando
            document.cookie = "test_cookie=1; SameSite=None; Secure";
            const cookieWorks = document.cookie.indexOf("test_cookie=1") !== -1;
            
            if (cookieWorks) {
                console.log('✅ Cookies de terceiros funcionando');
                showAchievement('✅ Cookies habilitados! Login Google disponível.');
            } else {
                console.log('⚠️ Cookies ainda bloqueados - instruções necessárias');
                this.showCookieInstructions();
            }
            
            // Limpar cookie de teste
            document.cookie = "test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            
        } catch (error) {
            console.log('⚠️ Não foi possível verificar cookies automaticamente');
            this.showCookieInstructions();
        }
    }

    showCookieInstructions() {
        // Mostrar instruções específicas para habilitar cookies
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let message = '';
        if (isMobile) {
            message = '📱 Toque no ícone de cadeado 🔒 na barra de endereço e permita cookies para este site.';
        } else {
            message = '🖥️ Clique no ícone de cadeado 🔒 na barra de endereço e permita cookies para este site.';
        }
        
        // Mostrar notificação não intrusiva
        this.showCookieNotification(message);
    }

    showCookieNotification(message) {
        // Criar notificação discreta
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            max-width: 300px;
            font-size: 14px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="font-size: 20px;">🍪</div>
                <div>
                    <strong>Habilitar Cookies</strong><br>
                    ${message}
                    <div style="margin-top: 10px;">
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="
                            background: rgba(255, 255, 255, 0.2);
                            border: none;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 12px;
                        ">OK</button>
                        <button onclick="window.open('fix-cookies.html', '_blank')" style="
                            background: rgba(255, 255, 255, 0.2);
                            border: none;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 12px;
                            margin-left: 5px;
                        ">Guia Completo</button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar animação
        if (!document.querySelector('#cookieNotificationStyle')) {
            const style = document.createElement('style');
            style.id = 'cookieNotificationStyle';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    closeCookieModal() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.remove();
                }
            }, 300);
        }
        
        // Adicionar animação de saída
        if (!document.querySelector('#cookieModalExitStyle')) {
            const style = document.createElement('style');
            style.id = 'cookieModalExitStyle';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    async checkCookieStatus() {
        // Verificar se cookies estão funcionando
        try {
            document.cookie = "cookie_test=1; SameSite=None; Secure";
            const works = document.cookie.indexOf("cookie_test=1") !== -1;
            document.cookie = "cookie_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            return works;
        } catch (e) {
            return false;
        }
    }

    resetCookiePreference() {
        // Permitir que usuário mude de ideia
        try {
            localStorage.removeItem('cookies_accepted');
            this.cookiesAccepted = false;
            this.modalShown = false;
        } catch (e) {
            // Fallback
        }
    }
}

// Instância global
const cookieManager = new CookieManager();