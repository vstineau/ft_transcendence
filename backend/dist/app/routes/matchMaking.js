import { User } from '../models.js';
export default {
    method: 'GET',
    url: '/game/matchmaking',
    handler: async (request, reply) => {
        try {
            const token = request.cookies?.token;
            if (token) {
                const payload = reply.server.jwt.verify(token);
                const user = await User.findOneBy({ login: payload.login });
                if (!user) {
                    const response = { success: true, error: 'user not logged in' };
                    reply.code(401).send(response);
                    return;
                }
                else {
                    const response = { success: true, user: await user.getInfos() };
                    reply.code(200).send(response);
                    return;
                }
            }
            const response = { success: false, error: 'invalid JWT' };
            reply.code(401).send(response);
        }
        catch (error) {
            const response = { success: false, error: 'invalid JWT' };
            reply.code(401).send(response);
        }
    },
};
//# sourceMappingURL=matchMaking.js.map