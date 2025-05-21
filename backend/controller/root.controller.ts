import { FastifyRequest, FastifyReply } from 'fastify';

export async function rootController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  reply.send({ message: 'backend!' });
}
