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

  server.on('internalError', (request, err) => console.log(err.data.stack));
  server.start(() => {
    console.log('✅ Server is listening on ' + server.info.uri.toLowerCase());
  });
});
