

export default {
  name: 'githubOAuth2',
  scope: ['user:email'],
  credentials: {
    client: {
      id: '<GITHUB_CLIENT_ID>',
      secret: '<GITHUB_CLIENT_SECRET>',
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token'
    },
  },
  startRedirectPath: '/login/github',
  callbackUri: `https://${process.env.IP}:8080/api/login/github/callback`
}
