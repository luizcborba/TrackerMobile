# PWA Debug Info

Para testar a instalação do PWA no mobile:

## Android Chrome:
1. Abra: http://192.168.x.x:8000 (substitua pelo IP local do PC)
2. O banner de instalação deve aparecer automaticamente
3. Ou toque no menu ⋮ e selecione "Adicionar à tela inicial"

## iOS Safari:
1. Abra: http://192.168.x.x:8000
2. Toque no botão Compartilhar 📤
3. Selecione "Adicionar à Tela de Início"

## Desktop Chrome:
1. Abra: http://localhost:8000
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu > Instalar WYD Quest Tracker

## Debug:
- F12 > Application > Manifest (verificar erros)
- F12 > Application > Service Workers (verificar registro)
- F12 > Console (verificar logs PWA)

## Requisitos para funcionar:
- Servidor HTTPS (em produção) ou localhost
- Manifest.json válido
- Service Worker registrado
- Ícones adequados