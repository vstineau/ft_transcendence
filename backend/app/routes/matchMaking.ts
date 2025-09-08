import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models.js';
import { IUserReply, JwtPayload } from '../types/userTypes.js';


// remove this file (no need, using WS)
export default {
	method: 'GET',
	url: '/game/matchmaking',
	handler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
		try {
			const token = request.cookies?.token;
			if (token) {
				const payload = reply.server.jwt.verify<JwtPayload>(token);
				const user = await User.findOneBy({ login: payload.login });
				if (!user) {
					// await user.remove()
					const response: IUserReply[401] = { success: true, error: 'user not logged in' }; //user: await user.getInfos() };
					reply.code(401).send(response);
					return;
				} else {
					// await user.remove()
					const response: IUserReply[200] = { success: true, user: await user.getInfos() };
					reply.code(200).send(response);
					return;
				}
			}
			// If no user or no token, consider as unauthorized
			const response: IUserReply[401] = { success: false, error: 'invalid JWT' };
			reply.code(401).send(response);
		} catch (error: any) {
			const response: IUserReply[401] = { success: false, error: 'invalid JWT' };
			reply.code(401).send(response);
		}
	},
};
