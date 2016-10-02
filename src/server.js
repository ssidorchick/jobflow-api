import Glue from 'glue';
import Hapi from 'hapi';
import mongoose from 'mongoose';
import {config} from './config';
import manifest from './config/manifest.json';

if (!config.get('PRODUCTION')) {
  manifest.registrations.push({
    "plugin": {
      "register": "blipp",
      "options": {}
    }
  });

  let good = manifest.registrations.find(p => p.plugin.register === 'good');
  if (good) {
    good.plugin.options.reporters.console[0].args.push({'ops': '*'});
  }
}

if (config.get('PRODUCTION')) {
  manifest.connections[0].host = '0.0.0.0';
  manifest.connections[0].port = config.get('PORT');
}

Glue.compose(manifest, {relativeTo: __dirname}, (err, server) => {
  if (err) {
    console.log('server.register err:', err);
  }

  mongoose.connect(config.get('MONGODB_URI'));

  const cache = server.cache({segment: 'messengerUsers', expiresIn: 3 * 24 * 60 * 60 * 1000});
  server.app.cache = cache;

  const cookieOptions = {
    encoding: 'iron',
    path: '/',
    password: 'caecd063dd9b66a16bbd3d52477dc94a66032c1adcf492a78e166df994120ad5',
    isSecure: false,                  // Defaults to true
    ignoreErrors: true,
    clearInvalid: true
  };

  server.state('messenger_linking', cookieOptions);

  server.on('internalError', (request, err) => console.log(err.data.stack));
  server.start(() => {
    console.log('✅ Server is listening on ' + server.info.uri.toLowerCase());
  });
});
