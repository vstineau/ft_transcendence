import { extname } from 'path';
import { readFile } from 'fs/promises';
import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { IUserReply, UserJson, defaultAvatars, mimeTypes } from '../types/userTypes.js';

interface OAuth2Request extends FastifyRequest {
  githubOAuth2: any;
}

export default {
	method: 'GET',
	url: '/login/github/callback',
	handler: async (
		request: OAuth2Request,
		reply: FastifyReply
	) : Promise<void> => {
		try {
			const token: any = await request.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

			//struct recuperee avec ce fetch ici => https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
			const userProfile: any = await fetch('https://api.github.com/user', {
				headers: {
				    Authorization: `token ${token.access_token}`,
  			    'User-Agent': 'TonAvstineau ft_transcendence'
  			  }
  			}).then(res => res.json());
			//struct recuperee avec ce fetch ici => https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
			const userEmails: any = fetch('https://api.github.com/user/emails', { 
				headers: {
					Authorization: `token ${token.access_token}`,
					'User-Agent': 'vstineau ft_transcendence',
				} 
			}).then(res => res.json());
			
			//un compte github peut avoir plusieurs emails on prend le principal
			//si le mail est public on y accede via userProfile sinon via userEmails
			const email = Array.isArray(userEmails)
			    ? userEmails.find((e: any) => e.primary && e.verified)?.email
			    : userProfile.email; 

			const user = await User.findOneBy({email: email});
			//si on trouve un user via mail login classique 
			if (user) {
				if (user.twoFaAuth) {
	  			  const response : IUserReply[200] = {success: true, twoFaAuth: true};
	  			  reply.code(200).send(response);
	  			}
      			const token = reply.server.jwt.sign(
      			  { 
	  			    login: user.login,
	  			    email: user.email,
	  			    id: user.id, 
	  			    twoFaAuth: user.twoFaAuth
	  			  },
      			  { expiresIn: '4h' }
      			)
	  			const response : IUserReply[200] = {success: true};
      			reply
      			  .setCookie('token', token, {
      			    httpOnly: true,
      			    secure: true,
      			    path: '/',
      			    sameSite: 'lax',
      			    maxAge: 4 * 60 * 60
      			  })
      			  .code(200)
      			  .send(response);
			} else {
				//sinon faut register un compte avec les infos github
				//verifier login et nickname sont uniques sinon faire un truc 
				let login = userProfile.login;
				while (await User.findOneBy({login: userProfile.login})) {
					login += 'x';
				}
				const userInfos: UserJson = {
					login: userProfile.login,
					nickName: userProfile.login,
					twoFaAuth: false,
					email: email,
					avatar: '',
					password: 'Github42***',
					provider: 'github',
						
				};
				const newUser = await User.createUser(userInfos);
				const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        		const buffer = await readFile(file)
        		const ext = extname(file).toLowerCase()
        		const mime = mimeTypes[ext] || 'application/octet-stream'
        		newUser.avatar = `data:${mime};base64,${buffer.toString('base64')}`
				await newUser.save();
	  			const response : IUserReply[200] = {success: true};
				reply.code(200).send(response);
			}
		} catch (error: any) {
		}
	}
}
