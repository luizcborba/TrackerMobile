# WYD Quest Tracker PWA

🎮 Progressive Web App para acompanhar suas missões diárias do WYD

## 🌟 Acesse o App

**[🚀 Clique aqui para usar o WYD Quest Tracker](https://luizcborba.github.io/TrackerMobile/)**

> **✅ Google Auth Configurado!** Login real com sua conta Google funcionando.
> **✅ Hospedado no GitHub Pages!** Acesso direto via HTTPS.

## 📱 Como Instalar no Seu Dispositivo

### Desktop
1. Acesse o link acima
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### Mobile
1. Acesse pelo navegador do celular
2. Toque em "Adicionar à tela inicial"
3. O app aparecerá como um aplicativo nativo

## 🌟 Características

- ✅ **Offline First** - Funciona mesmo sem conexão com a internet
- 📱 **Instalável** - Pode ser instalado como um app nativo no celular/desktop
- 🔔 **Notificações** - Alertas sonoros e visuais para horários de arena
- 🌙 **Tema Escuro/Claro** - Alternância entre temas
- 📊 **Sistema de Progresso** - XP, níveis e streak de dias consecutivos
- 💾 **Dados Locais** - Tudo salvo no seu dispositivo

## 🚀 Como Instalar

### Desktop (Chrome, Edge, etc.)
1. Acesse o site pelo navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou use o banner que aparece automaticamente

### Mobile (Android/iOS)
1. Acesse pelo navegador do celular
2. **Android**: Toque em "Adicionar à tela inicial" no menu do Chrome
3. **iOS**: Toque no botão de compartilhar e selecione "Adicionar à Tela de Início"

## 🎮 Como Usar

### Missões Básicas
- Toque em qualquer missão para marcá-la como concluída
- Ganhe 10 XP por missão completada
- Complete todas para ganhar 50 XP de bônus

### Missões Múltiplas
- **Expedição**: 3 partes (cada uma dá 10 XP)
- **Infernal**: 2 partes (cada uma dá 10 XP)

### Sistema de Progresso
- **Nível**: Aumenta a cada 100 XP
- **Streak**: Dias consecutivos completando missões
- **Reset Diário**: Todas as missões resetam à meia-noite

### Notificações de Arena
O app notifica 5 minutos antes das arenas:
- 🕐 Arena 13:00
- 🕕 Arena 19:00
- 🕖 Arena 20:30
- 🕚 Arena 23:00

## 🔧 Recursos Técnicos

### PWA Features
- **Service Worker** para cache offline
- **Web App Manifest** para instalação
- **Background Sync** para notificações
- **Push Notifications** (preparado para futuro)

### Compatibilidade
- ✅ Chrome/Chromium (Desktop/Mobile)
- ✅ Edge (Desktop/Mobile)  
- ✅ Safari (iOS/macOS)
- ✅ Firefox (limitado)
- ✅ Samsung Internet

## 📁 Estrutura de Arquivos

```
appwydmob/
├── index.html          # Página principal
├── app.js             # Lógica da aplicação
├── sw.js              # Service Worker
├── manifest.json      # Manifest PWA
├── icon-*.png         # Ícones (vários tamanhos)
└── README.md          # Este arquivo
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Servidor HTTP local (não funciona via file://)
- Python instalado (para gerar ícones)

### Executar Localmente

#### Opção 1: Python
```bash
cd appwydmob
python -m http.server 8000
```

#### Opção 2: Node.js
```bash
npx serve .
```

#### Opção 3: Live Server (VS Code)
- Instale a extensão "Live Server"
- Clique direito no index.html → "Open with Live Server"

### Testar PWA
1. Acesse via HTTPS ou localhost
2. Abra DevTools → Application → Service Workers
3. Verifique se o SW está registrado
4. Teste offline desconectando a rede

## 🎨 Personalização

### Cores do Tema
Edite as variáveis CSS para mudar as cores:
- `#8b5a2b` - Cor principal (marrom dourado)
- `#e67e22` - Cor de destaque (laranja)
- `#2ecc71` - Cor de sucesso (verde)

### Adicionar Novas Missões
1. Adicione o HTML da missão em `index.html`
2. Atualize o contador total no JavaScript
3. Adicione event listeners se necessário

### Horários de Arena
Modifique o array `questSchedule` em `app.js`:
```javascript
const questSchedule = [
    { id: 'arena1', name: 'Arena 13:00', hour: 13, minute: 0 },
    // ... adicione mais horários
];
```

## 🐛 Resolução de Problemas

### PWA não instala
- Verifique se está sendo servido via HTTPS
- Confirme se o manifest.json está acessível
- Veja o console para erros do Service Worker

### Notificações não funcionam
- Dê permissão para notificações no navegador
- Verifique se o site não está em modo "Não perturbar"
- Teste em uma aba normal (não privada/incógnito)

### Dados perdidos
- Os dados são salvos no localStorage
- Limpar dados do navegador remove o progresso
- Faça backup exportando os dados (feature futura)

## 📊 Dados Salvos

O app salva localmente:
- Status das missões diárias
- XP total e nível atual
- Streak de dias consecutivos
- Configurações de tema
- Histórico de notificações

## 🔐 Privacidade

- ✅ Todos os dados ficam no seu dispositivo
- ✅ Nenhuma informação é enviada para servidores
- ✅ Funciona completamente offline
- ✅ Sem cookies ou tracking

## 📈 Futuras Melhorias

- [ ] Backup/sincronização em nuvem
- [ ] Estatísticas detalhadas
- [ ] Customização de missões
- [ ] Sistema de conquistas
- [ ] Lembretes personalizados
- [ ] Integração com Discord

## 📝 Licença

Este projeto é open source e gratuito para uso pessoal.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! 

---

**Desenvolvido para a comunidade WYD** ⚔️