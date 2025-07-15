import { FastifyPluginCallback } from 'fastify';
//import { FastifyRequest, FastifyReply } from 'fastify';
import { User} from '../models.js'
import { ValidationError } from 'class-validator';
import { IUserReply, UserJson, ILoginReply } from '../types/userTypes.js'

//pas oublier de changer le nom des images de profils 


export const userController: FastifyPluginCallback = (server, _opts, done) => {
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/register', async (request, reply) => {
		try {
			const user = await User.createUser(request.body); 
			await user.save();
			reply.code(200).send({ success: true });
		}
		catch (error) { 
			console.log(error);
			let errorMessage = 'unknown error';
			if (Array.isArray(error)) {
				error.forEach((err) => {
					if (err instanceof ValidationError) {
					    if (err.constraints && err.constraints.matches) {
					        errorMessage = err.constraints.matches;
					    } else if (err.constraints && err.constraints.isEmail) {
								errorMessage = err.constraints.isEmail;
						} else {
					        errorMessage = "Validation error";
					    }
					}
				});	
			}
			reply.code(500).send({ success: false, error: errorMessage});
		}
	})		
	server.post<{
		Reply: ILoginReply,
		Body: UserJson
	}>('/login', async (request, reply) => {
		try {
			const invalidInfoError = "the provided user details are invalid";
			const user = await User.findOneBy({login: request.body.login}); 
			if (!user) { }//console.log("user")}
			if (user && !user.comparePassword(request.body.password)) { console.log("compare password")}
			if (!user || !user.comparePassword(request.body.password)) {
				console.log("authentification failed !");
				throw invalidInfoError;
				}
			const token = server.jwt.sign(request.body, { expiresIn: '4h'});
			console.log("authentification succeed !");
			reply.code(200).send({ success: true, token: token});
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
