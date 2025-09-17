// @ts-ignore
import { ChatMessage as ChatMessageEntity } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
import type { ChatMessage, ChatUser } from '../../types/chatTypes.js';
import { CHAT_CONFIG } from '../config/chatConfig.js';
import type { User } from '../../models.js';

class MessageService {
  
  async getRecentMessages(room: string, limit: number = CHAT_CONFIG.MAX_RECENT_MESSAGES): Promise<ChatMessage[]> {
    try {
      const recentMessages = await SqliteDataSource.getRepository(ChatMessageEntity)
        .find({
          where: { room },
          order: { timestamp: 'DESC' },
          take: limit,
          relations: ['user']
        });

      return recentMessages.reverse().map((msg: any) => this.formatMessage(msg));
    } catch (error) {
      console.warn('Error fetching recent messages:', error);
      return [];
    }
  }

  async getRoomMessages(room: string, limit: number = CHAT_CONFIG.MAX_ROOM_MESSAGES): Promise<ChatMessage[]> {
    try {
      const messages = await SqliteDataSource.getRepository(ChatMessageEntity)
        .find({
          where: { room },
          order: { timestamp: 'ASC' },
          take: limit,
          relations: ['user']
        });

      return messages.map((msg: any) => this.formatMessage(msg));
    } catch (error) {
      console.warn('Error fetching room messages:', error);
      return [];
    }
  }

  async saveMessage(dbUser: User, content: string, room: string, type: 'text' | 'system' | 'game-invitation' = 'text'): Promise<ChatMessage | null> {
    try {
      const chatMessage = new ChatMessageEntity(dbUser, content, room, type);
      const savedMessage = await SqliteDataSource.getRepository(ChatMessageEntity).save(chatMessage);
      
      return {
        id: savedMessage.id.toString(),
        userId: dbUser.id,
        username: dbUser.nickName,
        avatarPath: dbUser.avatar || '',
        content: content,
        timestamp: savedMessage.timestamp,
        type: type,
        roomId: room,
        blockedList: dbUser.blocklist || []
      };
    } catch (error) {
      console.warn('Error saving message:', error);
      return null;
    }
  }

  formatMessage(msg: ChatMessageEntity): ChatMessage {
    return {
      id: msg.id.toString(),
      userId: msg.user.id,
      username: msg.user.nickName,
      avatarPath: msg.user.avatar || '',
      content: msg.content,
      timestamp: msg.timestamp,
      type: msg.type as 'text' | 'system' | 'game-invitation',
      roomId: msg.room,
      blockedList: msg.user.blocklist || []
    };
  }

  createBroadcastMessage(user: ChatUser, content: string, room: string): ChatMessage {
    return {
      id: Date.now().toString(), // Temporary ID, will be replaced when saved
      userId: user.id,
      username: user.nickName,
      avatarPath: user.avatar || '',
      content: content,
      timestamp: new Date(),
      type: 'text',
      roomId: room,
      blockedList: user.blocklist || []
    };
  }

  async cleanupOldMessages(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CHAT_CONFIG.MESSAGE_CLEANUP_DAYS);
      
      await SqliteDataSource.getRepository(ChatMessageEntity)
        .createQueryBuilder()
        .delete()
        .where('timestamp < :cutoffDate', { cutoffDate })
        .execute();
        
      // console.log('Old chat messages cleaned up');
    } catch (error) {
      console.warn('Error cleaning old messages:', error);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await SqliteDataSource.getRepository(ChatMessageEntity)
        .createQueryBuilder()
        .delete()
        .where('id = :messageId', { messageId })
        .execute();
        
      // console.log(`Message ${messageId} deleted`);
    } catch (error) {
      console.warn(`Error deleting message ${messageId}:`, error);
    }
  }
}

export const messageService = new MessageService();
