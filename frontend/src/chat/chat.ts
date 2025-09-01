import { ChatState, Message, ChatRoom, Friend } from '../types/chatTypes';
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
        unreadCount: 3,
        rooms: [
            { id: 'global', name: 'Global', type: 'global', unreadCount: 0 },
            { id: 'pong', name: 'Pong', type: 'private', unreadCount: 0 },
            { id: 'snake', name: 'Snake', type: 'private', unreadCount: 0 }
        ],
        friends: []
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
            this.state.currentUserId = data.user.id; // à adapter
            this.state.avatar = data.user.avatar || '';
            this.state.messages = data.recentMessages || [];
            // initial online users list if provided
            if (data.onlineUsers) {
                this.state.onlineUsers = data.onlineUsers.map((u: any) => ({
                    id: u.id,
                    username: u.username || u.login,
                    avatar: u.avatar,
                    status: 'online'
                }));
                this.renderOnlineUsers();
            }
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
            if (!this.state.onlineUsers) this.state.onlineUsers = [];
            if (!this.state.onlineUsers.find(u => u.id === user.id)) {
                this.state.onlineUsers.push({
                    id: user.id,
                    username: user.username || user.login,
                    avatar: user.avatar,
                    status: 'online'
                });
                this.renderOnlineUsers();
            }
        });

        this.socket.on('userLeft', (user: any) => {
            console.log('👋 User left chat:', user);
            if (this.state.onlineUsers) {
                const u = this.state.onlineUsers.find(u => u.id === user.id);
                if (u) {
                    u.status = 'offline';
                    this.renderOnlineUsers();
                }
            }
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

    // Render initial des rooms (sidebar)
    this.renderRoomsSidebar();
        
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

        // Gestion des rooms (délégué après rendu)
        const roomsList = document.getElementById('chat-rooms-list');
        if (roomsList) {
            roomsList.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const item = target.closest('[data-room-id]') as HTMLElement | null;
                if (item) {
                    const roomId = item.dataset.roomId!;
                    this.switchRoom(roomId);
                }
            });
        }

        const newConvBtn = document.getElementById('chat-new-conv');
        if (newConvBtn) {
            newConvBtn.addEventListener('click', () => this.openNewConversationDialog());
        }

        const addFriendBtn = document.getElementById('chat-add-friend');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => this.openAddFriendDialog());
        }

        const searchInput = document.getElementById('chat-user-search') as HTMLInputElement | null;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = (e.target as HTMLInputElement).value.trim();
                this.state.searchTerm = term;
                if (term.length < 2) {
                    this.state.searchResults = [];
                    this.renderSearchResults();
                    return;
                }
                this.performUserSearch(term);
            });
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

    private switchRoom(roomId: string) {
        // Mettre à jour la room active
        this.state.activeTab = roomId as any; // compatibilité temporaire
        this.state.currentRoom = this.state.rooms?.find(r => r.id === roomId) || null;
        // Sélection visuelle
        const roomsList = document.getElementById('chat-rooms-list');
        if (roomsList) {
            [...roomsList.querySelectorAll('[data-room-id]')].forEach(el => {
                if ((el as HTMLElement).dataset.roomId === roomId) {
                    el.classList.add('bg-gray-700', 'text-white');
                } else {
                    el.classList.remove('bg-gray-700', 'text-white');
                }
            });
        }
        // Filtrage messages si besoin (actuellement on affiche tout)
        this.updateMessagesDisplay();
    }

    private renderRoomsSidebar() {
        const container = document.getElementById('chat-rooms-list');
        if (!container) return;
        if (!this.state.rooms) return;
        container.innerHTML = this.state.rooms.map(r => {
            const active = (this.state.activeTab === r.id) ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 hover:text-white text-gray-300';
            return `<div data-room-id="${r.id}" class="cursor-pointer px-2 py-1 rounded flex items-center justify-between ${active}">
                <span class="truncate">${this.escapeHtml(r.name)}</span>
                ${r.unreadCount > 0 ? `<span class="ml-2 text-xs bg-red-600 text-white rounded-full px-1.5">${r.unreadCount}</span>` : ''}
            </div>`;
        }).join('');

        this.renderFriendsList();
    this.renderOnlineUsers();
    this.renderSearchResults();
    }

    private renderFriendsList() {
        const list = document.getElementById('chat-friends-list');
        if (!list) return;
        const friends = this.state.friends || [];
        if (!friends.length) {
            list.innerHTML = `<div class="text-[11px] text-gray-500 px-1">Aucun ami</div>`;
            return;
        }
        list.innerHTML = friends.map(f => {
            const statusColor = f.status === 'online' ? 'bg-green-500' : (f.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500');
            return `<div data-friend-id="${f.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-8 h-8">
                    ${f.avatar ? `<img src="${f.avatar}" class="w-8 h-8 rounded-full object-cover" />` : `<div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">${this.escapeHtml(f.username.charAt(0).toUpperCase())}</div>`}
                    <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${statusColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${this.escapeHtml(f.username)}</div>
                </div>
            </div>`;
        }).join('');
    }

    private renderOnlineUsers() {
        const container = document.getElementById('chat-online-users');
        if (!container) return;
        const online = (this.state.onlineUsers || []).filter(u => u.status === 'online');
        if (!online.length) {
            container.innerHTML = `<div class="text-[11px] text-gray-500 px-1">Personne</div>`;
            return;
        }
        container.innerHTML = online.map(u => {
            return `<div data-online-id="${u.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-7 h-7">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-7 h-7 rounded-full object-cover" />` : `<div class=\"w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px]\">${this.escapeHtml(u.username.charAt(0).toUpperCase())}</div>`}
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 bg-green-500"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${this.escapeHtml(u.username)}</div>
                </div>
            </div>`;
        }).join('');
    }

    private renderSearchResults() {
        const container = document.getElementById('chat-search-results');
        if (!container) return;
        const results = this.state.searchResults || [];
        if (!this.state.searchTerm || this.state.searchTerm.length < 2 || results.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }
        container.classList.remove('hidden');
        container.innerHTML = results.map(u => {
            const statusColor = u.status === 'online' ? 'bg-green-500' : (u.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500');
            return `<div data-search-id="${u.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-7 h-7">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-7 h-7 rounded-full object-cover" />` : `<div class=\"w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px]\">${this.escapeHtml(u.username.charAt(0).toUpperCase())}</div>`}
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${statusColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${this.escapeHtml(u.username)}</div>
                </div>
                <button data-add-friend-id="${u.id}" class="text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded px-1 py-0.5">+</button>
            </div>`;
        }).join('');

        // Gestion ajout depuis résultats
        container.querySelectorAll('[data-add-friend-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = (e.currentTarget as HTMLElement).dataset.addFriendId!;
                const user = this.state.searchResults?.find(u => u.id === id);
                if (user) this.addFriendFromSearch(user);
            });
        });
    }

    private addFriendFromSearch(user: Friend) {
        if (!this.state.friends) this.state.friends = [];
        if (!this.state.friends.find(f => f.id === user.id)) {
            this.state.friends.push(user);
            this.renderFriendsList();
        }
    }

    private performUserSearch(term: string) {
        // TODO: requête backend; simulation locale en fusionnant online + friends + mock
        const base: Friend[] = [ ...(this.state.onlineUsers || []), ...(this.state.friends || []) ];
        // Ajouter quelques faux utilisateurs pour la démo
        const mock: Friend[] = ['lucie','marc','patrick','zoe','lea'].map(name => ({ id: 'mock-' + name, username: name, status: 'offline' }));
        const pool = [...base, ...mock];
        const lower = term.toLowerCase();
        const filtered = pool.filter(u => u.username.toLowerCase().includes(lower));
        // Uniques
        const unique: { [id: string]: Friend } = {};
        filtered.forEach(u => { unique[u.id] = u; });
        this.state.searchResults = Object.values(unique).slice(0, 20);
        this.renderSearchResults();
    }

    private openAddFriendDialog() {
        const username = prompt('Entrer le pseudo de votre ami :');
        if (!username) return;
        // TODO: requête backend pour ajouter un ami
        // Simulation rapide
        const friend: Friend = { id: 'f-' + Date.now(), username, status: 'offline' };
        this.state.friends?.push(friend);
        this.renderFriendsList();
    }

    private openNewConversationDialog() {
        if (!this.state.friends || this.state.friends.length === 0) {
            alert('Ajoutez d\'abord un ami.');
            return;
        }
        const choices = this.state.friends.map((f, idx) => `${idx + 1}. ${f.username}`).join('\n');
        const pick = prompt('Choisissez un ami:\n' + choices);
        if (!pick) return;
        const index = parseInt(pick, 10) - 1;
        if (isNaN(index) || !this.state.friends[index]) return;
        const friend = this.state.friends[index];
        // Vérifier si une room existe déjà
        const existing = this.state.rooms?.find(r => r.id === 'dm-' + friend.id);
        if (existing) {
            this.switchRoom(existing.id);
            return;
        }
        const room: ChatRoom = { id: 'dm-' + friend.id, name: friend.username, type: 'private', unreadCount: 0 };
        this.state.rooms?.push(room);
        this.renderRoomsSidebar();
        this.switchRoom(room.id);
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
