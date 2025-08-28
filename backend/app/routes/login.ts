import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, UserJson } from '../types/userTypes.js'
import { comparePassword } from '../utils/hashPassword.js'

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
      let isPasswordValid = false;
      if (user && request.body.password){
      	isPasswordValid = await comparePassword(request.body.password, user.password);
      }
      if (!user || !request.body.password || !isPasswordValid) {
        throw new Error(invalidInfoError)
      }
    if (user.twoFaAuth) {
      const tmpToken = reply.server.jwt.sign(
          { id: user.id, temp: true },
          { expiresIn: '10m' }
      )

      const response: IUserReply[200] = {
          success: true,
          twoFaAuth: true,
          tmpToken: tmpToken  // ← Ce champ manque !
      };
      reply.code(200).send(response);
      return; // ← Et ce return aussi !
  }
      const token = reply.server.jwt.sign(
        {
		  login: user.login,
		  email: user.email,
		  id: user.id,
		  twoFaAuth: user.twoFaAuth
		},
        { expiresIn: '4h' }
      )
	  const response : IUserReply[200] = {success: true, user:{avatar: user.avatar,
															nickName: user.nickName,
															login: user.login,
															email: user.email}};
      reply
        .setCookie('token', token, {
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
