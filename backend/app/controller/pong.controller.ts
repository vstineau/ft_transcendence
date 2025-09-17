import { FastifyPluginCallback } from 'fastify';
import { User} from '../models.js'
// import { ValidationError } from 'class-validator';
// import { QueryFailedError } from 'typeorm'
import { IUserReply, JwtPayload} from '../types/userTypes.js'
// import { extname } from 'path'
// import { readFile } from 'fs/promises'

//pas oublier de changer le nom des images de profils pour eviter les injection de code bizarre

//Get user info
export const PongController: FastifyPluginCallback = (server, _opts, done) => {
	server.get<{
		Reply: IUserReply,
	}>('/pong/matchmaking', async (request, reply) => {
		try {
			if (request.cookies.token) {
				const payload = server.jwt.verify<JwtPayload>(request.cookies.token);
				const user = await User.findOneBy({login: payload.login});
				if (user) {
					reply.code(200).send({ success: true, user: {
						id: user.id,
						login: user.login,
						avatar: user.avatar,
						twoFaAuth: user.twoFaAuth,
					}});
					// console.log("user successfully retrieved");
				} 
			}
		}
		catch (error) {
			reply.code(401).send({ success: false, error: "invalid JWT"});
		}
	})		
	done();
}
