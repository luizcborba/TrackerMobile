# 📱 Notificações Mobile - App Fechado

## 🎯 Sistema Implementado

O WYD Quest Tracker agora possui **notificações push nativas** que funcionam mesmo com o app fechado no mobile!

## 🔧 Como Funciona

### **1. Notificações Locais (App Aberto)**
- **Som + Popup** dentro do app
- **5 minutos antes** dos eventos
- **Controle ON/OFF** na seção configurações

### **2. Notificações Push (App Fechado)**
- **Notificação nativa** do sistema operacional
- **Funciona mesmo** com app fechado/em background
- **Requer permissão** do usuário
- **Agenda automática** para próximas 24h

## 📱 **Configuração Mobile**

### **Android (Chrome/Edge)**
1. Abra o WYD Quest Tracker
2. Va em **⚙️ Configurações**
3. Clique em **🔓 Permitir** na seção "Notificações Push Mobile"
4. Autorize quando o navegador solicitar
5. ✅ **Configurado!** Receberá notificações mesmo com app fechado

### **iOS (Safari)**
1. Abra o app no Safari
2. Va em **⚙️ Configurações** 
3. Clique em **🔓 Permitir**
4. Toque **"Permitir"** no popup do iOS
5. ✅ **Configurado!** Notificações funcionarão em background

## 🎮 **Horários de Notificação**

### **Arenas PvP:**
- **12:55** - Arena 13:00 (5 min antes)
- **18:55** - Arena 19:00 (5 min antes)  
- **20:25** - Arena 20:30 (5 min antes)
- **22:55** - Arena 23:00 (5 min antes)

### **Eventos:**
- **10:55** - Evento 11:00 (5 min antes)
- **14:55** - Evento 15:00 (5 min antes)
- **17:55** - Evento 18:00 (5 min antes)
- **21:55** - Evento 22:00 (5 min antes)

## 🔔 **Tipos de Notificação**

### **⏰ Antes do Evento:**
- **Título:** "⏰ WYD Quest Tracker"
- **Texto:** "🎃 Arena 13:00 começa em 5 minutos! 👻"
- **Ações:** [🎮 Abrir App] [❌ Dispensar]

### **🚨 Durante o Evento:**
- **Título:** "🚨 WYD Quest Tracker"  
- **Texto:** "⚔️ Arena 13:00 está começando AGORA! 🏆"
- **Ações:** [🎮 Abrir App] [❌ Dispensar]

## ⚙️ **Controles Disponíveis**

### **🔔 Notificações de Arena/Evento**
- **Liga/Desliga** avisos sonoros dentro do app
- **Padrão:** Ativado

### **📱 Notificações Push Mobile**
- **Solicita permissão** do navegador/sistema
- **Status visual:** Mostra se permitido/negado/pendente
- **Funciona em background**

## 🛠️ **Tecnologias Utilizadas**

### **Frontend:**
- **Notification API** - Notificações nativas
- **Service Worker** - Funcionalidade em background
- **setTimeout/setInterval** - Agendamento local
- **Permission API** - Controle de permissões

### **Service Worker:**
- **Agendamento automático** de notificações
- **Cache offline** para funcionamento sem internet
- **Event listeners** para cliques em notificações
- **Reagendamento diário** automático

## 🔍 **Status de Permissão**

### **✅ Permissão Concedida**
- Notificações funcionam normalmente
- Botão mostra "✅ Ativadas"
- Status: "✅ Permissão concedida"

### **❌ Permissão Negada**
- Usuário bloqueou notificações
- Botão mostra "❌ Bloqueadas"  
- Status: "❌ Permissão negada"

### **🔒 Permissão Necessária**
- Ainda não foi solicitada
- Botão mostra "🔓 Permitir"
- Status: "🔒 Permissão necessária"

## 📋 **Características Técnicas**

### **Agendamento Inteligente:**
- **24h antecedência** - Agenda próximas notificações
- **Reagendamento automático** à meia-noite
- **Verificação de duplicatas** evita spam

### **Persistência:**
- **Service Worker** funciona mesmo com app fechado
- **Cache local** mantém funcionamento offline  
- **Auto-renovação** diária dos agendamentos

### **Otimização Mobile:**
- **Vibração personalizada** para chamar atenção
- **Ícones temáticos** Halloween  
- **Ações rápidas** para abrir app ou dispensar
- **Auto-fechamento** após 30 segundos

## 🎃 **Recursos Halloween**

- **Emojis temáticos** (🎃👻⚔️🏆)
- **Títulos personalizados** com tema
- **Cores e ícones** combinando com visual
- **Vibração especial** (padrão Halloween)

---

**🎮 Agora você nunca mais perde uma arena ou evento, mesmo com o app fechado! 📱👻**