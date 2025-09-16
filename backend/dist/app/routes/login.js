import { User } from '../models.js';
import { comparePassword } from '../utils/hashPassword.js';
export default {
    method: 'POST',
    url: '/login',
    handler: async (request, reply) => {
        try {
            const user = await User.findOneBy({ login: request.body.login });
            let isPasswordValid = false;
            if (user && request.body.password) {
                isPasswordValid = await comparePassword(request.body.password, user.password);
            }
            if (!user) {
                throw new Error('User not found. Please check your username or register an account.');
            }
            if (!request.body.password) {
                throw new Error('Password is required.');
            }
            else if (!isPasswordValid) {
                throw new Error('Incorrect password. Please try again.');
            }
            if (user.provider === 'github') {
                throw new Error('This account uses GitHub authentication. Please use the GitHub login option.');
            }
            if (user.twoFaAuth) {
                const tmpToken = reply.server.jwt.sign({ id: user.id, temp: true }, { expiresIn: '10m' });
                const response = {
                    success: true,
                    twoFaAuth: true,
                    tmpToken: tmpToken
                };
                reply.code(200).send(response);
                return;
            }
            const token = reply.server.jwt.sign({
                login: user.login,
                email: user.email,
                id: user.id,
                favLang: user.favLang,
                twoFaAuth: user.twoFaAuth
            }, { expiresIn: '4h' });
            const response = { success: true, user: { avatar: user.avatar,
                    nickName: user.nickName,
                    login: user.login,
                    email: user.email } };
            reply
                .setCookie('token', token, {
                httpOnly: false,
                secure: true,
                path: '/',
                sameSite: 'lax',
                maxAge: 4 * 60 * 60
            })
                .code(200)
                .send(response);
        }
        catch (error) {
            let errorMessage = 'unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            const response = { success: false, error: errorMessage };
            reply.code(200).send(response);
        }
    }
};
//# sourceMappingURL=login.js.map