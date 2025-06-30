import { FastifyPluginCallback } from 'fastify';
//import { FastifyRequest, FastifyReply } from 'fastify';
import { User} from '../models.js'

import { IUserReply, UserJson } from '../types/userTypes.js'

export const userController: FastifyPluginCallback = (server, _opts, done) => {
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/resgister', async (request, reply) => {
		try {
			const user = await User.createUser(request.body); 
			await user.save();
			reply.code(200).send({ success: true });
		}
		catch (error) { 
			let errorMessage = 'unknown error';
			if (error instanceof Error) {
					errorMessage = error.message;
			}
			reply.code(500).send({ success: false, error: errorMessage});
		}
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
		done();
}
  //request: FastifyRequest<{ Body: UserJson}>,
  //reply: FastifyReply
