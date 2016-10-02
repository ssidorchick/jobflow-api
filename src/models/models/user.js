import Hoek from 'hoek';
import Mongoose from 'mongoose';
import transform from './helpers/transform';

const internals = {};

internals._defaults = {};

internals.ProviderSchema = new Mongoose.Schema({
  token: {type: String, required: true},
  secret: {type: String}
}, {
  _id: false,
  versionKey: false
});

internals.MessengerSchema = new Mongoose.Schema({
  auth_code: {type: String},
  sender_id: {type: String}
}, {
  _id: false,
  versionKey: false
});

internals.ConnectionsSchema = new Mongoose.Schema({
  upwork: {type: internals.ProviderSchema, required: true},
  messenger: {type: internals.MessengerSchema, required: true}
}, {
  _id: false,
  versionKey: false
});

internals.UserSchema = new Mongoose.Schema({
  email: {type: String, required: true},
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  connections: {type: internals.ConnectionsSchema, required: true}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

transform(internals.UserSchema);

internals.UserSchema.statics.get = function({id, email, auth_code}) {
  if (id) {
    return this.findById(id)
      .exec();
  } else if (email) {
    return this.findOne({email})
      .exec();
  } else if (auth_code) {
    return this.findOne({'connections.messenger.auth_code': auth_code})
      .exec();
  } else {
    throw Error(`Cannot search user by query: ${arguments}`);
  }
};

internals.UserSchema.statics.create = function(data, upwork, messenger) {
  const userData = {
    email: data.user.email,
    first_name: data.user.first_name,
    last_name: data.user.last_name,
    connections: {upwork, messenger}
  };
  const user = new this(userData);
  return user.save();
};

internals.UserSchema.methods.update = function(data, upwork, messenger) {
  if (data) {
    this.first_name = data.user.first_name;
    this.last_name = data.user.last_name
  }
  if (upwork) {
    this.connections.upwork = upwork;
  }
  if (messenger) {
    this.connections.messenger = messenger;
  }
  return this.save();
};

module.exports = internals.User = Mongoose.model('user', internals.UserSchema);
