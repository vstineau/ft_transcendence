import { User } from '../models.js';
export default {
    method: 'DELETE',
    url: '/deleteAccount',
    handler: async (request, reply) => {
        try {
            const token = request.cookies?.token;
            if (!token) {
                const response = { success: false, error: 'No authentication token' };
                reply.code(401).send(response);
                return;
            }
            const payload = reply.server.jwt.verify(token);
            const user = await User.findOneBy({ id: payload.id });
            if (!user) {
                const response = { success: false, error: 'User not found' };
                reply.code(401).send(response);
                return;
            }
            await user.remove();
            const response = { success: true };
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
        }
        catch (error) {
            const response = { success: false, error: 'Invalid JWT or authentication failed' };
            reply.code(401).send(response);
        }
    }
};
//# sourceMappingURL=deleteAccount.js.map