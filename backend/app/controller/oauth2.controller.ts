
import { FastifyPluginCallback } from 'fastify';
//import { User} from '../models.js'
//import { ValidationError } from 'class-validator';
//import { QueryFailedError } from 'typeorm'
//import { IUserReply, UserJson, JwtPayload, defaultAvatars, mimeTypes } from '../types/userTypes.js'
import { IUserReply, UserJson } from '../types/userTypes.js'
//import { extname } from 'path'
//import { readFile } from 'fs/promises'

//pas oublier de changer le nom des images de profils pour eviter les injection de code bizarre

export const oauth2Controller: FastifyPluginCallback = (server, _opts, done) => {
//UPDATE USER INFO
	server.get<{
		Reply: IUserReply,
		Body: UserJson
	}>('/login/github/callback', async (request, _reply) => {
		//const {token} = await this.githubOAuth.getAccessTokenFromAuthorizationCodeFlow(request);
		if (request)	{
			console.log(request);
			return ;
		}
	})		
	server.post<{
		Reply: IUserReply,
		Body: UserJson
	}>('/login/github/callback', async (request, _reply) => {
		console.log("AAAAAAAAAAAAAa");
		if (request)	{
			console.log(request);
			return ;
		}
		//try {
		//	if (request.cookies.token) {
		//		const payload = server.jwt.verify<JwtPayload>(request.cookies.token);
		//		const user = await User.findOneBy({login: payload.login});
		//		if (user) {
		//				request.body.login ? user.login = request.body.login : 0;
		//				request.body.nickName ? user.nickName = request.body.nickName : 0;
		//				request.body.email ? user.email = request.body.email : 0;
		//				if (request.body.password && request.body.newPassword 
		//					&& await user.comparePassword(request.body.password)) {
		//					user.password = request.body.newPassword;
		//				}
		//				if (request.body.avatar) {
		//					const buffer = request.body.avatar;
		//					const ext = request.body.ext;
		//					if (ext) {
		//						const mime = mimeTypes[ext] || 'application/octet-stream';
		//						user.avatar = `data:${mime};base64,${buffer.toString()}`;
		//					}
		//				}
		//				else if (request.body.noAvatar) {
		//					const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]; // choose randomly a default avatar
		//					const buffer = await readFile(file);
		//					const ext = extname(file).toLowerCase();
		//					const mime = mimeTypes[ext] || 'application/octet-stream';
		//					user.avatar = `data:${mime};base64,${buffer.toString("base64")}`;
		//				}
		//				await user.save();
		//				//console.log(await user.getInfos());
		//				const token = server.jwt.sign(await user.getInfos(), { expiresIn: '4h'});
		//				console.log("JWT updated");
		//				reply.setCookie('token', token, {
		//						httpOnly: true,
		//						secure: true,
		//						path: '/',
		//						sameSite: 'lax',
		//						maxAge: 4 * 60 * 60	
		//					}).code(200).send({ success: true});
		//				console.log("user infos successfully updated");
		//		} 
		//	}
		//}
		//catch (error) { 
		//	let errorMessage = 'unknown error';
		//	if (Array.isArray(error)) {
		//		error.forEach((err) => {
		//			if (err instanceof ValidationError) {
		//			    if (err.constraints && err.constraints.matches) {
		//			        errorMessage = err.constraints.matches;
		//			    } else if (err.constraints && err.constraints.isEmail) {
		//						errorMessage = err.constraints.isEmail;
		//			    } else if (err.constraints && err.constraints.isLength) {
		//						errorMessage = err.constraints.isLength;
		//				} else {
		//			        errorMessage = "Validation error";
		//			    }
		//			}
		//		});	
		//	}
		//	else if (error instanceof QueryFailedError && error.driverError?.code === 'SQLITE_CONSTRAINT') {
		//			if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.email')) {
		//				errorMessage = 'this email is already used';
		//			}
		//			else if (String(error.driverError?.message).includes('UNIQUE constraint failed: user.login')) {
		//				errorMessage = 'this login is already used';
		//			}
		//	}
		//	reply.code(400).send({ success: false, error: errorMessage});
		//}
	})		
	done();
}
