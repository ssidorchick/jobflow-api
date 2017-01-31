import Spider from './spider';


const internals = {};

internals._defaults = {
  jobsUrl: 'https://www.upwork.com/o/jobs/browse/c/web-mobile-software-dev/sc/web-development/t/0/?client_hires=1-9,10-'
};

internals.Factory = function(options) {

  const {JobGroup, Job} = options;

  function getJobGroup() {
    Job.getLast()
      .then(result => {
        console.log(result);
      });

    return JobGroup.findOne({}).exec()
      .then(result => {
        if (!result) {
          return JobGroup.create({url: internals._defaults.jobsUrl});
        }
        return result;
      });
  }

  function saveNewJobs(group, jobs) {
    const promises = [];

    for (const data of jobs) {
      data.jobGroup = group.id;
      promises.push(Job.create(data));
    }

    return Promise.all(promises)
      .then(() => jobs);
  }

  return class {
    start() {
      return getJobGroup()
        .then(group => {
          const spider = new Spider(group.url);
          return spider.start()
            .then(result => saveNewJobs(group, result));
        });
    }
  };
};

module.exports = internals.Factory;
