import { ChatState, Message, ChatRoom } from '../types/chatTypes';
import { ChatPanel } from '../views/chat.views';
import io, { Socket } from 'socket.io-client';
import { getCookie } from '../pong/pong';

class ChatManager {
    private state: ChatState = {
        currentUserId: '',
        avatar: '',
        isOpen: false,
        activeTab: 'global',
        currentRoom: null,
        messages: [],
        unreadCount: 3
    };

    private socket: Socket | null = null;

    constructor() {
        this.initializeChat();
    }

    private createSocketClient() {
        const host = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        this.socket = io(`${protocol}//${host}:${port}/chat`);
        
        this.socket.on('connect', () => {
            console.log('💬 Chat socket connected');
            let cookie = getCookie('token');
            if (cookie) {
                this.socket!.emit('initUser', cookie);
            }
        });

        // Écouter les événements du serveur
        this.socket.on('userConnected', (data: any) => {
            console.log('✅ Chat user connected:', data);
            this.state.currentUserId = data.user.id; // à adapter selon la structure de data
            this.state.avatar = data.user.avatar || '';
            this.state.messages = data.recentMessages || [];
            this.updateMessagesDisplay();
        });

        this.socket.on('newMessage', (message: Message) => {
            console.log('📩 New message received:', message);
            this.state.messages.push(message);
            this.updateMessagesDisplay();
            
            
            // Incrémenter les non-lus si le chat est fermé
            if (!this.state.isOpen) {
                this.state.unreadCount++;
                this.updateNotificationBadge();
            }
        });

        this.socket.on('userJoined', (user: any) => {
            console.log('👋 User joined chat:', user);
            // TODO: Mettre à jour la liste des utilisateurs en ligne
        });

        this.socket.on('userLeft', (user: any) => {
            console.log('👋 User left chat:', user);
            // TODO: Mettre à jour la liste des utilisateurs en ligne
        });

        this.socket.on('authError', (error: string) => {
            console.error('❌ Chat auth error:', error);
        });

        this.socket.on('error', (error: any) => {
            console.error('❌ Chat error:', error);
        });
    }

    private initializeChat() {
        // Créer la connexion socket
        this.createSocketClient();
        
        // Simuler des messages pour le développement (sera remplacé par les vrais messages du serveur)
        this.state.messages = this.mockMessages;
        this.setupEventListeners();
    }

    private mockMessages: Message[] = [
        {
            id: '1',
            userId: 'user1',
            username: 'Alice',
            content: 'Salut tout le monde ! 👋',
            avatarPath: '',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            type: 'text'
        },
        {
            id: '2',
            userId: 'user2',
            username: 'Bob',
            content: 'Hey ! Quelqu\'un pour une partie de Pong ?',
            avatarPath: '',
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            type: 'text'
        },
        {
            id: '3',
            userId: 'current-user',
            username: 'Toi',
            content: 'Je suis chaud ! 🏓',
            avatarPath: '',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
            type: 'text'
        }
    ];

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

        // Créer le panel avec la fonction ChatPanel
        document.body.insertAdjacentHTML('beforeend', ChatPanel());

        // Ajouter les event listeners pour le panel
        this.setupPanelEventListeners();
        
        // Render initial des messages
        this.updateMessagesDisplay();
        
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
        const tabPong = document.getElementById('tab-pong');
        const tabSnake = document.getElementById('tab-snake')
        
        if (tabGlobal) {
            tabGlobal.addEventListener('click', () => {
                this.switchTab('global');
            });
        }
        
        if (tabPong) {
            tabPong.addEventListener('click', () => {
                this.switchTab('pong');
            });
        }

        if (tabSnake) {
            tabSnake.addEventListener('click', () => {
                this.switchTab('snake');
            })
        }
    }

    private renderMessages(): string {
        return this.state.messages.map(message => {
            const isOwn = message.userId === this.state.currentUserId;
            const time = this.formatTime(message.timestamp);
            const avatarColor = this.getAvatarColor(message.username);
            const initial = message.username.charAt(0).toUpperCase();
            
            let avatar;
            if (isOwn && this.state.avatar) {
                avatar = `<img src="${this.state.avatar}" alt="avatar" class="w-8 h-8 rounded-full object-cover shrink-0" />`;
            } else if (message.avatarPath) {
            avatar = `<img src="${message.avatarPath}" alt="avatar" class="w-8 h-8 rounded-full object-cover shrink-0" />`;
            } else {
                avatar = `<div class="w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0">${initial}</div>`;
            }


            if (isOwn) {
                // Message envoyé (à droite)
                return `
                    <div class="flex items-start justify-end gap-2.5">
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col w-full max-w-[240px] leading-1.5 p-3 border border-gray-200 bg-black text-white rounded-s-xl rounded-ee-xl">
                                <div class="flex items-center justify-between space-x-2 mb-1">
                                    <span class="text-sm font-semibold">Moi</span>
                                    <span class="text-xs font-normal text-gray-300">${time}</span>
                                </div>
                                <p class="text-sm font-normal">
                                    ${this.escapeHtml(message.content)}
                                </p>
                                <span class="text-xs font-normal text-gray-300 mt-1">Vu</span>
                            </div>
                        </div>
                        ${avatar}
                    </div>
                `;
            } else {
                // Message reçu (à gauche)
                return `
                    <div class="flex items-start gap-2.5">
                        ${avatar}
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col w-full max-w-[240px] leading-1.5 p-3 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="text-sm font-semibold text-gray-900">${this.escapeHtml(message.username)}</span>
                                    <span class="text-xs font-normal text-gray-500">${time}</span>
                                </div>
                                <p class="text-sm font-normal text-gray-900">
                                    ${this.escapeHtml(message.content)}
                                </p>
                                <span class="text-xs font-normal text-gray-500 mt-1">Delivered</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    private getAvatarColor(username: string): string {
        // Générer une couleur basée sur le nom d'utilisateur
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
            'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
        ];
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }

    private sendMessage(content: string) {
        if (!content.trim()) return;

        // Envoyer via Socket.IO au serveur
        if (this.socket && this.socket.connected) {
            this.socket.emit('sendMessage', {
                content: content.trim(),
                room: this.state.activeTab === 'global' ? 'global' : this.state.currentRoom?.id
            });
        } else {
            console.error('❌ Socket not connected');
        }
    }

    private switchTab(tab: 'global' | 'pong' | 'snake') {
        this.state.activeTab = tab;
        
        // Mettre à jour l'UI des onglets
        const tabGlobal = document.getElementById('tab-global');
        const tabSnake = document.getElementById('tab-snake');
        const tabPong = document.getElementById('tab-pong');
        
        if (tabGlobal && tabPong && tabSnake ) {
            if (tab === 'global') {
                tabGlobal.className = 'px-3 py-1 rounded text-sm bg-blue-700 text-white';
                tabPong.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
                tabSnake.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
            } else if (tab === 'pong') {
                tabGlobal.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
                tabPong.className = 'px-3 py-1 rounded text-sm bg-blue-700 text-white';
                tabSnake.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
            } else if (tab === 'snake') {
                tabGlobal.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
                tabPong.className = 'px-3 py-1 rounded text-sm text-blue-200 hover:bg-blue-700 hover:text-white';
                tabSnake.className = 'px-3 py-1 rounded text-sm bg-blue-700 text-white';
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

    private formatTime(date: Date | string): string {
        // S'assurer que nous avons un objet Date
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // Vérifier que la conversion s'est bien passée
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const diff = now.getTime() - dateObj.getTime();
        
        if (diff < 60000) {
            return 'À l\'instant';
        } else if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}min`;
        } else {
            return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
