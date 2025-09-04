import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models.js';
import { JwtPayload } from '../types/userTypes.js';

export default {
    method: 'GET',
    url: '/user/history',
    handler: async (request: FastifyRequest<{ Querystring: { type?: string } }>, reply: FastifyReply) => {
        try {
            // Vérifier le token dans les cookies (comme vos autres routes)
            const token = request.cookies?.token;
            if (!token) {
                return reply.code(401).send({ error: 'No token provided' });
            }

            const payload = reply.server.jwt.verify<JwtPayload>(token);

            const user = await User.findOne({
                where: { id: payload.id },
                relations: ['history']
            });

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            let history = user.history || [];

            if (request.query.type) {
                history = history.filter(h => h.type === request.query.type);
            }

            history.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

            return reply.send(history);

        } catch (error) {
            console.error('Error fetching user history:', error);
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
}