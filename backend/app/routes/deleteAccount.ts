import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, JwtPayload } from '../types/userTypes.js'
// import { comparePassword } from '../utils/hashPassword.js'

export default {
    method: 'DELETE', 
    url: '/deleteAccount',
    handler: async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        try {
            const token = request.cookies?.token;

            if (!token) {
                const response: IUserReply[401] = { success: false, error: 'No authentication token' };
                reply.code(401).send(response);
                return;
            }

            const payload = reply.server.jwt.verify<JwtPayload>(token);
            const user = await User.findOneBy({ id: payload.id });

            if (!user) {
                const response: IUserReply[401] = { success: false, error: 'User not found' };
                reply.code(401).send(response);
                return;
            }

            await user.remove();

            const response: IUserReply[200] = { success: true };
            reply
                .clearCookie('token', {
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'lax',
                    maxAge: 4 * 60 * 60
                })
                .code(200)
                .send(response);

        } catch (error: any) {
            const response: IUserReply[401] = { success: false, error: 'Invalid JWT or authentication failed' };
            reply.code(401).send(response);
        }
    }
};
