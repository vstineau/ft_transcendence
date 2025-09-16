import { extname } from 'path';
import { readFile } from 'fs/promises';
import { User } from '../models.js';
import { defaultAvatars, mimeTypes } from '../types/userTypes.js';
export default {
    method: 'GET',
    url: '/login/github/callback',
    handler: async (request, reply) => {
        try {
            const token = await request.server.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
            if (!token.token.access_token) {
                console.log('token pas recupere');
                return;
            }
            const userProfile = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${token.token.access_token}`,
                    'User-Agent': 'vsfw ft_transcendence'
                }
            }).then(res => res.json());
            console.log('USER LOGIN ' + userProfile.login);
            const userEmails = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `token ${token.token.access_token}`,
                    'User-Agent': 'vstineau ft_transcendence',
                }
            }).then(res => res.json());
            const email = Array.isArray(userEmails)
                ? userEmails.find((e) => e.primary && e.verified)?.email
                : userProfile.email;
            const user = await User.findOneBy({ email: email });
            if (user) {
                console.log('ALREADY USER');
                const token = reply.server.jwt.sign({
                    login: user.login,
                    email: user.email,
                    id: user.id,
                    favLang: user.favLang,
                    twoFaAuth: user.twoFaAuth
                }, { expiresIn: '4h' });
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
            else {
                console.log('NEWUSER');
                let login = userProfile.login;
                while (await User.findOneBy({ login: login })) {
                    login += 'x';
                }
                const userInfos = {
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
                const file = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
                const buffer = await readFile(file);
                const ext = extname(file).toLowerCase();
                const mime = mimeTypes[ext] || 'application/octet-stream';
                newUser.avatar = `data:${mime};base64,${buffer.toString('base64')}`;
                await newUser.save();
                const token = reply.server.jwt.sign({
                    login: newUser.login,
                    email: newUser.email,
                    id: newUser.id,
                    twoFaAuth: newUser.twoFaAuth,
                    favLang: newUser.favLang,
                }, { expiresIn: '4h' });
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
        }
        catch (error) {
            console.log('ERROR: ' + error);
        }
    }
};
//# sourceMappingURL=oauth2.js.map