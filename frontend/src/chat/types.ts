export interface Message {
    id: string;
    userId: string;
    username: string;
    content: string;
    avatarPath: string;
    timestamp: Date | string;
    type: 'public' | 'private' | 'system' | 'game-invitation';
    roomId?: string; // identifiant de la room (global, pong, snake ou id dynamique)
}

export interface ChatRoom {
    id: string;
    name: string;
    type: 'global' | 'private';
    messages: Message[];
    participants?: string[];
    unreadCount: number;
}

export interface Friend {
    id: string;
    username: string;
    avatar: string;
    status: 'online' | 'offline' | 'in-game';
}

export interface User {
    id: string;
    username: string;
    status: 'online' | 'offline' | 'in-game';
    avatar: string;
    friendList: Friend[];
    blockedList: string[]; // liste des IDs des utilisateurs bloqués
}

export interface ChatState {
    currentUserId: User;
    isOpen: boolean;
    activeTab: 'global' | 'pong' | 'snake' | 'private' | '';
    unreadCount: number;
    onlineUsers?: Friend[]; // utilisateurs actuellement connectés (non filtrés par amitié)
    searchResults?: Friend[]; // résultats de recherche coté UI
    searchTerm?: string; // terme de recherche courant
}

// export interface RecentContacts {


// }
