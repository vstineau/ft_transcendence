import { extname } from 'path';
import { readFile } from 'fs/promises';
import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models.js'
import { UserJson, defaultAvatars, mimeTypes } from '../types/userTypes.js';
import { OAuth2Namespace, /*OAuth2Token*/ } from '@fastify/oauth2';

declare module "fastify" {
  interface FastifyInstance {
    githubOAuth2: OAuth2Namespace;
  }
}

export default {
	method: 'GET',
	url: '/login/github/callback',
	handler: async (
		request: FastifyRequest,
		reply: FastifyReply
	) : Promise<void> => {
		try {
			const token: any = await request.server.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			if (!token.token.access_token) {
				console.log('token pas recupere');
				return ;
			}
			//struct recuperee avec ce fetch ici => https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
			const userProfile: any = await fetch('https://api.github.com/user', {
				headers: {
				    Authorization: `token ${token.token.access_token}`,
  			    'User-Agent': 'vsfw ft_transcendence'
  			  }
  			}).then(res => res.json());
			console.log('USER LOGIN ' + userProfile.login);
			//struct recuperee avec ce fetch ici => https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
			const userEmails: any = await fetch('https://api.github.com/user/emails', { 
				headers: {
					Authorization: `token ${token.token.access_token}`,
					'User-Agent': 'vstineau ft_transcendence',
				} 
			}).then(res => res.json());
			
			//si le mail est public on y accede via userProfile sinon via userEmails
			const email =  Array.isArray(userEmails)
			    ? userEmails.find((e: any) => e.primary && e.verified)?.email
			    : userProfile.email; 

			//un compte github peut avoir plusieurs emails on prend le principal
			const user = await User.findOneBy({email: email});
			//si on trouve un user via mail login classique 
			if (user) {
				console.log('ALREADY USER');
      			const token = reply.server.jwt.sign(
      			  { 
	  			    login: user.login,
	  			    email: user.email,
	  			    id: user.id, 
					favLang: user.favLang,
	  			    twoFaAuth: user.twoFaAuth
	  			  },
      			  { expiresIn: '4h' }
      			)
      			reply
      			  .setCookie('token', token, {
      			    httpOnly: false,
      			    secure: true,
      			    path: '/',
      			    sameSite: 'lax',
      			    maxAge: 4 * 60 * 60
      			  })
      			  .redirect(`https://${process.env.POSTE}:8080/dashboard`);
			} else {
				console.log('NEWUSER');
				//sinon faut register un compte avec les infos github
				//verifier login et nickname sont uniques sinon faire un truc 
				let login = userProfile.login;
				while (await User.findOneBy({login: login})) {
					login += 'x';
				}
				const userInfos: UserJson = {
					login: login,
					nickName: login,
					twoFaAuth: false,
					email: email,
					avatar: '',
					password: 'Github42***',
					favLang: 'en',
					provider: 'github',
						
				};
				const newUser = await User.createUser(userInfos);
				const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        		const buffer = await readFile(file)
        		const ext = extname(file).toLowerCase()
        		const mime = mimeTypes[ext] || 'application/octet-stream'
        		newUser.avatar = `data:${mime};base64,${buffer.toString('base64')}`
				await newUser.save();
      			const token = reply.server.jwt.sign(
      			  { 
	  			    login: newUser.login,
	  			    email: newUser.email,
	  			    id: newUser.id, 
	  			    twoFaAuth: newUser.twoFaAuth,
					favLang: newUser.favLang,
	  			  },
      			  { expiresIn: '4h' }
      			)
      			reply
      			  .setCookie('token', token, {
      			    httpOnly: false,
      			    secure: true,
      			    path: '/',
      			    sameSite: 'lax',
      			    maxAge: 4 * 60 * 60
      			  })
      			  .redirect(`https://${process.env.POSTE}:8080/dashboard`);
			}
		} catch (error: any) {
			console.log('ERROR: ' + error);
		}
	}
}
