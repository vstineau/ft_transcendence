// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { User } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { roomService } from '../services/roomService.js';
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
    
    // Diffuser selon le type de room
    if (roomService.isPrivateRoom(room)) {
      // S'assurer que l'expéditeur est dans la room
      socket.join(room);
      // Trouver l'autre participant et le joindre si connecté
      const ids = roomService.extractUserIdsFromPrivateRoom(room);
      const otherId = ids?.find(id => id !== user.id);
      if (otherId) {
        const target = userService.findUserById(otherId);
        if (target?.socketId) {
          chatNamespace.in(target.socketId).socketsJoin(room);
          // Notifier le destinataire qu'une room privée existe (si son UI doit la créer)
          chatNamespace.to(target.socketId).emit(CHAT_EVENTS.PRIVATE_ROOM_CREATED, {
            roomName: room,
            withUser: {
              id: user.id,
              username: dbUser.nickName || dbUser.login,
              avatar: dbUser.avatar || ''
            }
          });
          // Émettre directement le nouveau message
          chatNamespace.to(target.socketId).emit(CHAT_EVENTS.NEW_MESSAGE, broadcastMessage);
        }
      }
      // Émettre aussi à l'expéditeur
      socket.emit(CHAT_EVENTS.NEW_MESSAGE, broadcastMessage);
    } else {
      // Rooms publiques: broadcast dans la room
      chatNamespace.to(room).emit(CHAT_EVENTS.NEW_MESSAGE, broadcastMessage);
    }
    
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
