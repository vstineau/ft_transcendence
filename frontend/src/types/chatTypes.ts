export interface Message {
    id: string;
    userId: string;
    username: string;
    content: string;
    avatarPath: string;
    timestamp: Date | string;
    type: 'text' | 'system' | 'game-invitation';
}

export interface ChatRoom {
    id: string;
    name: string;
    type: 'global' | 'private';
    participants?: string[];
    unreadCount: number;
}

export interface User {
    id: string;
    username: string;
    status: 'online' | 'offline' | 'in-game';
    avatar?: string;
}

export interface ChatState {
    currentUserId: string;
    avatar: string;
    isOpen: boolean;
    activeTab: 'global' | 'pong' | 'snake';
    currentRoom: ChatRoom | null;
    messages: Message[];
    unreadCount: number;
}
