import Boom from 'boom';
import UpworkApi from 'upwork-api';

exports.upworkLogin = {
  auth: 'upwork',
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
    }

    const Upwork = this.models.Upwork;
    Upwork.setAccessToken(request.auth.credentials);

    const upwork = new Upwork();
    upwork.getUserInfo()
      .then(result => reply(result));
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
