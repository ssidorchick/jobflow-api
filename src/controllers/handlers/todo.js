import Boom from 'boom';

import Todo from './todo.model';

export const getAll = {
  handler: (request, reply) => {
    Todo.getAll()
      .then(result => reply(result))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};

export const get = {
  handler: (request, reply) => {
    Todo.get(request.params.id)
      .then(result => reply(result))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};

export const create = {
  handler: (request, reply) => {
    Todo.create(request.payload)
      .then(result => reply(result).code(201))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};

export const update = {
  handler: (request, reply) => {
    Todo.update(request.payload)
      .then(result => reply(result))
      .catch(err => reply(Boom.badImplementation(err)));
  }
};

export const remove = {
  handler: (request, reply) => {
    Todo.remove(request.params.id)
      .then(() => reply())
      .catch(err => reply(Boom.badImplementation(err)));
  }
}
