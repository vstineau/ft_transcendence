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
		(this as any).messages = data.recentMessages || [];
		(this as any).state.onlineUsers = data.onlineUsers || [];
		(this as any).updateMessagesDisplay();
	});



}