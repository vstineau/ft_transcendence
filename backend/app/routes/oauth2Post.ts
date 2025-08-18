
import { FastifyRequest, FastifyReply } from 'fastify'
import { JwtPayload, IUserReply,UserJson } from '../types/userTypes.js'


export default {
	method: 'POST',
	url: '/login/github/callback',
	handler: async (
		request: FastifyRequest<(Body: UserJson )>,
		reply: FastifyReply
	) : Promise<void> => {
		try {
		} catch (error: any) {
		}
	}
}
