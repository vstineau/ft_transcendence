import { FastifyRequest, FastifyReply } from 'fastify';
import { User as UserEntity, ChatMessage as ChatMessageEntity } from '../models.js';
import { JwtPayload } from '../types/userTypes.js';
import { ChatUser } from '../types/chatTypes.js';
import { Not } from 'typeorm';

export default {
    method: 'GET',
    url: '/chat/recent-contacts',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.cookies?.token;
            if (!token) {
                return reply.code(401).send({ error: 'No token provided' });
            }

            const payload = reply.server.jwt.verify<JwtPayload>(token);
            const currentUser = await UserEntity.findOne({ where: { id: payload.id } });

            if (!currentUser) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const recentMessages = await ChatMessageEntity.find({
                relations: ['user'],
                order: { timestamp: 'DESC' },
                take: 100
            });

            const contactsMap = new Map<string, ChatUser>();

            for (const message of recentMessages) {
                const isUserInvolved = message.user.id === currentUser.id ||
                                     (message.room && message.room.includes(currentUser.id));

                if (isUserInvolved && message.user.id !== currentUser.id && !contactsMap.has(message.user.id)) {
                    contactsMap.set(message.user.id, {
                        id: message.user.id,
                        socketId: '',
                        login: message.user.login,
                        nickName: message.user.nickName,
                        avatar: message.user.avatar,
                        status: message.user.isOnline ? 'online' : 'offline',
                        blocklist: message.user.blocklist || []
                    });
                    // if (contactsMap.size >= 3) break;
                }
            }

            let recentContacts: ChatUser[] = Array.from(contactsMap.values());

            // Completer avec des utilisateurs en ligne
            if (recentContacts.length < 3) {
            const additionalUsers = await UserEntity.find({
				where: {
					id: Not(currentUser.id)
				},
				take: 3 - recentContacts.length,
				order: { index: 'DESC' }
			});

            const existingIds = new Set(recentContacts.map(c => c.id));

            for (const user of additionalUsers) {
                if (!existingIds.has(user.id)) {
                    recentContacts.push({
                        id: user.id,
                        socketId: '',
                        login: user.login,
                        nickName: user.nickName,
                        avatar: user.avatar,
                        status: user.isOnline ? 'online' : 'offline',
                        blocklist: user.blocklist || []
                    });
                }
            }
        }

            return reply.send(recentContacts.slice(0, 3));

        } catch (error) {
            console.log('Error fetching recent contacts:', error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    }
};
