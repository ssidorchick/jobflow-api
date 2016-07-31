export const hello = {
  handler: (request, reply) => {
    return reply({result: 'Hello hapi!'});
  }
};

export const restricted = {
  auth: 'jwt',
  handler: (request, reply) => {
    return reply({result: 'Restricted!'});
  }
}

export const notFound = {
  handler: (request, reply) => {
    return reply({result: 'Oops, 404 Page!'}).code(404);
  }
};
