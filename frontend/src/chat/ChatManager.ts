// @ts-ignore
import io, { Socket } from 'socket.io-client';
import { getCookie } from '../pong/pong';
import type { ChatState, Message, ChatRoom, Friend } from './types';
import { ChatPanel } from './components/ChatPanel';
import { SocketService, MessageService } from './services';
import { formatTime, escapeHtml, createAvatarElement } from './utils';

export class ChatManager {
    private state: ChatState = {
        currentUserId: '',
        avatar: '',
        isOpen: false,
        activeTab: 'global',
        currentRoom: null,
        messages: [],
        unreadCount: 0,
        onlineUsers: [],
        rooms: [
            { id: 'global', name: 'Global', type: 'global', unreadCount: 0 },
            { id: 'pong', name: 'Pong', type: 'private', unreadCount: 0 },
            { id: 'snake', name: 'Snake', type: 'private', unreadCount: 0 }
        ],
        friends: []
    };

    private socketService: SocketService;
    private messageService: MessageService;

    constructor() {
        this.socketService = new SocketService();
        this.messageService = new MessageService();
        this.initializeChat();
    }

    private createSocketClient() {
        const socket = this.socketService.createConnection();

        this.socketService.on('connect', () => {
            console.log('💬 Chat socket connected');
            let cookie = getCookie('token');
            if (cookie) {
                this.socketService.emit('initUser', cookie);
            }
        });

        // Écouter les événements du serveur
        this.socketService.on('userConnected', (data: any) => {
            console.log('✅ Chat user connected:', data);
            this.state.currentUserId = data.user.id;
            this.state.avatar = data.user.avatar || '';
            this.state.messages = data.recentMessages || [];
            this.state.onlineUsers = data.onlineUsers || [];
            this.updateMessagesDisplay();
        });

        this.socketService.on('newMessage', (message: Message) => {
            console.log('📩 New message received:', message);
            this.messageService.addMessage(message);
            this.state.messages.push(message);
            this.updateMessagesDisplay();

            // Incrémenter les non-lus si le chat est fermé
            if (!this.state.isOpen) {
                this.state.unreadCount++;
                this.updateNotificationBadge();
            }
        });

        this.socketService.on('userJoined', (user: any) => {
            console.log('👋 User joined chat:', user);
            if (!this.state.onlineUsers) this.state.onlineUsers = [];
            if (!this.state.onlineUsers.find(u => u.id === user.id)) {
                this.state.onlineUsers.push({
                    id: user.id,
                    username: user.nickName || user.login,
                    avatar: user.avatar,
                    status: 'online'
                });
                this.renderOnlineUsers();
            }
        });

        this.socketService.on('userLeft', (user: any) => {
            console.log('👋 User left chat:', user);
            if (this.state.onlineUsers) {
                this.state.onlineUsers = this.state.onlineUsers.filter(u => u.id !== user.id);
                this.renderOnlineUsers();
            }
        });

        this.socketService.on('onlineUsersUpdated', (onlineUsers: any[]) => {
            console.log('🔄 Online users list updated:', onlineUsers);
            this.state.onlineUsers = onlineUsers.map(u => ({
                id: u.id,
                username: u.nickName || u.login,
                avatar: u.avatar,
                status: 'online'
            }));
        });

        this.socketService.on('authError', (error: string) => {
            console.error('❌ Chat auth error:', error);
        });

        this.socketService.on('error', (error: any) => {
            console.error('❌ Chat error:', error);
        });
    }

    private initializeChat() {
        this.createSocketClient();
        
        // Initialiser avec les messages de démo
        this.state.messages = this.messageService.getMessages();
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
        this.createChatPanel();
    }

    private closeChat() {
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel) {
            chatPanel.remove();
        }
    }

    private createChatPanel() {
        if (document.getElementById('chat-panel')) return;

        document.body.insertAdjacentHTML('beforeend', ChatPanel());
        this.setupPanelEventListeners();
        this.updateMessagesDisplay();
        this.renderOnlineUsers();
        this.renderRoomsSidebar();
        
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

        // Gestion de la recherche
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

    private sendMessage(content: string) {
        if (!content.trim()) return;

        if (this.socketService.isConnected()) {
            this.socketService.emit('sendMessage', {
                content: content.trim(),
                room: this.state.activeTab === 'global' ? 'global' : this.state.currentRoom?.id
            });
        } else {
            console.error('❌ Socket not connected');
        }
    }

    private renderMessages(): string {
        return this.state.messages.map(message => {
            const isOwn = message.userId === this.state.currentUserId;
            const time = formatTime(message.timestamp);
            
            let avatar;
            if (isOwn && this.state.avatar) {
                avatar = `<img src="${this.state.avatar}" alt="avatar" class="w-8 h-8 rounded-full object-cover shrink-0" />`;
            } else {
                avatar = createAvatarElement(message.username, message.avatarPath, 'md');
            }

            if (isOwn) {
                return `
                    <div class="flex items-start justify-end gap-2.5">
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col w-full max-w-[280px] leading-1.5 p-3 border border-gray-200 bg-black text-white rounded-s-xl rounded-ee-xl">
                                <div class="flex items-center justify-between space-x-2 mb-1">
                                    <span class="text-sm font-semibold">Moi</span>
                                    <span class="text-xs font-normal text-gray-300">${time}</span>
                                </div>
                                <p class="text-sm font-normal break-words">
                                    ${escapeHtml(message.content)}
                                </p>
                                <span class="text-xs font-normal text-gray-300 mt-1">Vu</span>
                            </div>
                        </div>
                        ${avatar}
                    </div>
                `;
            } else {
                return `
                    <div class="flex items-start gap-2.5">
                        ${avatar}
                        <div class="flex flex-col gap-1">
                            <div class="flex flex-col w-full max-w-[280px] leading-1.5 p-3 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="text-sm font-semibold text-gray-900">${escapeHtml(message.username)}</span>
                                    <span class="text-xs font-normal text-gray-500">${time}</span>
                                </div>
                                <p class="text-sm font-normal text-gray-900 break-words">
                                    ${escapeHtml(message.content)}
                                </p>
                                <span class="text-xs font-normal text-gray-500 mt-1">Delivered</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    private switchRoom(roomId: string) {
        this.state.activeTab = roomId as any;
        this.state.currentRoom = this.state.rooms?.find(r => r.id === roomId) || null;
        this.updateMessagesDisplay();
    }

    private renderRoomsSidebar() {
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
            const avatar = createAvatarElement(f.username, f.avatar, 'sm');
            return `<div data-friend-id="${f.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-8 h-8">
                    ${avatar}
                    <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${statusColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${escapeHtml(f.username)}</div>
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
            const avatar = createAvatarElement(u.username, u.avatar, 'sm');
            return `<div data-online-id="${u.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-7 h-7">
                    ${avatar}
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 bg-green-500"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${escapeHtml(u.username)}</div>
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
            const avatar = createAvatarElement(u.username, u.avatar, 'sm');
            return `<div data-search-id="${u.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-7 h-7">
                    ${avatar}
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${statusColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${escapeHtml(u.username)}</div>
                </div>
                <button data-add-friend-id="${u.id}" class="text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded px-1 py-0.5">+</button>
            </div>`;
        }).join('');
    }

    private performUserSearch(term: string) {
        const results = this.messageService.searchUsers(term, this.state.onlineUsers || [], this.state.friends || []);
        this.state.searchResults = results;
        this.renderSearchResults();
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

    public addUnreadMessage() {
        this.state.unreadCount++;
        this.updateNotificationBadge();
    }
}
