exports.register = (plugin, options, next) => {
  plugin.dependency('controllers');

  let handlers = plugin.plugins.controllers.handlers;

  plugin.route([
    {method: 'GET', path: '/', config: handlers.Index.hello},
    {method: 'GET', path: '/restricted', config: handlers.Index.restricted},
    {method: 'GET', path: '/todo', config: handlers.Todo.getAll},
    {method: 'GET', path: '/todo/{id}', config: handlers.Todo.get},
    {method: 'POST', path: '/todo', config: handlers.Todo.create},
    {method: 'PATCH', path: '/todo', config: handlers.Todo.update},
    {method: 'DELETE', path: '/todo/{id}', config: handlers.Todo.remove},
    {method: 'GET', path: '/{path*}', config: handlers.Index.notFound}
  ]);

  next();
}

exports.register.attributes = {
  name: 'routes'
};
