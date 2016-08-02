import Plugo from 'plugo';

exports.register = (plugin, options, next) => {
  Plugo.expose({name: 'models', path: `${__dirname}/models`}, plugin, next);
};

exports.register.attributes = {
  name: 'models'
};
