import _ from 'lodash';
import Jsdom from 'jsdom';


const internals = {};

internals._defaults = {
  jobUrlTemplate: 'https://www.upwork.com/job/~',
  clientRateSelector: '#layout > div.container > div:nth-child(2) > div.col-md-3 > p:nth-child(8) > strong'
};

internals.Spider = class {
  constructor(url) {
    this._url = url;
  }

  start() {
    return new Promise((resolve, reject) => {
        Jsdom.env(this._url, (err, window) => {
          if (err) {
            return reject();
          }

          const jobIdRegex = /job_\~(\w{18})/g;
          const markup = window.document.documentElement.innerHTML;
          const jobIds = [];
          let match;
          while ((match = jobIdRegex.exec(markup)) !== null) {
            jobIds.push(match[1]);
          }

          resolve(jobIds);

          window.close();
        });
      })
      .then(jobIds => {
        const promises = [];

        for (const jobId of jobIds) {
          const promise = new Promise((resolve, reject) => {
            Jsdom.env(internals._defaults.jobUrlTemplate + jobId, (err, window) => {
              if (err) {
                return reject(err);
              }

              // Sometimes happens that document is not loaded correctly.
              // In this cases there is no data.
              // TODO: Try to reload.

              const result = {
                jobId,
                url: internals._defaults.jobUrlTemplate + jobId
              };

              const titleEl = window.document.querySelector('h1');
              if (titleEl) {
                result.title = titleEl.innerHTML;
              }
              const rateEl = window.document.querySelector(internals._defaults.clientRateSelector);
              if (rateEl) {
                const match = /\$(\d+\.\d+)/.exec(rateEl.textContent);
                if (match) {
                  result.rate = _.toNumber(match[1]);
                }
              }

              resolve(result);

              window.close();
            });
          });
          promises.push(promise);
        }

        return Promise.all(promises);
      });
  }
};

module.exports = internals.Spider;
