import { CHAT_EVENTS } from '../config';
import { ChatRoom, Message } from '../types';


export class RoomsService {
	protected rooms: ChatRoom[] = [];
	protected currentRoom: ChatRoom | null = null;


	constructor() {
		this.rooms = [
			{ id: 'global', name: 'Global', type: 'global', unreadCount: 0, messages: [] },
			{ id: 'pong', name: 'Pong', type: 'global', unreadCount: 0, messages: [] },
			{ id: 'snake', name: 'Snake', type: 'global', unreadCount: 0, messages: [] }
		];
		this.currentRoom = this.rooms[0];

	}

	public addMessage(message: Message) {
		const room = message.roomId ? this.rooms.find(r => r.id === message.roomId) : null;
		console.log(`Adding message to room ${message.roomId}:`, message);
		room?.messages.push(message);
	}


	public async loadRoomMessages(roomId: string) {
	try {
		console.log(`📥 Chargement des messages pour room: ${roomId}`);
		
		// Émettre une demande de messages au backend

		(this as any).emit(CHAT_EVENTS.GET_MESSAGE_HISTORY, { room: roomId });

	} catch (error) {
		console.error('❌ Erreur lors du chargement des messages:', error);
	}
}


}