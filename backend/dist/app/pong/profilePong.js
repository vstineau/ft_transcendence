import { History, User } from '../models.js';
export default {
    method: 'GET',
    url: '/pong/profile',
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
            const userPongGames = await History.find({
                where: {
                    user: { id: payload.id },
                    type: 'pong'
                },
                order: { date: 'DESC' }
            });
            const totalGames = userPongGames.length;
            if (totalGames === 0) {
                return reply.send({
                    user: {
                        login: user.login,
                        nickName: user.nickName,
                        avatar: user.avatar
                    },
                    stats: {
                        ranking: 0,
                        maxSpeed: 0,
                        averageSpeed: 0,
                        totalGoals: 0,
                        totalGames: 0,
                        totalWins: 0
                    }
                });
            }
            const totalWins = userPongGames.filter(g => g.win === 'WIN').length;
            const maxSpeed = Math.max(...userPongGames.map(g => g.finalBallSpeed || 0), 0);
            const averageSpeed = totalGames > 0 ?
                Math.round(userPongGames.reduce((sum, g) => sum + (g.finalBallSpeed || 0), 0) / totalGames) : 0;
            const totalGoals = userPongGames.reduce((sum, g) => sum + parseInt(g.score || '0'), 0);
            const allPongGames = await History.find({
                where: { type: 'pong' },
                relations: ['user']
            });
            const playerStats = new Map();
            allPongGames.forEach(game => {
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
                    maxSpeed: maxSpeed,
                    averageSpeed: averageSpeed,
                    totalGoals: totalGoals,
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
//# sourceMappingURL=profilePong.js.map