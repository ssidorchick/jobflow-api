import Hoek from 'hoek';
import UpworkApi from 'upwork-api';
import {Users} from 'upwork-api/lib/routers/organization/users.js';
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
      const users = new Users(this._upworkApi);
      users.getMyInfo((err, data) => {
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
