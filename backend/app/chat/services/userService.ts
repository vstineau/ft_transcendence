import type { ChatUser } from '../../types/chatTypes.js';
import { User } from '../../models.js';
// import type { FastifyInstance } from 'fastify';

class UserService {
  private connectedUsers = new Map<string, ChatUser>();

  addUser(socketId: string, user: ChatUser): void {
    this.connectedUsers.set(socketId, user);
  }

  removeUser(socketId: string): ChatUser | undefined {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
    }
    return user;
  }

  getUser(socketId: string): ChatUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getAllUsers(): ChatUser[] {
    return Array.from(this.connectedUsers.values());
  }

  findUserById(userId: string): ChatUser | undefined {
    return Array.from(this.connectedUsers.values())
      .find(u => u.id === userId);
  }

  updateUserStatus(socketId: string, status: 'online' | 'in-game'): boolean {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      user.status = status;
      this.connectedUsers.set(socketId, user);
      return true;
    }
    return false;
  }

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

  createChatUser(user: User, socketId: string): ChatUser {
    return {
      id: user.id.toString(),
      socketId: socketId,
      login: user.login,
      nickName: user.nickName,
      avatar: user.avatar || '',
      status: 'online'
    };
  }
}

export const userService = new UserService();
