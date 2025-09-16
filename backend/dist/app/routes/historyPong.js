import { User, History } from '../models.js';
export default {
    method: 'GET',
    url: '/user/history',
    handler: async (request, reply) => {
        try {
            const token = request.cookies?.token;
            if (!token) {
                return reply.code(401).send({ error: 'No token provided' });
            }
            const payload = reply.server.jwt.verify(token);
            const user = await User.findOne({ where: { id: payload.id } });
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            let history = await History.find({
                where: {
                    user: { id: payload.id },
                    ...(request.query.type && { type: request.query.type })
                },
                order: { date: 'DESC' }
            });
            const processedHistory = await Promise.all(history.map(async (game) => {
                if (game.opponent) {
                    console.log("Opponent value:", game.opponent);
                    let opponentUser = await User.findOneBy({ id: game.opponent });
                    const opponentGame = await History.findOne({
                        where: {
                            user: opponentUser ? { id: opponentUser.id } : { login: game.opponent },
                            date: game.date,
                            type: 'pong'
                        }
                    });
                    console.log("Found opponent user:", opponentUser?.login);
                    return {
                        ...game,
                        opponentLogin: opponentUser?.login || 'Unknown',
                        opponentStats: opponentGame ? {
                            finalLength: opponentGame.finalBallSpeed,
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
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
};
//# sourceMappingURL=historyPong.js.map