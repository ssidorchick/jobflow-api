const internals = {}

internals.load = (plugin, next) => {
  const config = plugin.plugins.config.config;
  const models = plugin.plugins.models.models;

  const cache = plugin.cache({segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000});

  plugin.auth.strategy('session', 'cookie', {
    cookie: 'sid',
    password: '788d9f3cb19ae732627c5bd55788a95ae70fe1b5e63591fa319b735b388620ad',
    isSecure: false,
    validateFunc: (request, session, callback) => {
      const {userId} = session;
      cache.get(userId, (err, cached) => {
        if (err) {
          return callback(err, false);
        }

        if (!cached) {
          return models.User.get({id: userId})
            .then(result => {
              cache.set(userId, result, null, err => {
                if (err) {
                  callback(err, false);
                } else {
                  callback(null, true, result);
                }
              });
            })
            .catch(err => callback(err, false));
        }

        return callback(null, true, cached);
      });
     }
  });

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

  plugin.auth.default('session');

  next();
};

exports.register = (plugin, options, next) => {
  plugin.dependency(['config', 'models'], internals.load);

  next();
}

exports.register.attributes = {
  name: 'auth'
};
