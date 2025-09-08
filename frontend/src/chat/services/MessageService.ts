// @ts-ignore
import type { Message, Friend, ChatState } from '../types';

/**
 * Service de gestion des messages du chat
 */
export class MessageService {
    protected messages: Message[] = [];

    addMessage(message: Message): void {
        this.messages.push(message);
    }

    setMessages(messages: Message[]): void {
        this.messages = messages;
    }

    clearMessages(): void {
        this.messages = [];
    }

    // Recherche d'utilisateurs (simulation locale)
    searchUsers(term: string, onlineUsers: Friend[], friends: Friend[]): Friend[] {
        const base: Friend[] = [...(onlineUsers || []), ...(friends || [])];
        
        const pool = [...base];
        const lower = term.toLowerCase();
        const filtered = pool.filter(u => u.username.toLowerCase().includes(lower));
        
        // Retourner des utilisateurs uniques
        const unique: { [id: string]: Friend } = {};
        filtered.forEach(u => { unique[u.id] = u; });
        
        return Object.values(unique).slice(0, 20);
    }
}
