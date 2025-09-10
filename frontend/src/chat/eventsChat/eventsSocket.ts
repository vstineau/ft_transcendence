import { ChatManager } from '../ChatManager';
import { getCookie } from '../../pong/pong';
import { ChatState } from '../types';

export function eventsSocket(this: ChatManager) {

	// Événement de connexion au serveur
	this.on('connect', () => {
		console.log('💬 Chat socket connected');
		let cookie = getCookie('token');
		if (cookie) {
			this.emit('initUser', cookie);
		}
	});

	// Écouter les événements du serveur
	this.on('userConnected', (data: any) => {
		console.log('✅ Chat user connected:', data);
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
		}
		console.log('blockedList:', (this as any).state.currentUserId.blockedList);
		console.log('currentRoom = :', (this as any).currentRoom.id);
		(this as any).updateMessagesDisplay();
		(this as any).renderOnlineUsers();
	});

	this.on('authError', (error: string) => {
		console.error('❌ Chat auth error:', error);
	});

	this.on('error', (error: any) => {
		console.error('❌ Chat error:', error);
	});

}