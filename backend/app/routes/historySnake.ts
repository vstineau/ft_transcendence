import { FastifyRequest, FastifyReply } from 'fastify';
import { User, History } from '../models.js';
import { JwtPayload } from '../types/userTypes.js';
// import { log } from 'console';

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

            const user = await User.findOneBy({id: payload.id});
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

            // Après avoir récupéré l'historique utilisateur
            const processedHistory = await Promise.all(history.map(async (game) => {
                if (game.opponent) {

                    // console.log("Opponent value:", game.opponent);
                    let opponentUser = await User.findOneBy({ id: game.opponent } );
                    // if (!opponentUser) {
                    //     // Si pas trouvé par ID, chercher par login (anciennes parties)
                    //     opponentUser = await User.findOne({ where: { login: game.opponent } });
                    // }

                    const opponentGame = await History.findOne({
                        where: {
                            user: opponentUser ? { id: opponentUser.id } : { login: game.opponent },
                            date: game.date,
                            type: request.query.type, 
                        }
                    });

                    // console.log("Found opponent user:", opponentUser?.login);

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
            return reply.code(401).send({ error: 'Invalid token' });
        }
    }
}
