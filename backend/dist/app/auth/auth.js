import fastifyJwt from '@fastify/jwt';
export async function authJwt(fastify, opts) {
    fastify.register(fastifyJwt, {
        secret: opts.jwtSecret || 'secret_par_defaut'
    });
    console.log("jwt registered");
    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            let errMessage = "unknown auth error";
            if (err instanceof Error) {
                errMessage = err.message;
            }
            reply.code(401).send({ error: 'Unauthorized', details: errMessage });
        }
    });
}
//# sourceMappingURL=auth.js.map