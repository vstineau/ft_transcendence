import { User } from '../models.js';
export default {
    method: 'GET',
    url: '/updateInfos',
    handler: async (request, reply) => {
        try {
            const token = request.cookies?.token;
            if (token) {
                const payload = reply.server.jwt.verify(token);
                const user = await User.findOneBy({ login: payload.login });
                if (user) {
                    const response = {
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
    }
};
//# sourceMappingURL=updateInfosGet.js.map