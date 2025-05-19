import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback, FastifyPluginOptions } from "fastify";

const rootController: FastifyPluginCallback = (fastify: FastifyInstance, _options: FastifyPluginOptions, done) => {
	fastify.get('/', (_req: FastifyRequest, reply: FastifyReply) => {
		reply.send({
			message: "hello root\n"
		});
	});
	done();
};

export default rootController;
