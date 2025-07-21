import { FastifyPluginCallback } from 'fastify';
import { User} from '../models.js'
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm'
import { IUserReply, UserJson, JwtPayload } from '../types/userTypes.js'

//pas oublier de changer le nom des images de profils pour eviter les injection de code bizarre

export const userController: FastifyPluginCallback = (server, _opts, done) => {
//REGISTER CONTROLLER
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
			let errorMessage = 'unknown error';
			if (Array.isArray(error)) {
				error.forEach((err) => {
					if (err instanceof ValidationError) {
					    if (err.constraints && err.constraints.matches) {
					        errorMessage = err.constraints.matches;
					    } else if (err.constraints && err.constraints.isEmail) {
								errorMessage = err.constraints.isEmail;
					    } else if (err.constraints && err.constraints.isLength) {
								errorMessage = err.constraints.isLength;
						} else {
					        errorMessage = "Validation error";
					    }
					}
				});	
			}
			else if (error instanceof QueryFailedError && error.driverError?.code === 'SQLITE_CONSTRAINT') {
					if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.email')) {
						errorMessage = 'this email is already used';
					}
					else if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.login')) {
						errorMessage = 'this login is already used';
					}
			}
			reply.code(400).send({ success: false, error: errorMessage});
		}
	})		
//LOGIN CONTROLLER
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/login', async (request, reply) => {
		try {
			const invalidInfoError = "the provided user details are invalid";
			const user = await User.findOneBy({login: request.body.login}); 
			if (!user) { }//console.log("user")}
			if (user && request.body.password && !user.comparePassword(request.body.password)) { console.log("compare password")}
			if (!user || (request.body.password && !user.comparePassword(request.body.password))) {
				console.log("authentification failed !");
				throw invalidInfoError;
				}
			const token = server.jwt.sign(request.body, { expiresIn: '4h'});
			console.log("authentification succeed !");
			reply.setCookie('token', token, {
					httpOnly: true,
					secure: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 4 * 60 * 60	
				}).code(200).send({ success: true});
		}
		catch (error) { 
			let errorMessage = 'unknown error';
			if (error instanceof Error) {
					errorMessage = error.message;
			}
			reply.code(400).send({ success: false, error: errorMessage});
		}
	})		
//LOGOUT CONTROLLER
	server.get<{
		Reply: IUserReply,
		Body: UserJson
	}>('/logout', async (_request, reply) => {
		try {
			console.log("logout successfully");
			reply.clearCookie('token', {
					httpOnly: true,
					secure: true,
					path: '/',
					sameSite: 'lax',
					maxAge: 4 * 60 *60
				}).code(200).send({ success: true});
		}
		catch (error) { 
			let errorMessage = 'unknown error';
			if (error instanceof Error) {
					errorMessage = error.message;
			}
			reply.code(400).send({ success: false, error: errorMessage});
		}
	})		
//DELETE ACCCOUNT CONTROLLER
	server.get<{
		Reply: IUserReply,
	}>('/deleteAccount', async (request, reply) => {
		try {
			if (request.cookies.token) {
				const payload = server.jwt.verify<JwtPayload>(request.cookies.token);
				const user = await User.findOneBy({login: payload.login});
				if (user) {
						user.remove();
						reply.clearCookie('token', {
								httpOnly: true,
								secure: true,
								path: '/',
								sameSite: 'lax',
								maxAge: 4 * 60 *60
							}).code(200).send({ success: true});
						console.log("user successfully deleted");
				} 
			}
		}
		catch (error) { 
			reply.code(401).send({ success: false, error: "invalid JWT"});
		}
	})		
//UPDATE USER INFO
	server.get<{
		Reply: IUserReply,
	}>('/updateInfos', async (request, reply) => {
		try {
			if (request.cookies.token) {
				const payload = server.jwt.verify<JwtPayload>(request.cookies.token);
				const user = await User.findOneBy({login: payload.login});
				if (user) {
						reply.code(200).send({ success: true,
							user: {	
								id: user.id,
								login: user.login,
								nickName: user.nickName,
								email: user.email,
						}});
				} 
			}
		}
		catch (error) { 
			reply.code(401).send({ success: false, error: "invalid JWT"});
		}
	})		
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/updateInfos', async (request, reply) => {
		try {
			if (request.cookies.token) {
				const payload = server.jwt.verify<JwtPayload>(request.cookies.token);
				const user = await User.findOneBy({login: payload.login});
				if (user) {
						request.body.login ? user.login = request.body.login : 0;
						request.body.nickName ? user.nickName = request.body.nickName : 0;
						request.body.email ? user.email = request.body.email : 0;
						if (request.body.password && request.body.newPassword 
							&& await user.comparePassword(request.body.password)) {
							user.password = request.body.newPassword;
						}
						console.log(user.getInfos());
						console.log('________________')
						await user.save();
						console.log(await user.getInfos());
						const token = server.jwt.sign(await user.getInfos(), { expiresIn: '4h'});
						console.log("JWT updated");
						reply.setCookie('token', token, {
								httpOnly: true,
								secure: true,
								path: '/',
								sameSite: 'lax',
								maxAge: 4 * 60 * 60	
							}).code(200).send({ success: true});
						console.log("user infos successfully updated");
				} 
			}
		}
		catch (error) { 
			let errorMessage = 'unknown error';
			if (Array.isArray(error)) {
				error.forEach((err) => {
					if (err instanceof ValidationError) {
					    if (err.constraints && err.constraints.matches) {
					        errorMessage = err.constraints.matches;
					    } else if (err.constraints && err.constraints.isEmail) {
								errorMessage = err.constraints.isEmail;
					    } else if (err.constraints && err.constraints.isLength) {
								errorMessage = err.constraints.isLength;
						} else {
					        errorMessage = "Validation error";
					    }
					}
				});	
			}
			else if (error instanceof QueryFailedError && error.driverError?.code === 'SQLITE_CONSTRAINT') {
					if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.email')) {
						errorMessage = 'this email is already used';
					}
					else if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.login')) {
						errorMessage = 'this login is already used';
					}
			}
			reply.code(400).send({ success: false, error: errorMessage});
		}
	})		
	done();
}
