import { FastifyPluginCallback } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { User, UserJson } from '../models.js'

interface IUserReply {
	200: { success: boolean };
	302: { url: string };
	'4xx': { error: string };
}
export async function userController: FastifyPluginCallback = (server, unknown, done: any) => {
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/resgister', async (request, reply) => {
		const user = User.createUser(request.body); 
		const newUser = await user.save();
		reply.code(200).send({ success: true });
		// but this gives a type error
		reply.code(200).send('uh-oh');
		// it even works for wildcards
		reply.code(404).send({ error: 'Not found' });
		return `registered!`
	})		
	
//	server.post<{
//		Reply: FastifyReply,
//		Body: UserJson
//	}>('/login', async (request, reply) => {
//	  const { username, password } = request.query
//	  const customerHeader = request.headers['h-Custom']
//	  // do something with request data
//	
//	  // chaining .statusCode/.code calls with .send allows type narrowing. For example:
//	  // this works
//	  reply.code(200).send({ success: true });
//	  // but this gives a type error
//	  reply.code(200).send('uh-oh');
//	  // it even works for wildcards
//	  reply.code(404).send({ error: 'Not found' });
//	  return `logged in!`
//	})		
//	server.post<{
//		Reply: FastifyReply,
//		Body: UserJson
//	}>('/logout', async (request, reply) => {
//	  const { username, password } = request.query
//	  const customerHeader = request.headers['h-Custom']
//	  // do something with request data
//	
//	  // chaining .statusCode/.code calls with .send allows type narrowing. For example:
//	  // this works
//	  reply.code(200).send({ success: true });
//	  // but this gives a type error
//	  reply.code(200).send('uh-oh');
//	  // it even works for wildcards
//	  reply.code(404).send({ error: 'Not found' });
//	  return `logged in!`
//	})		
//	server.post<{
//		Reply: FastifyReply,
//		Body: UserJson
//	}>('/deleteAccount', async (request, reply) => {
//	  const { username, password } = request.query
//	  const customerHeader = request.headers['h-Custom']
//	  // do something with request data
//	
//	  // chaining .statusCode/.code calls with .send allows type narrowing. For example:
//	  // this works
//	  reply.code(200).send({ success: true });
//	  // but this gives a type error
//	  reply.code(200).send('uh-oh');
//	  // it even works for wildcards
//	  reply.code(404).send({ error: 'Not found' });
//	  return `logged in!`
//	})		
}
  //request: FastifyRequest<{ Body: UserJson}>,
  //reply: FastifyReply
