const internals = {};

internals.load = (plugin, next) => {
  const config = plugin.plugins.config.config;
  const handlers = plugin.plugins.controllers.handlers;
  const models = plugin.plugins.models.models;
  plugin.bind({
    config: config,
    models: models
  });

  plugin.route([
    {method: 'GET', path: '/', config: handlers.Index.hello},
    {method: 'GET', path: '/restricted', config: handlers.Index.restricted},
    {method: 'GET', path: '/todo', config: handlers.Todo.getAll},
    {method: 'GET', path: '/todo/{id}', config: handlers.Todo.get},
    {method: 'POST', path: '/todo', config: handlers.Todo.create},
    {method: 'PATCH', path: '/todo', config: handlers.Todo.update},
    {method: 'DELETE', path: '/todo/{id}', config: handlers.Todo.remove},
    {method: 'GET', path: '/oauth/upwork', config: handlers.Oauth.upworkLogin},
    {method: ['GET', 'POST'], path: '/oauth/facebook', config: handlers.Oauth.facebookLogin},
    {method: 'GET', path: '/{path*}', config: handlers.Index.notFound}
  ]);

  next();
};

exports.register = (plugin, options, next) => {
  plugin.dependency(['config', 'controllers', 'models'], internals.load);

  next();
}

exports.register.attributes = {
  name: 'routes'
};
