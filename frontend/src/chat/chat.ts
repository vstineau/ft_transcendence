import { ChatState, Message, ChatRoom } from '../types/chatTypes';

class ChatManager {
    private state: ChatState = {
        isOpen: false,
        activeTab: 'global',
        currentRoom: null,
        messages: [],
        unreadCount: 3
    };

    private mockMessages: Message[] = [
        {
            id: '1',
            userId: 'user1',
            username: 'Alice',
            content: 'Salut tout le monde ! 👋',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            type: 'text'
        },
        {
            id: '2',
            userId: 'user2',
            username: 'Bob',
            content: 'Hey ! Quelqu\'un pour une partie de Pong ?',
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            type: 'text'
        },
        {
            id: '3',
            userId: 'current-user',
            username: 'Toi',
            content: 'Je suis chaud ! 🏓',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
            type: 'text'
        }
    ];

    constructor() {
        this.initializeChat();
    }

    private initializeChat() {
        // Simuler des messages pour le développement
        this.state.messages = this.mockMessages;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const chatFab = document.getElementById('chat-fab');
        if (chatFab) {
            chatFab.addEventListener('click', () => {
                this.toggleChat();
            });
        }
    }

    public toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        if (this.state.isOpen) {
            this.openChat();
            this.state.unreadCount = 0;
            this.updateNotificationBadge();
        } else {
            this.closeChat();
        }
    }

    private openChat() {
        // Créer ou afficher le panel de chat
        this.createChatPanel();
    }

    private closeChat() {
        // Fermer le panel de chat
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel) {
            chatPanel.remove();
        }
    }

    private createChatPanel() {
        // Si le panel existe déjà, ne pas le recréer
        if (document.getElementById('chat-panel')) return;

        const chatPanel = document.createElement('div');
        chatPanel.id = 'chat-panel';
        chatPanel.className = 'fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl z-40 font-montserrat flex flex-col overflow-hidden';

        chatPanel.innerHTML = `
            <!-- Header du chat -->
            <div class="bg-blue-600 text-white p-4 rounded-t-xl">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg">Chat</h3>
                    <button id="chat-close" class="text-white hover:bg-blue-700 rounded p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <!-- Onglets -->
                <div class="flex mt-3 space-x-1">
                    <button id="tab-global" class="px-3 py-1 rounded text-sm bg-blue-700 text-white">
                        Global
                    </button>
                    <button id="tab-private" class="px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white">
                        Privé
                    </button>
                </div>
            </div>

            <!-- Zone des messages -->
            <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                ${this.renderMessages()}
            </div>

            <!-- Zone de saisie -->
            <div class="p-3 bg-white border-t border-gray-200">
                <div class="flex items-center space-x-2">
                    <input
                        id="message-input"
                        type="text"
                        placeholder="Tapez votre message..."
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        id="send-message"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatPanel);

        // Ajouter les event listeners pour le panel
        this.setupPanelEventListeners();
        
        // Scroll vers le bas des messages
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    private setupPanelEventListeners() {
        // Fermer le chat
        const closeBtn = document.getElementById('chat-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Envoyer un message
        const sendBtn = document.getElementById('send-message');
        const messageInput = document.getElementById('message-input') as HTMLInputElement;
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage(messageInput.value);
                messageInput.value = '';
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage(messageInput.value);
                    messageInput.value = '';
                }
            });
        }

        // Gestion des onglets
        const tabGlobal = document.getElementById('tab-global');
        const tabPrivate = document.getElementById('tab-private');
        
        if (tabGlobal) {
            tabGlobal.addEventListener('click', () => {
                this.switchTab('global');
            });
        }
        
        if (tabPrivate) {
            tabPrivate.addEventListener('click', () => {
                this.switchTab('private');
            });
        }
    }

    private renderMessages(): string {
        return this.state.messages.map(message => {
            const isOwn = message.userId === 'current-user';
            const time = this.formatTime(message.timestamp);
            
            return `
                <div class="flex ${isOwn ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-xs">
                        ${!isOwn ? `<div class="text-xs text-gray-500 mb-1">${message.username}</div>` : ''}
                        <div class="px-3 py-2 rounded-lg text-sm ${
                            isOwn 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-gray-200'
                        }">
                            ${this.escapeHtml(message.content)}
                        </div>
                        <div class="text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}">
                            ${time}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    private sendMessage(content: string) {
        if (!content.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            userId: 'current-user',
            username: 'Toi',
            content: content.trim(),
            timestamp: new Date(),
            type: 'text'
        };

        this.state.messages.push(message);
        this.updateMessagesDisplay();

        // TODO: Envoyer via Socket.IO
        console.log('Message envoyé:', message);
    }

    private switchTab(tab: 'global' | 'private') {
        this.state.activeTab = tab;
        
        // Mettre à jour l'UI des onglets
        const tabGlobal = document.getElementById('tab-global');
        const tabPrivate = document.getElementById('tab-private');
        
        if (tabGlobal && tabPrivate) {
            if (tab === 'global') {
                tabGlobal.className = 'px-3 py-1 rounded text-sm bg-blue-700 text-white';
                tabPrivate.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
            } else {
                tabPrivate.className = 'px-3 py-1 rounded text-sm bg-blue-700 text-white';
                tabGlobal.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
            }
        }

        // TODO: Charger les messages du bon onglet
        console.log('Onglet changé:', tab);
    }

    private updateMessagesDisplay() {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = this.renderMessages();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    private updateNotificationBadge() {
        const badge = document.getElementById('chat-notif');
        if (badge) {
            if (this.state.unreadCount > 0) {
                badge.textContent = this.state.unreadCount > 99 ? '99+' : this.state.unreadCount.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    private formatTime(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) {
            return 'À l\'instant';
        } else if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}min`;
        } else {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    public addUnreadMessage() {
        this.state.unreadCount++;
        this.updateNotificationBadge();
    }
}

// Instance globale du chat
export const chatManager = new ChatManager();
