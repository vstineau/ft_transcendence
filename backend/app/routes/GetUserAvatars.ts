import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models.js';

interface GetUserAvatarsRequest {
    userIds: string[];
}

export async function getUserAvatars(request: FastifyRequest<{ Body: GetUserAvatarsRequest }>, reply: FastifyReply) {
    try {
        const { userIds } = request.body;
        
        if (!userIds || !Array.isArray(userIds)) {
            return reply.status(400).send({ error: 'userIds array required' });
        }

        const users = await User.find({
            where: { id: { $in: userIds } as any },
            select: ['id', 'avatar']
        });

        const avatars: { [userId: string]: string } = {};
        users.forEach(user => {
            if (user.avatar) {
                avatars[user.id] = user.avatar;
            }
        });

        reply.send({ avatars });
    } catch (error) {
        console.error('Error getting user avatars:', error);
        reply.status(500).send({ error: 'Internal server error' });
    }
}
