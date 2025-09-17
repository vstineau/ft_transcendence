// @ts-ignore
import type { FastifyInstance } from 'fastify';
// @ts-ignore
import type { Socket } from 'socket.io';

// Services
import { messageService } from './services/messageService.js';

// Handlers
import { handleInitUser } from './handlers/authHandlers.js';
import { handleSendMessage, handleGetMessageHistory } from './handlers/messageHandlers.js';
import { handleJoinPrivateRoom } from './handlers/roomHandlers.js';
import { handleGameInvitation, handleGameInvitationResponse, handleStatusChange } from './handlers/gameHandlers.js';
import { handleDisconnect, handleSocketError } from './handlers/connectionHandlers.js';
import { handleAddFriend, handleDeleteFriend } from './handlers/friendHandlers.js';
import { handleBlockUser } from './handlers/blockUserHandlers.js';

// Configuration
import { CHAT_CONFIG, CHAT_EVENTS } from './config/chatConfig.js';

export async function startChat(app: FastifyInstance) {
  const chatNamespace = app.io.of('/chat');

  chatNamespace.on('connection', (socket: Socket) => {
    app.log.info({ id: socket.id }, 'Chat client connected');

    // ===== AUTHENTIFICATION =====
    socket.on(CHAT_EVENTS.INIT_USER, async (token: string) => {
      await handleInitUser(socket, token, app, chatNamespace);
    });

    // ===== MESSAGES =====
    socket.on(CHAT_EVENTS.SEND_MESSAGE, (data: { content: string; room?: string }) => 
      handleSendMessage(socket, data, app, chatNamespace)
    );

    socket.on(CHAT_EVENTS.GET_MESSAGE_HISTORY, (data: { room: string; limit?: number }) => 
      handleGetMessageHistory(socket, data, app)
    );

    socket.on(CHAT_EVENTS.DELETE_MESSAGE, (data: { messageId: string }) => {
      messageService.deleteMessage(data.messageId);
    });

    // ===== ROOMS =====
    socket.on(CHAT_EVENTS.JOIN_PRIVATE_ROOM, (data: { targetUserId: string }) => 
      handleJoinPrivateRoom(socket, data, app)
    );

    socket.on(CHAT_EVENTS.JOIN_PUBLIC_ROOM, (data: { room: 'global' | 'pong' | 'snake' }) => {
      console.log(`🔄 Rejoindre la room publique: ${data.room}`);
      socket.join(data.room);
    });

    // ===== FRIENDS =====
    socket.on(CHAT_EVENTS.ADD_FRIEND, (data: { targetUserId: string, currentUserId: string }) => 
      handleAddFriend(socket, data, app)
    );

    socket.on(CHAT_EVENTS.DELETE_FRIEND, (data: { targetUserId: string, currentUserId: string }) => 
      handleDeleteFriend(socket, data, app)
    );

    // ==== BLOCK / UNBLOCK =====
    socket.on(CHAT_EVENTS.BLOCK_USER, (data: { targetUserId: string, currentUserId: string }) => {
      handleBlockUser(socket, data, app);
      // console.log(`🔒 Bloquer l'utilisateur: ${data.targetUserId}`);
    });

    socket.on(CHAT_EVENTS.UNBLOCK_USER, (data: { targetUserId: string, currentUserId: string }) => {
      handleBlockUser(socket, data, app);
      // console.log(`🔓 Débloquer l'utilisateur: ${data.targetUserId}`);
    });

    // ===== JEUX =====
    socket.on(CHAT_EVENTS.GAME_INVITATION, (data: { targetUserId: string; gameType: 'pong' | 'snake' }) => 
      handleGameInvitation(socket, data, chatNamespace)
    );

    socket.on(CHAT_EVENTS.GAME_INVITATION_RESPONSE, (data: { invitationId: string; accepted: boolean; targetSocketId: string }) => 
      handleGameInvitationResponse(socket, data)
    );

    socket.on(CHAT_EVENTS.STATUS_CHANGE, (data: {userId: string; status: 'online' | 'in-game' }) => {
        handleStatusChange(socket, data, chatNamespace)
    });

    // ===== CONNEXION =====
    socket.on('disconnect', () => 
      handleDisconnect(socket, app, chatNamespace)
    );

    socket.on(CHAT_EVENTS.ERROR, (error: any) => 
      handleSocketError(error, app)
    );
  });

  // ===== NETTOYAGE AUTOMATIQUE =====
  setInterval(() => {
    messageService.cleanupOldMessages();
  }, CHAT_CONFIG.CLEANUP_INTERVAL);

  app.log.info('Chat service initialized');
}
