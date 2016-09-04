import Boom from 'boom';

exports.upworkLogin = {
  auth: 'upwork',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
    }

    const User = this.models.User;
    const Upwork = this.models.Upwork;

    Upwork.setAccessToken(request.auth.credentials);

    const upwork = new Upwork();
    upwork.getUserInfo()
      .then(result => {
        User.get({email: result.user.email})
          .then(user => {
            if (!user) {
              return User.create(result, {upwork: request.auth.credentials});
            } else {
              return user.update(result, {upwork: request.auth.credentials});
            }
          })
          .then(user => {
            request.cookieAuth.set({userId: user.id});
            reply(user);
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

    const User = this.models.User;
    const userId = request.state.sid.userId;

    User.get({id: userId})
      .then(user => user.update(null, {facebook: {token: request.auth.credentials.token}}))
      .then(user => reply(user))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};
