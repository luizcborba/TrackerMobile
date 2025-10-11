# 📱 Guia de Instalação PWA - WYD Quest Tracker

## 🎯 Como Instalar o App

### 📱 Android (Chrome/Edge)
1. Abra o app no navegador
2. Procure pelo ícone de instalação (📱) no canto superior direito
3. OU vá no menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"
4. Confirme a instalação

### 🍎 iPhone/iPad (Safari)
1. Abra o app no Safari
2. Toque no ícone de compartilhar (↗️) na parte inferior
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme o nome e toque em "Adicionar"

### 💻 Desktop (Chrome/Edge)
1. Abra o app no navegador
2. Procure pelo ícone de instalação na barra de endereços
3. OU vá no menu → "Instalar WYD Quest Tracker"
4. Confirme a instalação

## ✨ Funcionalidades PWA

### 🔔 Notificações
- Alertas automáticos para Arena (13:00 e 20:00)
- Som e vibração persistentes até confirmação
- Funciona mesmo com o app em segundo plano

### 📱 Recursos Mobile
- Interface otimizada para touch
- Funciona offline
- Ícone na tela inicial
- Tela cheia (sem barra do navegador)
- Splash screen personalizada

### 💾 Armazenamento Local
- Dados salvos no dispositivo
- Sincronização automática
- Backup das conquistas e progresso

## 🔧 Solução de Problemas

### ❓ Não aparece opção de instalar?
- **Android**: Certifique-se de usar Chrome ou Edge
- **iOS**: Use apenas o Safari (outros navegadores não suportam)
- **Desktop**: Chrome, Edge ou Firefox

### 🔕 Notificações não funcionam?
1. Verifique se as notificações estão permitidas no navegador
2. No Android: Configurações → Apps → WYD Quest Tracker → Notificações
3. No iOS: Configurações → Notificações → Safari → Permitir notificações

### 📵 App não funciona offline?
- Abra o app pelo menos uma vez com internet
- Aguarde o download completo dos arquivos
- Verifique se o service worker foi instalado (console do navegador)

## 🎮 Funcionalidades do App

### ⚔️ Sistema de Quests
- Quests diárias automáticas
- Subquests opcionais
- Sistema de XP e level
- Streak de dias consecutivos

### 🏆 Sistema de Conquistas
- Popups animados
- Sons de celebração
- Vibração no mobile
- Tracking de progresso

### 🕐 Notificações de Arena
- Arena 13:00 e 20:00
- Avisos 30 minutos antes
- Som persistente até confirmação
- Vibração sincronizada

### 💰 Sistema de Doação
- QR Code PIX gerado automaticamente
- Código copia e cola
- Design responsivo

## 🔄 Atualizações

O app verifica automaticamente por atualizações e as instala em segundo plano. Quando houver uma nova versão:

1. Uma notificação aparecerá
2. Feche e reabra o app para aplicar
3. Ou recarregue a página

## 📊 Compatibilidade

### ✅ Totalmente Compatível
- Android 7+ com Chrome/Edge
- iOS 12+ com Safari
- Windows 10+ com Chrome/Edge
- macOS com Chrome/Edge/Safari

### ⚠️ Limitações
- iOS: Apenas Safari suporta PWA completo
- Notificações push requerem permissão do usuário
- Alguns recursos podem variar entre navegadores

## 🛠️ Para Desenvolvedores

### Arquivos PWA
- `manifest.json` - Configuração do app
- `sw.js` - Service Worker para offline/notificações
- `icon-*.png` - Ícones para diferentes dispositivos

### Console de Debug
Abra F12 → Console para ver logs do PWA:
```
PWA: Service Worker registered successfully
PWA: Prompt de instalação disponível
PWA: App was installed
```

### Teste de Funcionalidades
1. **Offline**: Desconecte a internet e teste
2. **Notificações**: Aguarde os horários de arena
3. **Instalação**: Teste em diferentes dispositivos
4. **Atualização**: Force refresh para testar cache