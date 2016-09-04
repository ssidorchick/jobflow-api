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

internals.ProvidersSchema = new Mongoose.Schema({
  upwork: internals.ProviderSchema,
  facebook: internals.ProviderSchema
}, {
  _id: false,
  versionKey: false
});

internals.UserSchema = new Mongoose.Schema({
  email: {type: String, required: true},
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  providers: internals.ProvidersSchema
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

transform(internals.UserSchema);

internals.UserSchema.statics.get = function({id, email}) {
  if (id) {
    return this.findById(id)
      .exec();
  } else {
    return this.findOne({email})
      .exec();
  }
};

internals.UserSchema.statics.create = function(data, providers) {
  const userData = {
    email: data.user.email,
    first_name: data.user.first_name,
    last_name: data.user.last_name,
    providers
  };
  const user = new this(userData);
  return user.save();
};

internals.UserSchema.methods.update = function(data, providers) {
  if (data) {
    this.first_name = data.user.first_name;
    this.last_name = data.user.last_name
  }
  Object.assign(this.providers, providers);
  return this.save();
};

module.exports = internals.User = Mongoose.model('user', internals.UserSchema);
