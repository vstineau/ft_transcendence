import { ChatRoom, ChatState, User} from '../types';


export class RoomsService {
	protected rooms: ChatRoom[] = [];
	protected currentRoom: ChatRoom | null = null;


	constructor() {
		this.rooms = [
			{ id: 'global', name: 'Global', type: 'global', unreadCount: 0 },
			{ id: 'pong', name: 'Pong', type: 'global', unreadCount: 0 },
			{ id: 'snake', name: 'Snake', type: 'global', unreadCount: 0 }
		];
		this.currentRoom = this.rooms[0];
	}

}