export default {
    method: 'GET',
    url: '/logout',
    handler: async (_request, reply) => {
        try {
            const response = { success: true };
            reply
                .clearCookie('token', {
                httpOnly: false,
                secure: true,
                path: '/',
                sameSite: 'lax',
                maxAge: 4 * 60 * 60
            })
                .code(200)
                .send(response);
        }
        catch (error) {
            let errorMessage = 'unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            const response = { success: false, error: errorMessage };
            reply.code(400).send(response);
        }
    }
};
//# sourceMappingURL=logout.js.map