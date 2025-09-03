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
import fixpassword from './fixpassword.js';
import historySnake from '../snake/historySnake.js'

// export const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
//     fastify.route(verifyEnable2fa);
//     fastify.route(register);
//     fastify.route(home);
//     fastify.route(login);
//     fastify.route(logout);
//     fastify.route(deleteAccount);
//     fastify.route(updateInfosGet);
//     fastify.route(updateInfosPost);
//     fastify.route(matchMaking);
//     fastify.route(oauth2);
//     fastify.route(login2fa);
//     fastify.route(enable2fa);
//     fastify.route(fixpassword);
//     fastify.route(historySnake);
//     done()
// }


export const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
    console.log('=== REGISTERING ROUTES ===');

    console.log('Registering verifyEnable2fa...');
    fastify.route(verifyEnable2fa);

    console.log('Registering register...');
    fastify.route(register);

    console.log('Registering home...');
    fastify.route(home);

    console.log('Registering login...');
    fastify.route(login);

    console.log('Registering logout...');
    fastify.route(logout);

    console.log('Registering deleteAccount...');
    fastify.route(deleteAccount);

    console.log('Registering updateInfosGet...');
    fastify.route(updateInfosGet);

    console.log('Registering updateInfosPost...');
    fastify.route(updateInfosPost);

    console.log('Registering matchMaking...');
    fastify.route(matchMaking);

    console.log('Registering oauth2...');
    fastify.route(oauth2);

    console.log('Registering login2fa...');
    fastify.route(login2fa);

    console.log('Registering enable2fa...');
    fastify.route(enable2fa);

    console.log('Registering fixpassword...');
    fastify.route(fixpassword);

    console.log('Registering historySnake...', historySnake);
    console.log('historySnake route config:', JSON.stringify(historySnake, null, 2));
    fastify.route(historySnake);

    console.log('=== ALL ROUTES REGISTERED ===');
    done()
}
