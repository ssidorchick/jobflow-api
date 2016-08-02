import Plugo from 'plugo';

const internals = {};

internals.load = (plugin, next) => {
  Plugo.expose({name: 'handlers', path: `${__dirname}/handlers`}, plugin, next);
};

exports.register = (plugin, options, next) => {
  plugin.dependency('auth', internals.load);

  next();
};

exports.register.attributes = {
  name: 'controllers'
};
