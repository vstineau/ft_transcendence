import { User, History } from '../models.js';
export default {
    method: 'GET',
    url: '/snake/history/:userId',
    handler: async (request, reply) => {
        try {
            const { userId } = request.params;
            const targetUser = await User.findOne({ where: { id: userId } });
            if (!targetUser) {
                return reply.code(404).send({ error: 'User not found' });
            }
            const history = await History.find({
                where: {
                    user: { id: userId },
                    type: 'snake'
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
                            type: 'snake',
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
        }
        catch (error) {
            console.error('Error fetching user history:', error);
            return reply.code(500).send({ error: 'Server error' });
        }
    }
};
//# sourceMappingURL=historySnakeOther.js.map