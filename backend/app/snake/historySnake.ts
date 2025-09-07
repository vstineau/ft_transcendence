import { FastifyRequest, FastifyReply } from 'fastify';
import { User, History } from '../models.js'
import { JwtPayload } from '../types/userTypes.js';

export default {
    method: 'GET',
    url: '/user/history',
     handler: async (request: FastifyRequest<{ Querystring: { type?: string } }>, reply: FastifyReply) => {
        try {
            const token = request.cookies?.token;
            if (!token) {
                return reply.code(401).send({ error: 'No token provided' });
            }

            const payload = reply.server.jwt.verify<JwtPayload>(token);

            const user = await User.findOne({ where: { id: payload.id } });
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            // Requête directe sur la table History pour récupérer TOUTES les parties de l'utilisateur
            let history: History[] = await History.find({
                where: {
                    user: { id: payload.id },
                    ...(request.query.type && { type: request.query.type })
                },
                order: { date: 'DESC' }
            });

            // console.log('=== HISTORY DEBUG ===');
            // console.log('User ID:', payload.id);
            // console.log('Total history entries found:', history.length);

            // return reply.send(history);

            // Après avoir récupéré l'historique utilisateur
            const processedHistory = await Promise.all(history.map(async (game) => {
                if (game.opponent) {                    
                    const opponentGame = await History.findOne({
                        where: {
                            user: { login: game.opponent },
                            type: 'snake'
                        },
                        order: { date: 'DESC' }
                    });
                                        
                    return {
                        ...game,
                        opponentStats: opponentGame ? {
                            finalLength: opponentGame.finalLength,
                            gameTime: opponentGame.gameTime
                        } : null
                    };
                }
                return game;
            }));

            return reply.send(processedHistory);


        } catch (error) {
            console.error('Error fetching user history:', error);
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
}