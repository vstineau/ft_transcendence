import { CHAT_EVENTS } from '../config';
import { ChatRoom, Message } from '../types';


export class RoomsService {
	protected rooms: ChatRoom[] = [];
	protected currentRoom: ChatRoom | null = null;
	// Evite les JOIN_PRIVATE_ROOM répétés pour une même room
	protected initializedPrivateRooms: Set<string> = new Set();


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
		// console.log(`Adding message to room ${message.roomId}:`, message);
		room?.messages.push(message);
	}

	// --- Unread counters API ---
	/**
	 * Increment the unread counter for a given room.
	 * Returns the new unread count or -1 if room not found.
	 */
	public incrementUnread(roomId: string, by: number = 1): number {
		const room = this.rooms.find(r => r.id === roomId);
		if (!room) return -1;
		room.unreadCount = Math.max(0, (room.unreadCount || 0) + by);
		return room.unreadCount;
	}

	/**
	 * Reset unread counter to 0 for a given room.
	 */
	public resetUnread(roomId: string): void {
		const room = this.rooms.find(r => r.id === roomId);
		if (room) room.unreadCount = 0;
	}

	/**
	 * Reset unread counters for all rooms.
	 */
	public resetAllUnread(): void {
		this.rooms.forEach(r => (r.unreadCount = 0));
	}

	/**
	 * Get unread count for a room (0 if not found).
	 */
	public getUnread(roomId: string): number {
		const room = this.rooms.find(r => r.id === roomId);
		return room?.unreadCount ?? 0;
	}

	/**
	 * Get total unread across all rooms.
	 */
	public getTotalUnread(): number {
		return this.rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
	}

	/**
	 * Helper to get a room by id.
	 */
	public getRoom(roomId: string): ChatRoom | undefined {
		return this.rooms.find(r => r.id === roomId);
	}

	public async loadRoomMessages(roomId: string) {
	try {
		// console.log(`📥 Chargement des messages pour room: ${roomId}`);
		
		// Émettre une demande de messages au backend

		(this as any).emit(CHAT_EVENTS.GET_MESSAGE_HISTORY, { room: roomId });

		} catch (error) {
		console.warn('❌ Erreur lors du chargement des messages:', error);
		}
	}

}