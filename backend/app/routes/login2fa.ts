
import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, JwtPayload } from '../types/userTypes.js'
import { decryptSecret } from '../utils/encryption.js'
import speakeasy from 'speakeasy';

export default {
    method: 'POST',
    url: '/login2fa',
    handler: async (
        request: FastifyRequest<{ Body: { token: string, login: string, tmpToken: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        try {
            // console.log('request.body:', request.body);

            const { token, login, tmpToken } = request.body

            if (!tmpToken || !login) {
                throw new Error('Missing required fields')
            }

            // Vérifiez le tmpToken pour la sécurité
            const decoded = reply.server.jwt.verify<JwtPayload>(tmpToken) as any

            // Cherchez par login comme vous voulez
            const user = await User.findOneBy({ id: decoded.id })

            // if(user) console.log('contenue login2fa:', user.login,);
            // Vérifiez que l'ID correspond au tmpToken (sécurité)
            if (!user) {
                throw new Error('Invalid session')
            }
            // if(user) console.log('2FA not cofig:', user.twoFaAuth, user.twoFaSecret);
            if (!user.twoFaAuth || !user.twoFaSecret) {
                throw new Error('2FA not configured')
            }

            const secret = decryptSecret(user.twoFaSecret);
            const isValid = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 1,
            });

            if (!isValid) {
                throw new Error("Invalid 2FA code");
            }

            const finalToken = reply.server.jwt.sign(
                {
                    login: user.login,
                    email: user.email,
                    id: user.id,
                    twoFaAuth: user.twoFaAuth
                },
                { expiresIn: '4h' }
            )

            const response: IUserReply[200] = {success: true};
            reply
                .setCookie('token', finalToken, {
                    httpOnly: false,
                    secure: true,
                    path: '/',
                    sameSite: 'lax',
                    maxAge: 4 * 60 * 60
                })
                .code(200)
                .send(response);

        } catch (error: any) {
            // console.log('LOGIN2FA ERROR:', error);
            let errorMessage = 'unknown error'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            const response: IUserReply[400] = {success: false, error: errorMessage};
            reply.code(400).send(response);
        }
    }
}
