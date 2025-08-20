
import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, UserJson } from '../types/userTypes.js'
import { decryptSecret } from '../utils/encryption.js'
import speakeasy from 'speakeasy';

export default {
  method: 'POST',
  url: '/login2fa',
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
	  if (user.twoFaAuth && user.twoFaSecret && request.body.twoFaCode) {	
		const secret = decryptSecret(user.twoFaSecret);	
		const isValid = speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: request.body.twoFaCode,
			window: 1,
		});
		 if (!isValid) {
	 	   throw new Error("invalid 2fa code");		
	 	 }
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
	  const response : IUserReply[200] = {success: true};
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
