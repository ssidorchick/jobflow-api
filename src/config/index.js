import path from 'path';
import nconf from 'nconf';

nconf.argv()
  .file(path.resolve(`${__dirname}/local.json`))
  .env();

export {nconf as config};

exports.register = function(plugin, options, next) {
  plugin.expose('config', nconf);
  next();
};

exports.register.attributes = {
  name: 'config'
};
