import type { FastifyInstance } from 'fastify';
import type { Socket } from 'socket.io';
import { User, ChatMessage as ChatMessageEntity } from '../models.js';
import { JwtPayload } from '../types/userTypes.js';
import { SqliteDataSource } from '../dataSource.js';
import type { ChatUser, ChatMessage } from '../types/chatTypes.js';


// Stockage des utilisateurs connectés
const connectedUsers = new Map<string, ChatUser>();

export function setupChat(app: FastifyInstance) {
  const chatNamespace = (app as any).io.of('/chat');

  chatNamespace.on('connection', (socket: Socket) => {
    app.log.info({ id: socket.id }, 'Chat client connected');

    // ===== ÉVÉNEMENTS DU CHAT =====

    // 1. Initialisation utilisateur avec token JWT
    socket.on('initUser', async (token: string) => {
      try {
        if (!token) {
          socket.emit('authError', 'No token provided');
          console.log('No token provided on chat initUser');
          return;
        }

        // Vérifier le token JWT
        const payload = app.jwt.verify<JwtPayload>(token);
        const user = await User.findOneBy({ login: payload.login });

        if (!user) {
          socket.emit('authError', 'User not found');
          console.log('User not found on chat initUser');
          return;
        }

        // Mettre à jour le statut en ligne dans la base de données
        user.isOnline = true;
        await user.save();

        // Ajouter l'utilisateur aux connectés
        const chatUser: ChatUser = {
          id: user.id.toString(),
          socketId: socket.id,
          login: user.login,
          nickName: user.nickName,
          avatar: user.avatar || '',
          status: 'online'
        };

        connectedUsers.set(socket.id, chatUser);
        
        // Rejoindre la room globale
        socket.join('global');
        
        // Récupérer les messages récents depuis la base de données
        const recentMessages = await SqliteDataSource.getRepository(ChatMessageEntity)
          .find({
            where: { room: 'global' },
            order: { timestamp: 'DESC' },
            take: 50,
            relations: ['user']
          });

        // Convertir les messages pour le client
        const formattedMessages = recentMessages.reverse().map(msg => ({
          id: msg.id.toString(),
          userId: msg.user.id,
          username: msg.user.nickName,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type,
          room: msg.room
        }));
        
        // Confirmer la connexion
        socket.emit('userConnected', { 
          user: chatUser,
          onlineUsers: Array.from(connectedUsers.values()),
          recentMessages: formattedMessages
        });
        console.log('User connected to chat:', user.login);

        // Notifier les autres utilisateurs ET envoyer la liste complète à tous
        socket.to('global').emit('userJoined', chatUser);
        
        // Envoyer la liste complète mise à jour à tous les utilisateurs connectés
        chatNamespace.to('global').emit('onlineUsersUpdated', Array.from(connectedUsers.values()));
        
        app.log.info(`Chat user connected: ${user.login}`);

      } catch (error) {
        app.log.error('Chat auth error:', error);
        socket.emit('authError', 'Invalid token');
      }
    });

    // 2. Envoyer un message
    socket.on('sendMessage', async (data: { content: string; room?: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', 'User not authenticated');
        return;
      }

      const room = data.room || 'global';
      
      try {
        // Récupérer l'utilisateur depuis la base de données
        const dbUser = await SqliteDataSource.getRepository(User).findOne({
          where: { id: user.id }
        });

        if (!dbUser) {
          socket.emit('error', 'User not found in database');
          return;
        }

        // Créer et sauvegarder le message en base de données
        const chatMessage = new ChatMessageEntity(dbUser, data.content, room, 'text');
        await SqliteDataSource.getRepository(ChatMessageEntity).save(chatMessage);

        // Préparer le message pour la diffusion
        const broadcastMessage: ChatMessage = {
          id: chatMessage.id.toString(),
          userId: user.id,
          username: user.nickName,
          avatarPath: user.avatar || '',
          content: data.content,
          timestamp: chatMessage.timestamp,
          type: 'text',
          room: room
        };
        
        // Diffuser le message à tous les utilisateurs de la room
        chatNamespace.to(room).emit('newMessage', broadcastMessage);
        
        app.log.info(`Chat message from ${user.login}: ${data.content}`);
      } catch (error) {
        app.log.error('Error saving chat message:', error);
        socket.emit('error', 'Failed to save message');
      }
    });

    // 3. Rejoindre une room privée
    socket.on('joinPrivateRoom', async (data: { targetUserId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const roomName = `private_${[user.id, data.targetUserId].sort().join('_')}`;
      socket.join(roomName);
      
      // Récupérer l'historique des messages de cette room privée
      try {
        const roomMessages = await SqliteDataSource.getRepository(ChatMessageEntity)
          .find({
            where: { room: roomName },
            order: { timestamp: 'ASC' },
            take: 100,
            relations: ['user']
          });

        const formattedMessages = roomMessages.map(msg => ({
          id: msg.id.toString(),
          userId: msg.user.id,
          username: msg.user.nickName,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type,
          room: msg.room
        }));

        socket.emit('roomJoined', { roomName, messages: formattedMessages });
      } catch (error) {
        app.log.error('Error fetching room messages:', error);
        socket.emit('roomJoined', { roomName, messages: [] });
      }
    });

    // 4. Récupérer l'historique des messages d'une room
    socket.on('getMessageHistory', async (data: { room: string; limit?: number }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const limit = data.limit || 50;
      
      try {
        const messages = await SqliteDataSource.getRepository(ChatMessageEntity)
          .find({
            where: { room: data.room },
            order: { timestamp: 'DESC' },
            take: limit,
            relations: ['user']
          });

        const formattedMessages = messages.reverse().map(msg => ({
          id: msg.id.toString(),
          userId: msg.user.id,
          username: msg.user.nickName,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type,
          room: msg.room
        }));

        socket.emit('messageHistory', { room: data.room, messages: formattedMessages });
      } catch (error) {
        app.log.error('Error fetching message history:', error);
        socket.emit('messageHistory', { room: data.room, messages: [] });
      }
    });

    // 5. Inviter à un jeu
    socket.on('gameInvitation', (data: { targetUserId: string; gameType: 'pong' | 'snake' }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const targetUser = Array.from(connectedUsers.values())
        .find(u => u.id === data.targetUserId);

      if (targetUser) {
        chatNamespace.to(targetUser.socketId).emit('gameInvitationReceived', {
          from: user,
          gameType: data.gameType,
          invitationId: Date.now().toString()
        });
      }
    });

    // 6. Répondre à une invitation de jeu
    socket.on('gameInvitationResponse', (data: { invitationId: string; accepted: boolean; targetSocketId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      socket.to(data.targetSocketId).emit('gameInvitationAnswer', {
        from: user,
        accepted: data.accepted,
        invitationId: data.invitationId
      });
    });

    // 6. Changer de statut
    socket.on('statusChange', (status: 'online' | 'in-game') => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        user.status = status;
        connectedUsers.set(socket.id, user);
        
        // Notifier tous les utilisateurs du changement de statut
        chatNamespace.emit('userStatusChanged', {
          userId: user.id,
          status: status
        });
      }
    });

    // ===== DÉCONNEXION =====
    socket.on('disconnect', async () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        try {
          // Mettre à jour le statut hors ligne dans la base de données
          const dbUser = await User.findOneBy({ id: user.id });
          if (dbUser) {
            dbUser.isOnline = false;
            await dbUser.save();
          }
        } catch (error) {
          app.log.error('Error updating user offline status:', error);
        }

        connectedUsers.delete(socket.id);
        
        // Notifier les autres utilisateurs
        socket.to('global').emit('userLeft', user);
        
        // Envoyer la liste complète mise à jour à tous les utilisateurs connectés
        chatNamespace.to('global').emit('onlineUsersUpdated', Array.from(connectedUsers.values()));
        
        app.log.info(`Chat user disconnected: ${user.login}`);
      }
    });

    // ===== GESTION D'ERREURS =====
    socket.on('error', (error) => {
      app.log.error('Chat socket error:', error);
    });
  });

  // ===== FONCTIONS UTILITAIRES =====
  
  // Obtenir la liste des utilisateurs connectés
  //function getOnlineUsers(): ChatUser[] {
  //  return Array.from(connectedUsers.values());
  //}

  // Obtenir les messages d'une room
  //function getRoomMessages(room: string, limit: number = 50): ChatMessage[] {
  //  return chatMessages
  //    .filter(msg => msg.room === room)
  //    .slice(-limit);
  //}

  // Nettoyer les anciens messages (optionnel, pour éviter que la base de données devienne trop volumineuse)
  setInterval(async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Garder 30 jours de messages
      
      await SqliteDataSource.getRepository(ChatMessageEntity)
        .createQueryBuilder()
        .delete()
        .where('timestamp < :cutoffDate', { cutoffDate })
        .execute();
        
      app.log.info('Old chat messages cleaned up');
    } catch (error) {
      app.log.error('Error cleaning old messages:', error);
    }
  }, 24 * 60 * 60 * 1000); // Tous les jours
}
