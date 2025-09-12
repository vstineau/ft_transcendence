import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, JwtPayload } from '../types/userTypes.js'

export default {
  method: 'GET',
  url: '/updateInfos',
  handler: async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const token = request.cookies?.token
      if (token) {
        const payload = reply.server.jwt.verify<JwtPayload>(token)
        const user = await User.findOneBy({ login: payload.login })
        if (user) {
	      const response : IUserReply[200] = {
            success: true,
            user: {
              id: user.id,
              login: user.login,
              nickName: user.nickName,
              email: user.email,
              avatar: user.avatar,
              twoFaAuth: user.twoFaAuth,
              favLang: user.favLang,
            }
          };
          reply.code(200).send(response);
          return
        }
      }
	  const response : IUserReply[401] = {success: false, error: 'invalid JWT'};
      reply.code(401).send(response);
    } catch (error: any) {
	  const response : IUserReply[401] = {success: false, error: 'invalid JWT'};
      reply.code(401).send(response);
    }
  }
}
