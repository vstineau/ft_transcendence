import { FastifyRequest, FastifyReply } from 'fastify';
import { User, History } from '../models.js';


export default {
    method: 'GET',
    url: '/pong/profile/:userId',
    handler: async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
        try {
            const { userId } = request.params;
            
            const targetUser = await User.findOne({ where: { id: userId } });
            if (!targetUser) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const userPongGames = await History.find({
                where: {
                    user: { id: userId },
                    type: 'pong'
                },
                order: { date: 'DESC' }
            });
            // Calculer les statistiques
            const totalGames = userPongGames.length;

            if (totalGames === 0) {
                // Aucune partie jouée - valeurs par défaut
                return reply.send({
                    user: {
                        login: targetUser.login,
                        nickName: targetUser.nickName,
                        avatar: targetUser.avatar
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

            // Calculer des pommes mangees (finalBallSpeed - 1 parce que le serpent commence avec 1 segment) calcul a revoir pas le meme que pour le snake
            const totalGoals = userPongGames.reduce((sum, g) => sum + parseInt(g.score || '0'), 0);
            // Calculer le classement (nombre de joueurs avec moins de victoires + 1)
            const allPongGames = await History.find({
                where: { type: 'pong' },
                relations: ['user']
            });

            const playerStats = new Map();
            allPongGames.forEach(game => {
                if (!game.date || !game.user) return;
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

                // Creer le ranking trie par victoires
                const globalRanking = Array.from(playerStats.values())
                    .sort((a, b) => b.totalWins - a.totalWins);

                // Trouver la position de l'utilisateur actuel
                const userRanking = globalRanking.findIndex(player => player.login === targetUser.login) + 1;

                return reply.send({
                    user: {
                        login: targetUser.login,
                        nickName: targetUser.nickName,
                        avatar: targetUser.avatar
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

        } catch (error) {
            console.log('Error fetching user profile:', error);
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
}
