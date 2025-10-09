// Configuração do Supabase
const SUPABASE_URL = 'https://qhmgdguuxmnzpousatrn.supabase.co'; // Você precisará substituir pela sua URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobWdkZ3V1eG1uenBvdXNhdHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjA4MDMsImV4cCI6MjA3NTUzNjgwM30.AIdD2iVHQi_nOqiCxybHlaDNW6M9Q2LCTB7v2is-RlY'; // Você precisará substituir pela sua chave

class SupabaseSync {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Carregar biblioteca do Supabase
            if (!window.supabase) {
                await this.loadSupabaseLib();
            }
            
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            
            // Verificar se há usuário logado
            const { data: { user } } = await this.supabase.auth.getUser();
            this.user = user;
            
            // Configurar listeners de auth
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.handleAuthChange(event, session);
            });
            
            this.isInitialized = true;
            this.updateUI();
            
            console.log('✅ Supabase inicializado');
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            return false;
        }
    }

    async loadSupabaseLib() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async signInWithGoogle() {
        if (!this.supabase) {
            showAchievement('❌ Sistema não inicializado');
            return;
        }

        try {
            const { error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                throw error;
            }

            showAchievement('🔐 Redirecionando para Google...');

        } catch (error) {
            console.error('Erro no login Google:', error);
            showAchievement(`❌ Erro no login: ${error.message}`);
        }
    }

    async signOut() {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            this.user = null;
            this.updateUI();
            showAchievement('👋 Logout realizado');

        } catch (error) {
            console.error('Erro no logout:', error);
            showAchievement(`❌ Erro no logout: ${error.message}`);
        }
    }

    handleAuthChange(event, session) {
        this.user = session?.user || null;
        this.updateUI();

        if (event === 'SIGNED_IN') {
            showAchievement(`✅ Login: ${this.user.user_metadata.name}`);
            this.downloadData();
        } else if (event === 'SIGNED_OUT') {
            showAchievement('👋 Usuário deslogado');
        }
    }

    async uploadData() {
        if (!this.user || !this.supabase) {
            console.log('Usuário não logado ou Supabase não inicializado');
            return;
        }

        try {
            const gameData = {
                user_id: this.user.id,
                data: data,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('game_data')
                .upsert(gameData);

            if (error) {
                throw error;
            }

            console.log('☁️ Dados enviados para nuvem');
            showAchievement('☁️ Dados sincronizados na nuvem');

        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            showAchievement(`❌ Erro na sincronização: ${error.message}`);
        }
    }

    async downloadData() {
        if (!this.user || !this.supabase) {
            return;
        }

        try {
            const { data: cloudData, error } = await this.supabase
                .from('game_data')
                .select('data, updated_at')
                .eq('user_id', this.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            if (cloudData) {
                const cloudDate = new Date(cloudData.updated_at);
                const localDate = new Date(data.lastSync || 0);

                if (cloudDate > localDate) {
                    // Dados da nuvem são mais recentes
                    const backup = JSON.stringify(data);
                    localStorage.setItem('backup_before_cloud_sync', backup);

                    Object.assign(data, cloudData.data);
                    data.lastSync = cloudData.updated_at;
                    data.syncedFrom = 'nuvem';
                    
                    saveData();
                    updateUI();
                    
                    showAchievement('📥 Dados baixados da nuvem');
                    console.log('📥 Dados da nuvem aplicados');
                } else {
                    // Dados locais são mais recentes ou iguais
                    this.uploadData();
                }
            } else {
                // Não há dados na nuvem, fazer upload
                this.uploadData();
            }

        } catch (error) {
            console.error('Erro ao baixar dados:', error);
            showAchievement(`❌ Erro ao baixar: ${error.message}`);
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');

        if (!loginBtn) return;

        if (this.user) {
            // Usuário logado
            loginBtn.textContent = '🚪 Logout';
            loginBtn.onclick = () => this.signOut();
            loginBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';

            if (userInfo) {
                const avatar = this.user.user_metadata.avatar_url || '';
                const name = this.user.user_metadata.name || this.user.email;
                
                userInfo.innerHTML = `
                    ${avatar ? `<img src="${avatar}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; vertical-align: middle;">` : ''}
                    <span style="margin-right: 8px;">${name}</span>
                    <span style="font-size: 0.7em; color: #2ecc71;">☁️ Nuvem</span>
                `;
                userInfo.style.display = 'block';
            }

        } else {
            // Usuário não logado
            loginBtn.textContent = '🔐 Login Google';
            loginBtn.onclick = () => this.signInWithGoogle();
            loginBtn.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';

            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }

    // Sincronizar automaticamente quando dados mudarem
    autoSync() {
        if (this.user) {
            this.uploadData();
        }
    }

    // Restaurar backup se houver problema
    restoreBackup() {
        const backup = localStorage.getItem('backup_before_cloud_sync');
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                Object.assign(data, backupData);
                saveData();
                updateUI();
                showAchievement('✅ Backup local restaurado');
                return true;
            } catch (e) {
                showAchievement('❌ Erro ao restaurar backup');
                return false;
            }
        }
        showAchievement('⚠️ Nenhum backup encontrado');
        return false;
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isLoggedIn: !!this.user,
            user: this.user,
            hasSupabase: !!this.supabase
        };
    }
}

// Instância global
const supabaseSync = new SupabaseSync();