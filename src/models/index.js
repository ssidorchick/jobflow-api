import User from './models/user';
import {Job, JobGroup} from './models/jobs';
import Crawler from './models/crawler';
import Messenger from './models/messenger';
import Upwork from './models/upwork';


exports.register = (plugin, options, next) => {
  const models = {
    User,
    Job,
    Crawler: Crawler({Job, JobGroup}),
    Messenger,
    Upwork
  };

  plugin.expose('models', models);

  next();
};

exports.register.attributes = {
  name: 'models'
};
