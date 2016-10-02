import Boom from 'boom';

exports.upworkLogin = {
  auth: 'upwork',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
    }

    const config = this.config;
    const User = this.models.User;
    const Upwork = this.models.Upwork;
    const {authCode, redirectURISuccess} = request.state['messenger_linking'];
    const {token: accessToken, secret: accessTokenSecret} = request.auth.credentials;
    const upwork = new Upwork({accessToken, accessTokenSecret});

    upwork.getUserInfo()
      .then(result => {
        User.getByEmail(result.user.email)
          .then(user => {
            if (!user) {
              return User.create(result, {accessToken, accessTokenSecret}, {auth_code: authCode});
            } else {
              return user.update(result, {accessToken, accessTokenSecret}, {auth_code: authCode});
            }
          })
          .then(user => reply.redirect(redirectURISuccess))
          .catch(err => reply(Boom.badImplementation(err)));
      });
  }
};

exports.facebookLogin = {
  auth: 'facebook',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
    }

    const config = this.config;
    const User = this.models.User;
    const userId = request.state.sid.userId;

    User.get({id: userId})
      .then(user => user.update(null, {facebook: {token: request.auth.credentials.token}}))
      .then(user => reply.redirect(config.get('OAUTH_REDIRECT')))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};
