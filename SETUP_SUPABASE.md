# 🚀 Setup Supabase + Google Auth

## 📋 **PASSO A PASSO COMPLETO**

### 1️⃣ **Criar Projeto no Supabase**

1. Vá para [supabase.com](https://supabase.com)
2. Clique em "Start your project" 
3. Faça login com GitHub
4. Clique "New project"
5. Escolha organização
6. Nome do projeto: `wyd-quest-tracker`
7. Database password: `[crie uma senha forte]`
8. Region: `East US` (mais próximo do Brasil)
9. Clique "Create new project"

### 2️⃣ **Configurar Tabela de Dados**

No Dashboard do Supabase:

1. Vá em **SQL Editor**
2. Cole este código:

```sql
-- Criar tabela para dados do jogo
CREATE TABLE game_data (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver/editar seus próprios dados
CREATE POLICY "Users can manage their own game data" ON game_data
    FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_game_data_updated_at 
    BEFORE UPDATE ON game_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

3. Clique "Run" para executar

### 3️⃣ **Configurar Google OAuth**

#### No Google Console:

1. Vá para [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services > Credentials**
4. Clique "Create Credentials > OAuth 2.0 Client IDs"
5. Application type: `Web application`
6. Name: `WYD Quest Tracker`
7. Authorized redirect URIs, adicione:
   - `https://[seu-projeto].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback` (para desenvolvimento)
8. Copie o **Client ID** e **Client Secret**

#### No Supabase:

1. Vá em **Authentication > Providers**
2. Clique em **Google**
3. Enable Google provider: `ON`
4. Cole o **Client ID** e **Client Secret**
5. Clique "Save"

### 4️⃣ **Configurar o Código**

1. No Supabase, vá em **Settings > API**
2. Copie:
   - **Project URL**
   - **anon public** key

3. Edite o arquivo `supabase-sync.js`, linha 2-3:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Sua URL aqui
const SUPABASE_KEY = 'sua-chave-anon-aqui'; // Sua chave aqui
```

### 5️⃣ **Configurar Domínio**

No Supabase:
1. Vá em **Authentication > URL Configuration**  
2. Site URL: `https://luizcborba.github.io`
3. Redirect URLs, adicione:
   - `https://luizcborba.github.io/TrackerMobile/**`

## ✅ **COMO FUNCIONA**

### 🔐 **Login**
- Usuário clica "Login Google"
- Redireciona para Google OAuth
- Retorna para o app já logado
- Dados são baixados da nuvem automaticamente

### ☁️ **Sincronização**
- **Automática**: A cada mudança nos dados
- **Inteligente**: Compara timestamps (local vs nuvem)
- **Segura**: Cada usuário só vê seus dados
- **Backup**: Salva backup local antes de aplicar dados da nuvem

### 📱 **Funcionamento**
1. **Primeira vez**: Upload dos dados locais
2. **Login posterior**: Compara timestamps
3. **Nuvem mais recente**: Baixa e aplica
4. **Local mais recente**: Faz upload
5. **Mudanças**: Auto-sync imediato

## 🛡️ **Recursos de Segurança**

- ✅ **RLS (Row Level Security)**: Usuários só acessam seus dados
- ✅ **OAuth2**: Login seguro via Google  
- ✅ **HTTPS**: Todas as comunicações criptografadas
- ✅ **Backup local**: Antes de aplicar dados da nuvem
- ✅ **Restore**: Pode voltar ao backup se algo der errado

## 🎯 **Vantagens da Solução**

- 🌐 **Funciona offline**: PWA + LocalStorage
- ☁️ **Sincroniza online**: Supabase em tempo real
- 🔄 **Resolve conflitos**: Timestamp-based sync
- 🔒 **Seguro**: Cada usuário tem seus dados isolados
- 📱 **Universal**: Funciona em qualquer dispositivo
- 🚀 **Rápido**: Banco PostgreSQL otimizado

## 🔧 **Para Desenvolvimento Local**

```bash
# Se quiser testar localmente
npx supabase start
```

Isso criará uma instância local do Supabase para testes.

## 📞 **Suporte**

Se tiver dúvidas:
1. Verifique os logs do navegador (F12)
2. Confirme as configurações no Supabase
3. Teste as URLs de redirect
4. Verifique se as permissões estão corretas