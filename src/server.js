import Glue from 'glue';
import Hapi from 'hapi';
import mongoose from 'mongoose';
import nconf from 'nconf';

import manifest from './config/manifest.json';

nconf.argv()
  .env()
  .file('src/config/local.json');

if (!nconf.get('PRODUCTION')) {
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

if (nconf.get('PRODUCTION')) {
  manifest.connections[0].host = '0.0.0.0';
  manifest.connections[0].port = process.env.PORT;
}

Glue.compose(manifest, {relativeTo: __dirname}, (err, server) => {
  if (err) {
    console.log('server.register err:', err);
  }

  mongoose.connect(nconf.get('MONGODB_URI'));

  server.on('internalError', (request, err) => console.log(err.data.stack));
  server.start(() => {
    console.log('✅  Server is listening on ' + server.info.uri.toLowerCase());
  });
});
