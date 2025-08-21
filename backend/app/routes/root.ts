
import { FastifyRequest, FastifyReply } from 'fastify'
import { IUserReply } from '../types/userTypes.js'

// savoir si l'user est connecte
export default {
  method: 'GET',
  url: '/',
  handler: async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (request.cookies.token) {
        reply.server.jwt.verify(request.cookies.token)
		const response : IUserReply[200] = {success: true};
        reply.code(200).send(response);
      } else {
		const response : IUserReply[401] = {success: false, error: 'user not connected'};
      	reply.code(401).send(response);
      }
    } catch {
		const response : IUserReply[401] = {success: false, error: 'user not connected'};
      	reply.code(401).send(response);
    }
  }
}

