// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { roomService } from '../services/roomService.js';
import { CHAT_EVENTS } from '../config/chatConfig.js';

export async function handleJoinPrivateRoom(
  socket: Socket,
  data: { targetUserId: string },
  app: FastifyInstance
): Promise<void> {
  const user = userService.getUser(socket.id);
  if (!user) return;

  const roomName = roomService.generatePrivateRoomName(user.id, data.targetUserId);
  socket.join(roomName);
  
  // Faire aussi joindre l'autre utilisateur à cette room privée
  const targetUser = userService.findUserById(data.targetUserId);
  if (targetUser && targetUser.socketId) {
    const targetSocket = socket.to(targetUser.socketId);
    targetSocket.socketsJoin(roomName);
    
    // Informer l'autre utilisateur qu'une room privée a été créée
    targetSocket.emit(CHAT_EVENTS.PRIVATE_ROOM_CREATED, { 
      roomName, 
      withUser: {
        id: user.id,
        username: user.nickName || user.login,
        avatar: user.avatar
      }
    });
  }
  
  // Récupérer l'historique des messages de cette room privée
  try {
    const roomMessages = await messageService.getRoomMessages(roomName);
    socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: roomMessages });
  } catch (error) {
    app.log.error('Error fetching room messages:', error);
    socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: [] });
  }
}
