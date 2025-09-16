export default {
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
        try {
            if (request.cookies.token) {
                const payload = reply.server.jwt.verify(request.cookies.token);
                const response = { success: true, favLang: payload.favLang };
                reply.code(200).send(response);
            }
            else {
                const response = { success: false, error: 'user not connected' };
                reply.code(401).send(response);
            }
        }
        catch {
            const response = { success: false, error: 'user not connected' };
            reply.code(401).send(response);
        }
    }
};
//# sourceMappingURL=root.js.map