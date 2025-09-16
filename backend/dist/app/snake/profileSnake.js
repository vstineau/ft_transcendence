import { History, User } from '../models.js';
export default {
    method: 'GET',
    url: '/snake/profile',
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
            const userSnakeGames = await History.find({
                where: {
                    user: { id: payload.id },
                    type: 'snake'
                },
                order: { date: 'DESC' }
            });
            const totalGames = userSnakeGames.length;
            if (totalGames === 0) {
                return reply.send({
                    user: {
                        login: user.login,
                        nickName: user.nickName,
                        avatar: user.avatar
                    },
                    stats: {
                        ranking: 0,
                        maxSize: 0,
                        averageSize: 0,
                        eatenApples: 0,
                        totalGames: 0,
                        totalWins: 0
                    }
                });
            }
            const totalWins = userSnakeGames.filter(g => g.win === 'WIN').length;
            const maxSize = Math.max(...userSnakeGames.map(g => g.finalLength || 0), 0);
            const averageSize = totalGames > 0 ?
                Math.round(userSnakeGames.reduce((sum, g) => sum + (g.finalLength || 0), 0) / totalGames) : 0;
            const totalApples = userSnakeGames.reduce((sum, g) => sum + Math.max((g.finalLength || 1) - 1, 0), 0);
            const allSnakeGames = await History.find({
                where: { type: 'snake' },
                relations: ['user']
            });
            const playerStats = new Map();
            allSnakeGames.forEach(game => {
                if (!game.date || !game.user)
                    return;
                const playerLogin = game.user.login;
                if (!playerStats.has(playerLogin)) {
                    playerStats.set(playerLogin, {
                        login: playerLogin,
                        totalWins: 0,
                    });
                }
                const stats = playerStats.get(playerLogin);
                if (game.win === 'WIN') {
                    stats.totalWins++;
                }
            });
            const globalRanking = Array.from(playerStats.values())
                .sort((a, b) => b.totalWins - a.totalWins);
            const userRanking = globalRanking.findIndex(player => player.login === user.login) + 1;
            return reply.send({
                user: {
                    login: user.login,
                    nickName: user.nickName,
                    avatar: user.avatar
                },
                stats: {
                    ranking: userRanking,
                    maxSize,
                    averageSize,
                    eatenApples: totalApples,
                    totalGames,
                    totalWins
                }
            });
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
};
//# sourceMappingURL=profileSnake.js.map