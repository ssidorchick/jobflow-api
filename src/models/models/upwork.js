import Hoek from 'hoek';
import UpworkApi from 'upwork-api';
import {Auth} from 'upwork-api/lib/routers/auth';
import nconf from 'nconf';

// TODO: Refactor
const upworkApiConfig = {
  consumerKey: nconf.get('UPWORK_API_KEY'),
  consumerSecret: nconf.get('UPWORK_API_SECRET')
};

const internals = {};

internals._defaults = {};

internals.Upwork = class {
  constructor(options) {
    this._options = Hoek.applyToDefaults(internals._defaults, options || {});
    this._upworkApi = new UpworkApi(upworkApiConfig);
    const {accessToken, accessTokenSecret} = this._options;
    if (accessToken && accessTokenSecret) {
      this._upworkApi.setAccessToken(accessToken, accessTokenSecret, () => {});
    }
  }

  static setAccessToken({token, secret}) {
    internals._defaults.accessToken = token;
    internals._defaults.accessTokenSecret = secret;
  }

  getUserInfo() {
    return new Promise((resolve, reject) => {
      const auth = new Auth(this._upworkApi);
      auth.getUserInfo((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
};

module.exports = internals.Upwork;
