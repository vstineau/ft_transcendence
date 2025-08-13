import { User } from '../models.js';
export const PongController = (server, _opts, done) => {
    server.get('/pong/matchmaking', async (request, reply) => {
        try {
            if (request.cookies.token) {
                const payload = server.jwt.verify(request.cookies.token);
                const user = await User.findOneBy({ login: payload.login });
                if (user) {
                    reply.code(200).send({ success: true, user: {
                            id: user.id,
                            login: user.login,
                            avatar: user.avatar
                        } });
                    console.log("user successfully retrieved");
                }
            }
        }
        catch (error) {
            reply.code(401).send({ success: false, error: "invalid JWT" });
        }
    });
    done();
};
//# sourceMappingURL=pong.controller.js.map