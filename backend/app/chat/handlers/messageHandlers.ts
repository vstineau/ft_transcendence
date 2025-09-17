// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { User } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { roomService } from '../services/roomService.js';
import { chatMessagesTotal } from '../../monitoring/metrics.js';
import { CHAT_CONFIG, CHAT_EVENTS } from '../config/chatConfig.js';

export async function handleSendMessage(
  socket: Socket,
  data: { content: string; room?: string },
  app: FastifyInstance,
  chatNamespace: any
): Promise<void> {
  const user = userService.getUser(socket.id);
  if (!user) {
    socket.emit(CHAT_EVENTS.ERROR, 'User not authenticated');
    return;
  }

  const room = data.room || CHAT_CONFIG.ROOMS.GLOBAL;

  // Vérifier l'accès à la room
  if (!roomService.validateRoomAccess(user.id, room)) {
    socket.emit(CHAT_EVENTS.ERROR, 'Access denied to this room');
    return;
  }
  
  try {
    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await SqliteDataSource.getRepository(User).findOne({
      where: { id: user.id }
    });

    if (!dbUser) {
      socket.emit(CHAT_EVENTS.ERROR, 'User not found in database');
      return;
    }

    // Créer et sauvegarder le message
    const broadcastMessage = await messageService.saveMessage(dbUser, data.content, room);
    
    if (!broadcastMessage) {
      socket.emit(CHAT_EVENTS.ERROR, 'Failed to save message');
      return;
    }
    
    // Diffuser le message à tous les utilisateurs de la room
    chatNamespace.to(room).emit(CHAT_EVENTS.NEW_MESSAGE, broadcastMessage);

    // Metrics: incrémenter le compteur de messages avec labels
    const roomType = roomService.isPrivateRoom(room)
      ? 'private'
      : roomService.isGlobalRoom(room)
        ? 'global'
        : roomService.isPongRoom(room)
          ? 'pong'
          : roomService.isSnakeRoom(room)
            ? 'snake'
            : 'other';
    try {
      chatMessagesTotal.inc({ room_type: roomType, room_id: room }, 1);
    } catch {}
    
    app.log.info(`Chat message from ${user.login}: ${data.content}`);
  } catch (error) {
    app.log.error('Error saving chat message:', error);
    socket.emit(CHAT_EVENTS.ERROR, 'Failed to save message');
  }
}

export async function handleGetMessageHistory(
  socket: Socket,
  data: { room: string; limit?: number },
  app: FastifyInstance
): Promise<void> {
  const user = userService.getUser(socket.id);
  if (!user) return;

  // Vérifier l'accès à la room
  if (!roomService.validateRoomAccess(user.id, data.room)) {
    socket.emit(CHAT_EVENTS.ERROR, 'Access denied to this room');
    return;
  }

  // Émettre l'événement de chargement
  socket.emit(CHAT_EVENTS.LOADING_MESSAGES, { 
    room: data.room, 
    message: CHAT_CONFIG.LOADING_MESSAGE 
  });

  const limit = data.limit || CHAT_CONFIG.MAX_RECENT_MESSAGES;
  
  try {
    const messages = await messageService.getRecentMessages(data.room, limit);
    socket.emit(CHAT_EVENTS.MESSAGE_HISTORY, { room: data.room, messages });
  } catch (error) {
    app.log.error('Error fetching message history:', error);
    socket.emit(CHAT_EVENTS.MESSAGE_HISTORY, { room: data.room, messages: [] });
  }
}
