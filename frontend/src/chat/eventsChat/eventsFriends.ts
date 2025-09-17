import { ChatManager } from '../ChatManager';
import { CHAT_EVENTS } from '../config';

export function eventsFriends(this: ChatManager) {
	// Liste complète reçue (sync)
	this.on(CHAT_EVENTS.FRIEND_LIST_UPDATED, (friends: any[]) => {
		// console.log('👥 Friend list updated:', friends);
		(this as any).state.currentUserId.friendList = friends || [];
		(this as any).renderFriendsList();
	});

	// Confirmation d'ajout
	this.on(CHAT_EVENTS.FRIEND_ADDED, (friend: any) => {
		// console.log('✅ Friend added:', friend);
		const list = (this as any).state.currentUserId.friendList || [];
		const exists = list.some((f: any) => f.id === friend.id);
		if (!exists) {
			list.push({
				id: friend.id,
				username: friend.nickName || friend.login || friend.username,
				avatar: friend.avatar || '',
				status: friend.status || 'offline'
			});
			(this as any).state.currentUserId.friendList = list;
		}
		(this as any).renderFriendsList();
	});

	this.on(CHAT_EVENTS.DELETE_FRIEND, (friendId: string) => {
		// console.log('🗑️ Friend deleted:', friendId);
		const list = (this as any).state.currentUserId.friendList || [];
		(this as any).state.currentUserId.friendList = list.filter((f: any) => f.id !== friendId);
		(this as any).renderFriendsList();
	});

	// Erreur d'ajout
	this.on(CHAT_EVENTS.FRIEND_ERROR, (message: string) => {
		console.warn('❌ Friend error:', message);
	});
}