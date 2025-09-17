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

  // Récupérer tous les utilisateurs
  getAllUsers(): ChatUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Trouver un utilisateur par son ID (et non par socketId).
  findUserById(userId: string): ChatUser | undefined {
    return Array.from(this.connectedUsers.values())
      .find(u => u.id === userId);
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
      console.warn(`Error updating user online status:`, error);
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
      console.warn(`Error updating blocked users:`, error);
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
      console.warn(`Error updating unblocked users:`, error);
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
