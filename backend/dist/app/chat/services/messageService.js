import { ChatMessage as ChatMessageEntity } from '../../models.js';
import { SqliteDataSource } from '../../dataSource.js';
import { CHAT_CONFIG } from '../config/chatConfig.js';
class MessageService {
    async getRecentMessages(room, limit = CHAT_CONFIG.MAX_RECENT_MESSAGES) {
        try {
            const recentMessages = await SqliteDataSource.getRepository(ChatMessageEntity)
                .find({
                where: { room },
                order: { timestamp: 'DESC' },
                take: limit,
                relations: ['user']
            });
            return recentMessages.reverse().map((msg) => this.formatMessage(msg));
        }
        catch (error) {
            console.error('Error fetching recent messages:', error);
            return [];
        }
    }
    async getRoomMessages(room, limit = CHAT_CONFIG.MAX_ROOM_MESSAGES) {
        try {
            const messages = await SqliteDataSource.getRepository(ChatMessageEntity)
                .find({
                where: { room },
                order: { timestamp: 'ASC' },
                take: limit,
                relations: ['user']
            });
            return messages.map((msg) => this.formatMessage(msg));
        }
        catch (error) {
            console.error('Error fetching room messages:', error);
            return [];
        }
    }
    async saveMessage(dbUser, content, room, type = 'text') {
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
        }
        catch (error) {
            console.error('Error saving message:', error);
            return null;
        }
    }
    formatMessage(msg) {
        return {
            id: msg.id.toString(),
            userId: msg.user.id,
            username: msg.user.nickName,
            avatarPath: msg.user.avatar || '',
            content: msg.content,
            timestamp: msg.timestamp,
            type: msg.type,
            roomId: msg.room,
            blockedList: msg.user.blocklist || []
        };
    }
    createBroadcastMessage(user, content, room) {
        return {
            id: Date.now().toString(),
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
    async cleanupOldMessages() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - CHAT_CONFIG.MESSAGE_CLEANUP_DAYS);
            await SqliteDataSource.getRepository(ChatMessageEntity)
                .createQueryBuilder()
                .delete()
                .where('timestamp < :cutoffDate', { cutoffDate })
                .execute();
            console.log('Old chat messages cleaned up');
        }
        catch (error) {
            console.error('Error cleaning old messages:', error);
        }
    }
    async deleteMessage(messageId) {
        try {
            await SqliteDataSource.getRepository(ChatMessageEntity)
                .createQueryBuilder()
                .delete()
                .where('id = :messageId', { messageId })
                .execute();
            console.log(`Message ${messageId} deleted`);
        }
        catch (error) {
            console.error(`Error deleting message ${messageId}:`, error);
        }
    }
}
export const messageService = new MessageService();
//# sourceMappingURL=messageService.js.map