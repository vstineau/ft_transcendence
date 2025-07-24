import { FastifyPluginCallback } from 'fastify';
//import { FastifyRequest, FastifyReply } from 'fastify';
//import { User} from '../models.js'
//
import { IUserReply } from '../types/userTypes.js'

//check validity of jwt on /api/ route
export const rootController: FastifyPluginCallback = (server, _opts, done) => {
	server.get<{ Reply: IUserReply }>('/', async (request, reply) => {
		try {
			if (request.cookies.token) {
				server.jwt.verify(request.cookies.token);
				reply.code(200).send({success: true});
			} else {
				reply.code(401).send({success: false, error: "user not connected"});
			}
		} catch {
			reply.code(401).send({success: false, error: "user not connected"});
		}
	})
	done();
}
