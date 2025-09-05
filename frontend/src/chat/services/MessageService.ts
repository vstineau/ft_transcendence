// @ts-ignore
import type { Message, Friend, ChatState } from '../types';

/**
 * Service de gestion des messages du chat
 */
export class MessageService {
    private messages: Message[] = [];

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
        
        // Ajouter quelques faux utilisateurs pour la démo
        const mock: Friend[] = ['lucie','marc','patrick','zoe','lea'].map(name => ({ 
            id: 'mock-' + name, 
            username: name, 
            status: 'offline' as const
        }));
        
        const pool = [...base, ...mock];
        const lower = term.toLowerCase();
        const filtered = pool.filter(u => u.username.toLowerCase().includes(lower));
        
        // Retourner des utilisateurs uniques
        const unique: { [id: string]: Friend } = {};
        filtered.forEach(u => { unique[u.id] = u; });
        
        return Object.values(unique).slice(0, 20);
    }
}
