
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
	})		
	done();
}
