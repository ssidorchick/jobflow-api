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

    Upwork.setAccessToken(request.auth.credentials);

    const {authCode, redirectURISuccess} = request.state['messenger_linking'];
    const upwork = new Upwork();
    upwork.getUserInfo()
      .then(result => {
        User.get({email: result.user.email})
          .then(user => {
            if (!user) {
              return User.create(result, request.auth.credentials, {auth_code: authCode});
            } else {
              return user.update(result, request.auth.credentials, {auth_code: authCode});
            }
          })
          .then(user => {
            request.cookieAuth.set({userId: user.id});
            reply.redirect(redirectURISuccess);
          })
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
