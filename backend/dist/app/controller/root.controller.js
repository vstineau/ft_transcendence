export const rootController = (server, _opts, done) => {
    server.get('/', async (request, reply) => {
        try {
            if (request.cookies.token) {
                server.jwt.verify(request.cookies.token);
                reply.code(200).send({ success: true });
            }
            else {
                reply.code(401).send({ success: false, error: "user not connected" });
            }
        }
        catch {
            reply.code(401).send({ success: false, error: "user not connected" });
        }
    });
    done();
};
//# sourceMappingURL=root.controller.js.map