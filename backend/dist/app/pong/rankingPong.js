import { History } from '../models.js';
export default {
    method: 'GET',
    url: '/pong/ranking',
    handler: async (_request, reply) => {
        try {
            const allPongGames = await History.find({
                where: { type: 'pong' },
                relations: ['user']
            });
            if (allPongGames.length === 0) {
                return reply.send([]);
            }
            const playerStats = new Map();
            allPongGames.forEach(game => {
                if (!game.date || !game.user)
                    return;
                const playerLogin = game.user.login;
                if (!playerStats.has(playerLogin)) {
                    playerStats.set(playerLogin, {
                        login: playerLogin,
                        nickName: game.user.nickName,
                        totalWins: 0,
                        totalGames: 0,
                        maxSpeed: 0,
                        bestTime: Infinity,
                        lastGameDate: null
                    });
                }
                const stats = playerStats.get(playerLogin);
                stats.totalGames++;
                if (game.win === 'WIN') {
                    stats.totalWins++;
                }
                if (game.finalBallSpeed && game.finalBallSpeed > stats.maxSpeed) {
                    stats.maxSpeed = game.finalBallSpeed;
                }
                if (game.gameTime && game.gameTime < stats.bestTime) {
                    stats.bestTime = game.gameTime;
                }
                if (!stats.lastGameDate || new Date(game.date) > new Date(stats.lastGameDate)) {
                    stats.lastGameDate = game.date;
                }
            });
            const ranking = Array.from(playerStats.values())
                .sort((a, b) => b.totalWins - a.totalWins)
                .slice(0, 4);
            return reply.send(ranking);
        }
        catch (error) {
            console.error('Error fetching ranking:', error);
            return reply.code(500).send({ error: 'Failed to fetch ranking' });
        }
    }
};
//# sourceMappingURL=rankingPong.js.map