import { ChatManager } from '../ChatManager';
import { getCookie } from '../../pong/pong';
import { CHAT_EVENTS } from '../config';

export function eventsSocket(this: ChatManager) {

	// Événement de connexion au serveur
	this.on('connect', () => {
		console.log('💬 Chat socket connected');
        let token = getCookie('token');
        if (token) {
            this.emit(CHAT_EVENTS.INIT_USER, token);
        }
	});

	// Écouter les événements du serveur
	this.on(CHAT_EVENTS.USER_CONNECTED, (data: any) => {
		// console.log('✅ Chat user connected:', data);
		(this as any).state.currentUserId.id = data.user.id;
		(this as any).state.currentUserId.avatar = data.user.avatar || '';
		(this as any).currentRoom.messages = data.recentMessages || [];
		(this as any).state.onlineUsers = data.onlineUsers || [];
		// Charger la friend list si fournie
		if (data.friendList) {
			(this as any).state.currentUserId.friendList = data.friendList;
			(this as any).renderFriendsList();
		}
		if (data.blockedList) {
			(this as any).state.currentUserId.blockedList = data.blockedList;
		};
		(this as any).updateMessagesDisplay();
		(this as any).renderOnlineUsers();
	});

	this.on(CHAT_EVENTS.AUTH_ERROR, (error: string) => {
		console.log('❌ Chat auth error:', error);
	});

	this.on(CHAT_EVENTS.ERROR, (error: any) => {
		console.log('❌ Chat error:', error);
	});

}
