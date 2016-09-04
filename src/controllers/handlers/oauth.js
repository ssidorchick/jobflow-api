import Boom from 'boom';
import UpworkApi from 'upwork-api';

exports.upworkLogin = {
  auth: 'upwork',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
    }

    const User = this.models.User;
    const Upwork = this.models.Upwork;

    Upwork.setAccessToken(request.auth.credentials);

    console.log(request.auth.session);

    const upwork = new Upwork();
    upwork.getUserInfo()
      .then(result => {
        User.get({email: result.user.email})
          .then(user => {
            if (!user) {
              console.log('creating user...');
              return User.create(result, {upwork: request.auth.credentials});
            } else {
              console.log('updating user...');
              return user.update(result, {upwork: request.auth.credentials});
            }
          })
          .then(user => reply(user))
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

    console.log(request.auth.credentials);
    // Perform any account lookup or registration, setup local session,
    // and redirect to the application. The third-party credentials are
    // stored in request.auth.credentials. Any query parameters from
    // the initial request are passed back via request.auth.credentials.query.
    return reply.redirect('/');
  }
};
