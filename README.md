# ⚔️ WYD Quest Tracker

Aplicativo para acompanhar suas missões diárias do WYD com sincronização na nuvem.

## 🎮 Recursos

- 📝 **11 Quests completas** do WYD
- 🔔 **Notificações automáticas** para Arena
- 📊 **Sistema de XP e níveis**
- 🌅 **Reset diário automático**
- 📱 **PWA** - instala no celular
- 🌓 **Tema escuro/claro**
- ☁️ **Sincronização na nuvem** com Supabase
- 🔐 **Login com Google** OAuth2

## 🕐 Horários de Notificação

- **Arena 13:00**
- **Arena 19:00** 
- **Arena 20:30**
- **Arena 23:00**

## ☁️ Sistema de Nuvem

- **Login Google**: Sincronização automática entre dispositivos
- **Supabase**: Banco de dados PostgreSQL na nuvem
- **Conflito inteligente**: Compara timestamps para resolver conflitos
- **Backup local**: Salva backup antes de aplicar dados da nuvem
- **Segurança**: Cada usuário só acessa seus próprios dados

## 🚀 Setup

### Para Uso Básico:
1. Abra o aplicativo
2. Funciona offline com dados locais

### Para Sincronização na Nuvem:
1. Veja `SETUP_SUPABASE.md` para configuração completa
2. Configure projeto no Supabase
3. Configure Google OAuth
4. Atualize URLs no código

## 🎯 Como Usar

1. Abra o aplicativo
2. (Opcional) Faça login com Google para sincronizar
3. Marque as quests conforme completa
4. Receba notificações automáticas
5. Dados sincronizam automaticamente na nuvem

## 🧪 Teste

Acesse `test-supabase.html` para testar todas as funcionalidades:
- Conexão Supabase
- Login Google
- Upload/Download de dados
- Sistema de logs

## 📱 Instalação

O app funciona como PWA - pode ser instalado diretamente no seu celular através do navegador.