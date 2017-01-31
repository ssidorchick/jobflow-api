import Mongoose from 'mongoose';
import transform from '../helpers/transform';


const internals = {};

internals._defaults = {};

internals.JobGroupSchema = new Mongoose.Schema({
  url: {type: String, required: true}
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

transform(internals.JobGroupSchema);

internals.JobGroupSchema.statics.create = function(data) {
  const item = new this(data);
  return item.save();
};

module.exports = internals.JobGroup = Mongoose.model('job_group', internals.JobGroupSchema);
