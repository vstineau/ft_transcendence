import register from './register.js'
import home from './root.js'
import login from './login.js'
import logout from './logout.js'
import deleteAccount from './deleteAccount.js'
import updateInfosGet from './updateInfosGet.js'
import updateInfosPost from './updateInfosPost.js'
import matchMaking from './matchMaking.js'
import oauth2 from './oauth2.js'
import { FastifyPluginCallback } from 'fastify';
import login2fa from './login2fa.js';
import enable2fa from './enable2fa.js';
import verifyEnable2fa from './verifyenable2fa.js';

export const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
    fastify.route(verifyEnable2fa);
    fastify.route(register);
    fastify.route(home);
    fastify.route(login);
    fastify.route(logout);
    fastify.route(deleteAccount);
    fastify.route(updateInfosGet);
    fastify.route(updateInfosPost);
    fastify.route(matchMaking);
    fastify.route(oauth2);
    fastify.route(login2fa);
    fastify.route(enable2fa);
    done()
}

