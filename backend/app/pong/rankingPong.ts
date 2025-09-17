import { FastifyRequest, FastifyReply } from 'fastify';
import { History } from '../models.js'
// import { JwtPayload } from '../types/userTypes.js';

export default {
    method: 'GET',
    url: '/pong/ranking',
    handler: async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Recup toutes les parties de pong
            const allPongGames = await History.find({
                where: { type: 'pong' },
                relations: ['user']
            });

            if (allPongGames.length === 0) {
                return reply.send([]);
            }

            // Calculer les statistiques par joueur
            const playerStats = new Map();

            allPongGames.forEach(game => {

				 if (!game.date || !game.user) return;
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

                // Garder la date de la dernière partie
                if (!stats.lastGameDate || new Date(game.date) > new Date(stats.lastGameDate)) {
                    stats.lastGameDate = game.date;
                }
            });

            // Convertir en array et trier par nombre de victoires
            const ranking = Array.from(playerStats.values())
                .sort((a, b) => b.totalWins - a.totalWins)
                .slice(0, 4); // Top 10

            return reply.send(ranking);

        } catch (error) {
            console.log('Error fetching ranking:', error);
            return reply.code(500).send({ error: 'Failed to fetch ranking' });
        }
    }
}
