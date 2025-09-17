// @ts-ignore
import type { Socket } from 'socket.io';
import type { FastifyInstance } from 'fastify';
import { User } from '../../models.js';
import { JwtPayload } from '../../types/userTypes.js';
import { userService } from '../services/userService.js';
import { messageService } from '../services/messageService.js';
import { CHAT_CONFIG, CHAT_EVENTS } from '../config/chatConfig.js';
import { buildFriendList } from './friendHandlers.js';
import { usersOnlineGauge } from '../../monitoring/metrics.js';

export async function handleInitUser(
  socket: Socket,
  token: string,
  app: FastifyInstance,
  chatNamespace: any
): Promise<void> {
  try {
    if (!token) {
      socket.emit(CHAT_EVENTS.AUTH_ERROR, 'No token provided');
      // console.log('No token provided on chat initUser');
      return;
    }

    // Vérifier le token JWT
    const payload = app.jwt.verify<JwtPayload>(token);
    const user = await User.findOneBy({ login: payload.login });

    if (!user) {
      socket.emit(CHAT_EVENTS.AUTH_ERROR, 'User not found');
      // console.log('User not found on chat initUser');
      return;
    }

    // Mettre à jour le statut en ligne
    await userService.setUserOnline(user.id, true);

    // Créer l'objet utilisateur de chat
    const chatUser = userService.createChatUser(user, socket.id);
    userService.addUser(socket.id, chatUser);

    // Rejoindre la room globale, Pong et snake
    socket.join(CHAT_CONFIG.ROOMS.GLOBAL);
    socket.join(CHAT_CONFIG.ROOMS.PONG);
    socket.join(CHAT_CONFIG.ROOMS.SNAKE);
    
  // Récupérer les messages récents et la friend list
  const recentMessages = await messageService.getRecentMessages(CHAT_CONFIG.ROOMS.GLOBAL);
  const friendList = await buildFriendList(user.id);
  const blockedList = user.blocklist || [];
    
    // Confirmer la connexion
    socket.emit(CHAT_EVENTS.USER_CONNECTED, {
      user: chatUser,
      onlineUsers: userService.getAllUsers(),
      recentMessages,
      friendList,
      blockedList
    });

    // console.log('User connected to chat:', user.login);

    // Notifier les autres utilisateurs
    socket.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(CHAT_EVENTS.USER_JOINED, chatUser);

    // Envoyer la liste complète mise à jour à tous
    chatNamespace.to(CHAT_CONFIG.ROOMS.GLOBAL).emit(
      CHAT_EVENTS.ONLINE_USERS_UPDATED,
      userService.getAllUsers()
    );

    app.log.info(`Chat user connected: ${user.login}`);

  // Metrics: utilisateurs en ligne
  try { usersOnlineGauge.set({ service: 'chat' }, userService.getAllUsers().length); } catch {}

  } catch (error) {
    app.log.error('Chat auth error:', error);
    socket.emit(CHAT_EVENTS.AUTH_ERROR, 'Invalid token');
  }
}
