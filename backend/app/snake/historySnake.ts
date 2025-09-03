import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models.js';
import { JwtPayload } from '../types/userTypes.js';

// export default {
//     method: 'GET',
//     url: '/api/user/history',
//     handler: async (_request: any, reply: any) => {
//         reply.send([{ test: 'route works' }]);
//     }
// }

// export default {
//     method: 'GET',
//     url: '/api/user/history',
//         handler: async (request: FastifyRequest<{ Querystring: { type?: string } }>, reply: FastifyReply) => {
//         console.log('=== HISTORY ROUTE CALLED ===');
//         console.log('Query params:', request.query);
//         console.log('User from JWT:', request.user);

//         try {
//             const payload = request.user as JwtPayload;
//             console.log('Payload login:', payload.login);

//             const user = await User.findOne({
//                 where: { login: payload.login },
//                 relations: ['history']
//             });

//             console.log('User found:', !!user);
//             console.log('User history length:', user?.history?.length || 0);

//             if (!user) {
//                 return reply.code(404).send({ error: 'User not found' });
//             }

//             let history = user.history || [];
//             console.log('Total history entries:', history.length);

//             if (request.query.type) {
//                 history = history.filter(h => h.type === request.query.type);
//                 console.log('Filtered history entries:', history.length);
//             }

//             console.log('Final history to send:', history);
//             return reply.send(history);

//         } catch (error) {
//             console.error('Error in history route:', error);
//             return reply.code(500).send({ error: 'Internal server error' });
//         }
//     }
// }


export default {
    method: 'GET',
    url: '/api/user/history',
    handler: async (request: FastifyRequest<{ Querystring: { type?: string } }>, reply: FastifyReply) => {
        try {
            // Vérifier le token dans les cookies (comme vos autres routes)
            const token = request.cookies?.token;
            if (!token) {
                return reply.code(401).send({ error: 'No token provided' });
            }

            const payload = reply.server.jwt.verify<JwtPayload>(token);

            const user = await User.findOne({
                where: { login: payload.login },
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