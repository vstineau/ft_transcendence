import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, UserJson } from '../types/userTypes.js'

export default {
  method: 'POST',
  url: '/login',
  handler: async (
    request: FastifyRequest<{ Body: UserJson }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const invalidInfoError = 'the provided user details are invalid'
      const user = await User.findOneBy({ login: request.body.login })
      if (!user || !request.body.password || !user.comparePassword(request.body.password)) {
        throw new Error(invalidInfoError)
      }
      // NOTE: You might want to send only minimal info in the JWT, not the whole request.body
      const token = reply.server.jwt.sign(
        { login: user.login, email: user.email, id: user.id }, // safer than request.body
        { expiresIn: '4h' }
      )
	  const response : IUserReply[200] = {success: true};
      reply
        .setCookie('token', token, {
          httpOnly: true,
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
