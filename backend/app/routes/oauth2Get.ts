

import { FastifyRequest, FastifyReply } from 'fastify'
import { JwtPayload } from '../types/userTypes.js'
import { IUserReply,UserJson } from '../types/userTypes.js'


export default {
	method: 'GET',
	url: '/login/github/callback',
	handler: async (
		request: FastifyRequest,
		reply: FastifyReply
	) : Promise<void> => {
		try {
		//const {token} = await this.githubOAuth.getAccessTokenFromAuthorizationCodeFlow(request);
		} catch (error: any) {
		}
	}
}
