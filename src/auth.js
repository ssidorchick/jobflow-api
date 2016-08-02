const internals = {}

internals.load = (plugin, next) => {
  const config = plugin.plugins.config.config;

  plugin.auth.strategy('facebook', 'bell', {
    provider: 'facebook',
    password: 'be15c2735e3797b8116b4e5e44a55417dbe3a9aebebe13ff20424d77fcf10311',
    clientId: config.get('FACEBOOK_API_KEY'),
    clientSecret: config.get('FACEBOOK_API_SECRET'),
    isSecure: false
  });

  plugin.auth.strategy('upwork', 'bell', {
    provider: {
      protocol: 'oauth',
      signatureMethod: 'HMAC-SHA1',
      temporary: 'https://www.upwork.com/api/auth/v1/oauth/token/request',
      auth: 'https://www.upwork.com/services/api/auth',
      token: 'https://www.upwork.com/api/auth/v1/oauth/token/access',
    },
    password: '373669d05e7d1cac76114eab06d2f0a97e97230001a4dc6fb2df4924a8203330',
    clientId: config.get('UPWORK_API_KEY'),
    clientSecret: config.get('UPWORK_API_SECRET'),
    isSecure: false
  });

  plugin.auth.strategy('jwt', 'jwt', {
    key: 'NeverShareYourSecret', // Secret key
    verifyOptions: {
      algorithms: ['HS256']
    },
    // Implement validation function
    validateFunc: (decoded, request, callback) => {
      // NOTE: This is purely for demonstration purposes!
      let users = [
        {
          id: 1,
          name: 'Jon Snow'
        }
      ];

      if (users.find(u => u.id === decoded.id)) {
        return callback(null, true);
      }
      else {
        return callback(null, false);
      }
    }
  });

  // Uncomment this to apply default auth to all routes
  //plugin.auth.default('jwt');

  next();
};

exports.register = (plugin, options, next) => {
  plugin.dependency('config', internals.load);

  next();
}

exports.register.attributes = {
  name: 'auth'
};
