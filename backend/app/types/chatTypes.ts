export interface ChatUser {
  id: string;
  socketId: string;
  login: string;
  nickName: string;
  avatar: string;
  status: 'online' | 'offline' | 'in-game';
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarPath: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'game-invitation';
  roomId: string; // Changé de 'room' à 'roomId' pour correspondre au frontend
}

export interface LoadingMessage {
  room: string;
  message: string;
}