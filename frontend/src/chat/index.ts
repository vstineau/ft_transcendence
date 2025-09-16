// Point d'entrée principal du module chat
export { ChatManager } from './ChatManager';
export * from './components';
export * from './services';
export * from './utils';
export * from './types';
export * from './config';
export * from './eventsChat';
//export * from './recentContents';

// Instance globale du chat (pour compatibilité avec l'existant)
import { ChatManager } from './ChatManager';

export class ChatSingleton {
	private static instance: ChatSingleton;
	private chatManager: ChatManager;

	private constructor() {
		this.chatManager = new ChatManager();
	}

	public static getInstance(): ChatSingleton {
		if (!ChatSingleton.instance) {
			ChatSingleton.instance = new ChatSingleton();
		}
		return ChatSingleton.instance;
	}
	
	public get Manager() : ChatManager {
		return this.chatManager;
	}

}
