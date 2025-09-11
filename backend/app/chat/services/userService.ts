import type { ChatUser } from '../../types/chatTypes.js';
import { User } from '../../models.js';
// import type { FastifyInstance } from 'fastify';

class UserService {
  private connectedUsers = new Map<string, ChatUser>();

  // Ajouter un utilisateur connecté
  addUser(socketId: string, user: ChatUser): void {
    this.connectedUsers.set(socketId, user);
  }

  // Retirer un utilisateur par son socketId
  removeUser(socketId: string): ChatUser | undefined {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
    }
    return user;
  }

  // Récupérer un utilisateur par son socketId
  getUser(socketId: string): ChatUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  // Récupérer tous les utilisateurs de la DB et fusionner avec l'état connecté
  async getAllUsers(): Promise<ChatUser[]> {
    try {
      const users = await User.find();
      // Indexer les connectés par userId
      const connectedById = new Map<string, ChatUser>();
      for (const cu of this.connectedUsers.values()) {
        connectedById.set(cu.id, cu);
      }

      return users.map(u => {
        const connected = connectedById.get(u.id);
        if (connected) {
          // Conserver le status en temps réel (online / in-game) et le socketId
          return {
            id: u.id,
            socketId: connected.socketId,
            login: u.login,
            nickName: u.nickName,
            avatar: u.avatar || connected.avatar || '',
            status: connected.status, // priorise l'état actuel du socket
            blocklist: u.blocklist || []
          } as ChatUser;
        }
        // Utilisateur non connecté au chat
        return {
          id: u.id,
          socketId: '',
          login: u.login,
          nickName: u.nickName,
          avatar: u.avatar || '',
          status: u.isOnline ? 'online' : 'offline', // fallback DB flag
          blocklist: u.blocklist || []
        } as ChatUser;
      });
    } catch (err) {
      console.error('Error fetching all users for chat:', err);
      return Array.from(this.connectedUsers.values());
    }
  }

  getAllConnectedUsers(): ChatUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Trouver un utilisateur connecté par son ID (accès socketId)
  findUserById(userId: string): ChatUser | undefined {
    for (const u of this.connectedUsers.values()) {
      if (u.id === userId) return u;
    }
    return undefined;
  }

  // status: 'online' | 'in-game'
  updateUserStatus(socketId: string, status: 'online' | 'in-game'): boolean {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      user.status = status;
      this.connectedUsers.set(socketId, user);
      return true;
    }
    return false;
  }

  // Mettre à jour le statut en ligne dans la DB
  async setUserOnline(userId: string, isOnline: boolean): Promise<void> {
    try {
      const dbUser = await User.findOneBy({ id: userId });
      if (dbUser) {
        dbUser.isOnline = isOnline;
        await dbUser.save();
      }
    } catch (error) {
      console.error(`Error updating user online status:`, error);
    }
  }

  // Ajouter à la blocklist l'utilisateur donné dans la DB
  async setBlockedUsers(userId: string, blockedUserIds: string[]): Promise<void> {
    try {
      const user = await User.findOneBy({ id: userId });
      if (user) {
          if (Array.isArray(user.blocklist)) {
            user.blocklist = [...user.blocklist, ...blockedUserIds];
            await user.save();
          }
        }
      } catch (error: any) {
      console.error(`Error updating blocked users:`, error);
    }
  }

  // Retirer de la blocklist l'utilisateur donné dans la DB
  async setUnblockedUsers(userId: string, unblockedUserIds: string[]): Promise<void> {
    try {
      const user = await User.findOneBy({ id: userId });
      if (user && Array.isArray(user.blocklist)) {
        user.blocklist = user.blocklist.filter(id => !unblockedUserIds.includes(id));
        await user.save();
      }
    } catch (error: any) {
      console.error(`Error updating unblocked users:`, error);
    }
  }


  // Créer un objet ChatUser à partir d'un User
  createChatUser(user: User, socketId: string): ChatUser {
    return {
      id: user.id.toString(),
      socketId: socketId,
      login: user.login,
      nickName: user.nickName,
      avatar: user.avatar || '',
      status: 'online',
      blocklist: user.blocklist || []
    };
  }
}

export const userService = new UserService();
