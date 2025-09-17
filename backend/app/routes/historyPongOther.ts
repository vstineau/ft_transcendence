import { FastifyRequest, FastifyReply } from 'fastify';
import { User, History } from '../models.js';

export default {
    method: 'GET',
    url: '/pong/history/:userId',
     handler: async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
        try {
            const { userId } = request.params;
            
            const targetUser = await User.findOne({ where: { id: userId } });
            if (!targetUser) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const history: History[] = await History.find({
                where: {
                    user: { id: userId },
                    type: 'pong'
                },
                order: { date: 'DESC' }
            });
            const processedHistory = await Promise.all(history.map(async (game) => {
                if (game.opponent) {
                    let opponentUser = await User.findOneBy({ id: game.opponent });
                    
                    const opponentGame = await History.findOne({
                        where: {
                            user: opponentUser ? { id: opponentUser.id } : { login: game.opponent },
                            date: game.date,
                            type: 'pong',
                        }
                    });

                    return {
                        ...game,
                        opponentLogin: opponentUser?.login || 'Unknown',
                        opponentStats: opponentGame ? {
                            finalLength: opponentGame.finalLength,
                            finalBallSpeed: opponentGame.finalBallSpeed,
                            gameTime: opponentGame.gameTime
                        } : null
                    };
                }
                return game;
            }));

            return reply.send(processedHistory);

        } catch (error) {
            console.log('Error fetching user history:', error);
            return reply.code(500).send({ error: 'Server error' });
        }
    }
}
