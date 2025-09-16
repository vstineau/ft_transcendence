// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { userService } from '../services/userService.js';
import { CHAT_CONFIG, CHAT_EVENTS } from '../config/chatConfig.js';
import { usersOnlineGauge } from '../../monitoring/metrics.js';

export async function handleDisconnect(
  socket: Socket,
  app: FastifyInstance,
  chatNamespace: any
): Promise<void> {
  const user = userService.removeUser(socket.id);

  if (user) {
    try {
      // Mettre à jour le statut hors ligne dans la base de données
      await userService.setUserOnline(user.id, false);
    } catch (error) {
      app.log.error('Error updating user offline status:', error);
    }

    // Notifier les autres utilisateurs
    socket.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.USER_LEFT, user);

    // Envoyer la liste complète mise à jour
    chatNamespace.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(
      CHAT_EVENTS.ONLINE_USERS_UPDATED,
      userService.getAllUsers()
    );

    // app.log.info(`Chat user disconnected: ${user.login}`);

  // Metrics: utilisateurs en ligne
  try { usersOnlineGauge.set({ service: 'chat' }, userService.getAllUsers().length); } catch {}
  }
}

export function handleSocketError(error: any, app: FastifyInstance): void {
  app.log.error('Chat socket error:', error);
}
