import { FastifyRequest, FastifyReply } from 'fastify'

export default {
	method: 'GET',
	url: '/login/github/callback',
	handler: async (
		_request: FastifyRequest,
		_reply: FastifyReply
	) : Promise<void> => {
		try {
		//const {token} = await this.githubOAuth.getAccessTokenFromAuthorizationCodeFlow(request);
		} catch (error: any) {
		}
	}
}
