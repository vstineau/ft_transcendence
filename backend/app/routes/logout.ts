import { FastifyRequest, FastifyReply } from 'fastify'
import { IUserReply, UserJson } from '../types/userTypes.js'

export default {
  method: 'GET',
  url: '/logout',
  handler: async (
    _request: FastifyRequest<{ Body: UserJson }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
	  const response : IUserReply[200] = {success: true};
      reply
        .clearCookie('token', {
          httpOnly: false,
          secure: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 4 * 60 * 60
        })
        .code(200)
        .send(response);
    } catch (error: any) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
	  const response : IUserReply[400] = {success: false, error: errorMessage};
      reply.code(400).send(response);
    }
  }
}
