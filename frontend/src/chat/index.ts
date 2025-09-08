// Point d'entrée principal du module chat
export { ChatManager } from './ChatManager';
export * from './components';
export * from './services';
export * from './utils';
export * from './types';
export * from './config';
export * from './eventsChat';

// Instance globale du chat (pour compatibilité avec l'existant)
import { ChatManager } from './ChatManager';
export const chatManager = new ChatManager();
