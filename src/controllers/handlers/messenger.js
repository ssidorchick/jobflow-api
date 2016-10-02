import Crypto from 'crypto';

exports.get = {
  auth: false,
  handler: function(request, reply) {
    const config = this.config;

    if (request.query['hub.mode'] === 'subscribe' &&
        request.query['hub.verify_token'] === config.get('MESSENGER_VERIFY_TOKEN')) {
      reply(request.query['hub.challenge']);
    } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      reply('Failed validation. Make sure the validation tokens match.').code(403);
    }
  }
};

exports.post = {
  auth: false,
  handler: function(request, reply) {
    const payload = request.payload;
    const config = this.config;
    const User = this.models.User;
    const Upwork = this.models.Upwork;
    const Messenger = this.models.Messenger;
    const messenger = new Messenger({config, User, Upwork});

    messenger.readMessage(payload);
    reply();
  }
};

exports.authorize = {
  auth: false,
  handler: function(request, reply) {
    const config = this.config;
    const redirectURI = request.query['redirect_uri'];
    const authCode = Crypto.randomBytes(32).toString('hex');
    const redirectURISuccess = `${redirectURI}&authorization_code=${authCode}`;
    const authRedirect = `${config.get('API_ENDPOINT')}/oauth/upwork`;

    reply.state('messenger_linking', {authCode, redirectURISuccess});
    reply.redirect(authRedirect);
  }
};
