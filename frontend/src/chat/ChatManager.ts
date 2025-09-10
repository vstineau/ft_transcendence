// @ts-ignore
import type { ChatState, Message, ChatRoom } from './types';
import { ChatPanel } from './components/ChatPanel';
import { SocketService, UIprofileService } from './services';
import { formatTime, escapeHtml, createAvatarElement } from './utils';
import { CHAT_EVENTS } from './config';
import { eventsSocket, eventsMessages, eventsUsers, eventsRooms, eventsFriends } from './eventsChat';
import { navigateTo } from '../main';

export class ChatManager extends SocketService {
    private state: ChatState = {
        currentUserId: {} as any,
        isOpen: false,
        activeTab: 'global',
        unreadCount: 0,
        onlineUsers: [],
    };
    private profileUI?: UIprofileService;
    private profileUIAttached = false;

    constructor() {
        super();
        eventsSocket.call(this);
        eventsMessages.call(this);
        eventsUsers.call(this);
        eventsRooms.call(this);
        eventsFriends.call(this);
        this.profileUI_attached();
    }


    private profileUI_attached() {
        // Instanciation du mini UI profil (handlers à adapter selon ton routing/backend)
        this.profileUI = new UIprofileService({
            viewProfile: (userId: string) => {
                TODO: navigateTo('/pong/matchmaking/localgame');
            },
            privateMessage: (userId: string) => {
                this.startPrivateChat(userId);
            },
            block: (userId: string) => {
                //const set = new Set(this.state.currentUserId?.blockedList || []);
                //console.log('i blocked', userId);
                //set.add(userId);
                this.emit(CHAT_EVENTS.BLOCK_USER, { targetUserId: userId, currentUserId: this.state.currentUserId?.id });
                // Optionnel: rafraîchir UI si tu filtres des listes par bloqués
            },
            unblock: (userId: string) => {
                //this.state.currentUserId.blockedList = (this.state.currentUserId?.blockedList || []).filter(id => id !== userId);
                this.emit(CHAT_EVENTS.UNBLOCK_USER, { targetUserId: userId, currentUserId: this.state.currentUserId?.id });
            },
            isBlocked: (userId: string) => {
                return (this.state.currentUserId?.blockedList || []).includes(userId);
            },
            isSelf: (userId: string) => {
                return userId === this.state.currentUserId?.id;
            },
        });
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

    public openChat() {
        this.createChatPanel();
    }

    public closeChat() {
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
        this.updateCurrentRoomIndicator(this.state.activeTab);
        this.renderOnlineUsers();   
        this.renderSidebar();

        // Brancher le popover sur les conteneurs pertinents (une seule fois)
        if (this.profileUI && !this.profileUIAttached) {
            this.profileUI.attachToContainers([
                //'#messages-container',
                '#chat-online-users',
                '#chat-friends-list',
                '#chat-search-results',
            ]);
            this.profileUIAttached = true;
        }
        
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

        // Gestion des clics sur les rooms (Global, Pong, Snake, et rooms privées)
        const roomsContainer = document.getElementById('chat-rooms-list');
        if (roomsContainer) {
            roomsContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const roomElement = target.closest('[data-room-id]') as HTMLElement;
                
                if (roomElement) {
                    const roomId = roomElement.dataset.roomId;
                    console.log(`🎯 Clic sur room: ${roomId}`);
                    this.switchRoom(roomId!);
                }
            });
        }

        // Gestion des clics sur les utilisateurs en ligne pour créer des rooms privées
        const onlineUsersContainer = document.getElementById('chat-online-users');
        const friendsListContainer = document.getElementById('chat-friends-list');

        if (onlineUsersContainer) {
            onlineUsersContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const userElement = target.closest('[data-online-id]') as HTMLElement;
                
                if (userElement) {
                    const userId = userElement.dataset.onlineId;
                    console.log(`💬 Clic sur utilisateur: ${userId}`);
                    this.startPrivateChat(userId!);
                }
            });
        }
        if (friendsListContainer) {
            friendsListContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const userElement = target.closest('[data-friend-id]') as HTMLElement;
                if (userElement) {
                    const userId = userElement.dataset.friendId;
                    console.log(`💬 Clic sur ami: ${userId}`)
                    this.startPrivateChat(userId!)
                    }
            });
        }
    }

    private sendMessage(content: string) {
        if (!content.trim()) return;

        if (this.isConnected()) {
            this.emit('sendMessage', {
                content: content.trim(),
                room: this.state.activeTab
            });
        } else {
            console.error('❌ Socket not connected');
        }
    }

    private renderMessages(messages?: Message[]): string {
        const messagesToRender = messages || this.currentRoom?.messages;
        if (!messagesToRender) return '';
        return messagesToRender.map(message => {
            const isOwn = message.userId === this.state.currentUserId?.id;
            const time = formatTime(message.timestamp);
            
            let avatar;
            console.log('isOwn ? : ', isOwn);
            if (isOwn && this.state.currentUserId?.avatar) {
                avatar = `<img src="${this.state.currentUserId.avatar}" alt="avatar" class="w-8 h-8 rounded-full object-cover shrink-0" />`;
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
                        <div class="shrink-0" data-user-id="${this.state.currentUserId?.id}">${avatar}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="flex items-start gap-2.5">
                        <div class="shrink-0" data-user-id="${message.userId}">${avatar}</div>
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

    private async switchRoom(roomId: string) {
        console.log(`🔄 Changement vers room: ${roomId}`);
        
        // Mettre à jour l'état local
        this.state.activeTab = roomId as any;
        this.currentRoom = this.rooms?.find(r => r.id === roomId) || null;

        // Demander les messages de cette room au backend
        console.log(`📥 Chargement des messages pour room: ${roomId} + 'valeur de room.message[], ${this.currentRoom?.messages}'`);
        if (this.currentRoom?.messages.length === 0) {
            await this.loadRoomMessages(roomId);
        }

        // Actions spécifiques selon la room
        switch (roomId) {
            case 'global':
                console.log('💬 Chat global activé');
                break;
                
            case 'pong':
                console.log('🏓 Room Pong activée');
                // Rejoindre la room pong côté serveur
                this.emit(CHAT_EVENTS.JOIN_PUBLIC_ROOM, { room: 'pong' });
                break;
                
            case 'snake':
                console.log('🐍 Room Snake activée');
                this.emit(CHAT_EVENTS.JOIN_PUBLIC_ROOM, { room: 'snake' });
                break;
                
            default:
                console.log(`📁 Room personnalisée: ${roomId}`);
                // Si c'est une room privée, joindre avec le bon payload
                if (roomId.startsWith('private_')) {
                    const parts = roomId.replace('private_', '').split('_');
                    const otherUserId = parts.find(id => id !== this.state.currentUserId?.id);
                    if (otherUserId) {
                        this.emit(CHAT_EVENTS.JOIN_PRIVATE_ROOM, { targetUserId: otherUserId });
                    }
                } else {
                    this.emit(CHAT_EVENTS.JOIN_PUBLIC_ROOM, { room: roomId });
                }
                break;
        }
        
        // Mettre à jour la sélection visuelle
        this.updateRoomSelection(roomId);
        
        // Mettre à jour l'indicateur de room courante
        this.updateCurrentRoomIndicator(roomId);
        
        // Mettre à jour l'affichage des messages avec ceux de la nouvelle room
        this.updateMessagesDisplay();
    }
    
    
    private updateRoomSelection(activeRoomId: string) {
        // La sélection est maintenant gérée directement dans renderRoomsList()
        // Il suffit de re-rendre la liste des rooms
        this.renderRoomsList();
    }

    private updateCurrentRoomIndicator(roomId: string) {
        const indicatorElement = document.getElementById('current-room-indicator');
        const iconElement = document.getElementById('room-indicator-icon');
        const textElement = document.getElementById('room-indicator-text');
        
        if (!indicatorElement || !iconElement || !textElement) return;

        // Trouver la room correspondante
        const room = this.rooms?.find(r => r.id === roomId);
        
        let icon = '💬';
        let roomName = roomId;
        let bgColor = 'bg-gray-700'; // couleur par défaut
        
        if (room) {
            roomName = room.name;
            
            // Déterminer l'icône et la couleur selon le type de room
            if (room.id === 'global') {
                icon = '🌐';
                bgColor = 'bg-blue-600';
            } else if (room.id === 'pong') {
                icon = '🏓';
                bgColor = 'bg-red-600';
            } else if (room.id === 'snake') {
                icon = '🐍';
                bgColor = 'bg-green-600';
            } else if (room.type === 'private') {

                // Pour les rooms privées, afficher l'avatar avec le statut
                const otherUserId = room.participants?.find(id => id !== this.state.currentUserId?.id);
                const otherUser = this.state.onlineUsers?.find(u => u.id === otherUserId);
                
                if (otherUser) {
                    
                    const avatar = createAvatarElement(otherUser.username, otherUser.avatar, 'sm');
                    let statusColor = 'bg-gray-500';
                    if (otherUser.status === 'online') statusColor = 'bg-green-500';
                    else if (otherUser.status === 'in-game') statusColor = 'bg-yellow-500';
                    
                    if (otherUser.status === 'online') {
                        iconElement.innerHTML = `
                            <div class="relative w-4 h-4">
                                <div class="w-full h-full overflow-hidden rounded-full" style="font-size: 8px;">
                                    ${avatar.replace('w-7 h-7', 'w-4 h-4').replace('text-[10px]', 'text-[8px]')}
                                </div>
                                <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-700 ${statusColor}"></span>
                            </div>
                        `;
                    }
                    else if (otherUser.status === 'in-game')
                        iconElement.innerHTML = `
                            <div class="relative w-4 h-4">
                                <div class="w-full h-full overflow-hidden rounded-full" style="font-size: 8px;">
                                    ${avatar.replace('w-7 h-7', 'w-4 h-4').replace('text-[10px]', 'text-[8px]')}
                                </div>
                                <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-700 ${statusColor}"></span>
                            </div>
                    `;
                    else if (otherUser.status === 'offline') {
                        iconElement.innerHTML = `
                            <div class="relative w-4 h-4">
                                <div class="w-full h-full overflow-hidden rounded-full" style="font-size: 8px;">
                                    ${avatar.replace('w-7 h-7', 'w-4 h-4').replace('text-[10px]', 'text-[8px]')}
                                </div>
                                <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-700 ${statusColor}"></span>
                            </div>
                        `;
                    }
                } else {
                    icon = '👤';
                }
                bgColor = 'bg-gray-600';
            }
        }
        
        // Enlever toutes les classes de couleur et ajouter la nouvelle
        indicatorElement.className = indicatorElement.className.replace(/bg-\w+-\d+/g, '');
        indicatorElement.classList.add(bgColor);
        
        // Seulement mettre à jour l'icône si ce n'est pas une room privée (car on a déjà mis l'avatar)
        if (!room || room.type !== 'private' || !room.participants?.find(id => id !== this.state.currentUserId?.id)) {
            iconElement.textContent = icon;
        }
        
        textElement.textContent = roomName;
    }

    private renderSidebar() {
        this.renderFriendsList();
        this.renderOnlineUsers();
        this.renderSearchResults();
        this.renderRoomsList();
    }

    private renderRoomsList() {
        const container = document.getElementById('chat-rooms-list');
        if (!container) return;

        const rooms = this.rooms || [];
        
        container.innerHTML = rooms.map(room => {
            const isActive = room.id === this.state.activeTab;
            const activeClass = isActive ? 'bg-gray-700' : '';
            
            // Déterminer l'icône et la couleur selon le type de room
            let iconHtml = '';
            let colorClass = 'bg-gray-500';
            
            if (room.id === 'global') {
                iconHtml = '<span class="text-[10px] text-gray-500">🌐</span>';
                colorClass = 'bg-blue-500';
            } else if (room.id === 'pong') {
                iconHtml = '<span class="text-[10px] text-gray-500">🏓</span>';
                colorClass = 'bg-red-500';
            } else if (room.id === 'snake') {
                iconHtml = '<span class="text-[10px] text-gray-500">🐍</span>';
                colorClass = 'bg-green-500';
            } else if (room.type === 'private') {
                // Pour les rooms privées, afficher l'avatar avec le statut
                const otherUserId = room.participants?.find(id => id !== this.state.currentUserId?.id);
                const otherUser = this.state.onlineUsers?.find(u => u.id === otherUserId);

                if (otherUser) {
                    const avatar = createAvatarElement(otherUser.username, otherUser.avatar, 'sm');
                    const statusColor = otherUser.status === 'online' ? 'bg-green-500' : 
                                      otherUser.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500';
                    
                    iconHtml = `
                        <div class="relative w-5 h-5">
                            <div class="w-full h-full overflow-hidden rounded-full">
                                ${avatar.replace('w-7 h-7', 'w-5 h-5').replace('text-[10px]', 'text-[8px]')}
                            </div>
                            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-900 ${statusColor}"></span>
                        </div>
                    `;
                } else {
                    iconHtml = '<span class="text-[10px] text-gray-500">👤</span>';
                }
                colorClass = 'bg-gray-500';
            }

            return `
                <div data-room-id="${room.id}" class="flex items-center px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer group ${activeClass}">
                    <div class="w-2 h-2 ${colorClass} rounded-full mr-2"></div>
                    <span class="text-xs font-medium flex-1 truncate">${escapeHtml(room.name)}</span>
                    <div class="ml-auto">${iconHtml}</div>
                    ${room.unreadCount > 0 ? `<span class="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">${room.unreadCount}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    private renderFriendsList() {
        const list = document.getElementById('chat-friends-list');
        if (!list) return;

        const friends = this.state.currentUserId?.friendList || [];
        if (!friends.length) {
            list.innerHTML = `<div class="text-[11px] text-gray-500 px-1">Aucun ami</div>`;
            return;
        }

        const online = new Map((this.state.onlineUsers || []).map(u => [u.id, u]));

        list.innerHTML = friends.map(f => {
            const ou = online.get(f.id);
            const status = ou?.status || f.status || 'offline';
            const statusColor = status === 'online' ? 'bg-green-500' : (status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500');
            const avatar = createAvatarElement(f.username, f.avatar, 'sm');
            return `<div data-friend-id="${f.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-8 h-8" data-user-id="${f.id}">
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
                <div class="relative w-7 h-7" data-user-id="${u.id}">
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
        const currentId = this.state.currentUserId?.id;
        const friendIds = new Set((this.state.currentUserId?.friendList || []).map(f => f.id));

        container.innerHTML = results.map(u => {
            const statusColor = u.status === 'online' ? 'bg-green-500' : (u.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500');
            const avatar = createAvatarElement(u.username, u.avatar, 'sm');
            const isSelf = u.id === currentId;
            const isFriend = friendIds.has(u.id);
            const buttonHtml = (!isSelf && !isFriend)
                ? `<button data-add-friend-id="${u.id}" class="text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded px-1 py-0.5">+</button>`
                : '';
            return `<div data-search-id="${u.id}" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
                <div class="relative w-7 h-7">
                    ${avatar}
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${statusColor}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-200 truncate">${escapeHtml(u.username)}</div>
                </div>
                ${buttonHtml}
            </div>`;
        }).join('');

        // Click handler: add friend
        container.querySelectorAll('[data-add-friend-id]')
            .forEach(btn => btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLElement).getAttribute('data-add-friend-id');
                if (!id) return;
                // Sécu: empêcher ajout de soi-même
                if (id === this.state.currentUserId?.id) return;
                // Sécu: empêcher ajout si déjà ami
                if ((this.state.currentUserId?.friendList || []).some(f => f.id === id)) return;
                this.emit(CHAT_EVENTS.ADD_FRIEND, { targetUserId: id });
            }));
    }

    private performUserSearch(term: string) {
        let results = this.state.onlineUsers || [];
        const currentId = this.state.currentUserId?.id;
        const friendIds = new Set((this.state.currentUserId?.friendList || []).map(f => f.id));
        // Filtrer: pas soi-même, pas ceux déjà amis
        results = results.filter(u => u.id !== currentId && !friendIds.has(u.id));
        this.state.searchResults = results;
        this.renderSearchResults();
    }

    private updateMessagesDisplay() {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            // Filtrer les messages pour afficher seulement ceux de la room active
            const currentRoom = this.state.activeTab; // 'global', 'pong' ou 'snake'
            const roomMessages = this.currentRoom?.messages.filter(msg => msg.roomId === currentRoom);
            if (roomMessages) {
                messagesContainer.innerHTML = this.renderMessages(roomMessages);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
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

    private showLoadingMessage(room: string, message: string) {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer && room === this.state.activeTab) {
            const loadingHtml = `
                <div id="loading-message" class="loading-message p-4 text-center text-gray-500">
                    <div class="flex items-center justify-center space-x-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>${message}</span>
                    </div>
                </div>
            `;
            messagesContainer.innerHTML = loadingHtml;
        }
    }

    private hideLoadingMessage() {
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    public addUnreadMessage() {
        this.state.unreadCount++;
        this.updateNotificationBadge();
    }

    private startPrivateChat(userId: string) {
        // Trouver l'utilisateur dans la liste des utilisateurs en ligne
        const targetUser = this.state.onlineUsers?.find(u => u.id === userId);
        if (!targetUser) {
            console.error('❌ Utilisateur non trouvé:', userId);
            return;
        }

        // Ne pas créer de room privée avec soi-même
        if (userId === this.state.currentUserId?.id) {
            console.warn('⚠️ Impossible de créer une room privée avec soi-même');
            return;
        }

        // Créer un ID de room privée basé sur les IDs des deux utilisateurs (ordre alphabétique pour cohérence)
        const roomId = this.createPrivateRoomId(this.state.currentUserId?.id, userId);

        // Vérifier si la room existe déjà
        const existingRoom = this.rooms?.find(r => r.id === roomId);
        
        if (!existingRoom) {
            // Créer une nouvelle room privée
            const newRoom: ChatRoom = {
                id: roomId,
                name: targetUser.username,
                type: 'private',
                messages: [],
                participants: [this.state.currentUserId?.id, userId],
                unreadCount: 0
            };

        // Ajouter la room à la liste
        if (!this.rooms) this.rooms = [];
            this.rooms.push(newRoom);

            console.log(`✅ Nouvelle room privée créée: ${roomId} avec ${targetUser.username}`);
        }

        // Changer vers cette room (la room sera créée côté serveur seulement lors de l'envoi du premier message)
        this.switchRoom(roomId);

        // Mettre à jour l'affichage des rooms
        this.renderSidebar();
    }

    private createPrivateRoomId(userId1: string, userId2: string): string {
        // Même logique que le backend pour s'assurer de la cohérence
        return `private_${[userId1, userId2].sort().join('_')}`;
    }

    private createAndShowPrivateRoom(message: Message) {
        console.log('💬 Message privé reçu, affichage de la room:', message.roomId);
        
        // Trouver l'expéditeur du message
        const sender = this.state.onlineUsers?.find(u => u.id === message.userId);
        if (!sender) {
            console.warn('⚠️ Expéditeur non trouvé:', message.userId);
            return;
        }

        const roomId = message.roomId!;
        
        // Vérifier si la room existe déjà dans la liste
        const existingRoom = this.rooms?.find(r => r.id === roomId);
        
        if (!existingRoom) {
            // Créer la room dans l'interface
            const newRoom: ChatRoom = {
                id: roomId,
                name: sender.username,
                type: 'private',
                participants: [this.state.currentUserId?.id, message.userId],
                messages: [message],
                unreadCount: 0
            };

            if (!this.rooms) this.rooms = [];
            this.rooms.push(newRoom);
            
            console.log(`✅ Room privée ajoutée: ${roomId} avec ${sender.username}`);
            
            // Mettre à jour l'affichage des rooms
            this.renderSidebar();
        }

    }

    private handleOutgoingPrivateMessage(message: Message) {
        console.log('📤 Message privé envoyé, s\'assurer que la room existe côté serveur:', message.roomId);
        
        // Extraire l'ID de l'autre utilisateur depuis le roomId
        const roomId = message.roomId;
        if (!roomId?.startsWith('private_')) return;
        
        // Extraire les IDs des participants depuis l'ID de la room (format: private_userId1_userId2)
        const userIds = roomId.replace('private_', '').split('_');
        const otherUserId = userIds.find(id => id !== this.state.currentUserId?.id);

        if (!otherUserId) return;
        
        // Déclencher startPrivateChat pour s'assurer que la room existe côté serveur
        // Cela permettra au destinataire d'avoir la room même après un refresh
        console.log(`🔄 Initialisation côté serveur de la room privée avec l'utilisateur ${otherUserId}`);
        this.emit(CHAT_EVENTS.JOIN_PRIVATE_ROOM, { 
            targetUserId: otherUserId
        });
    }

}
