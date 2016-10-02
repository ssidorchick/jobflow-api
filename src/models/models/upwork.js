import UpworkApi from 'upwork-api';
import {Users} from 'upwork-api/lib/routers/organization/users';
import {Search} from 'upwork-api/lib/routers/jobs/search';
import Nconf from 'nconf';


const internals = {};

internals._defaults = {
  upworkApiConfig: {
    consumerKey: Nconf.get('UPWORK_API_KEY'),
    consumerSecret: Nconf.get('UPWORK_API_SECRET')
  }
};

internals.Upwork = class {
  constructor(options) {
    const {accessToken, accessTokenSecret} = options;
    this._upworkApi = new UpworkApi(internals._defaults.upworkApiConfig);
    this._upworkApi.setAccessToken(accessToken, accessTokenSecret, () => {});
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

  getJobs(params, count) {
    return new Promise((resolve, reject) => {
      const jobs = new Search(this._upworkApi);
      jobs.find(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const result = data.jobs
            .map(job => job.title)
            .slice(0, count);

          resolve(result);
        }
      });
    });
  }
};

module.exports = internals.Upwork;
