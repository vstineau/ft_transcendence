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
  
  // Récupérer l'historique des messages de cette room privée
  try {
    const roomMessages = await messageService.getRoomMessages(roomName);
    socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: roomMessages });
  } catch (error) {
    app.log.error('Error fetching room messages:', error);
    socket.emit(CHAT_EVENTS.ROOM_JOINED, { roomName, messages: [] });
  }
}
