import { FastifyPluginCallback } from 'fastify';
//import { FastifyRequest, FastifyReply } from 'fastify';
//import { User} from '../models.js'
//
//import { IUserReply, UserJson } from '../types/userTypes.js'

export const rootController: FastifyPluginCallback = (server, _opts, done) => {
	server.get ('/', async (_request, reply) => {
			reply.code(200).send({message: "bien recu"})
	})
	done();
}
