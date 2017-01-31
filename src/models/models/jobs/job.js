import Mongoose from 'mongoose';
import transform from '../helpers/transform';


const internals = {};

internals._defaults = {};

internals.JobSchema = new Mongoose.Schema({
  jobGroup: {type: Mongoose.Schema.Types.ObjectId, required: true},
  jobId: {type: String, required: true},
  title: String,
  rate: Number
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

transform(internals.JobSchema);

internals.JobSchema.statics.create = function(data) {
  const job = new this(data);
  return job.save();
};

internals.JobSchema.statics.getLast = function() {
  return this.findOne({})
    .sort('-created_at')
    .exec();
};

module.exports = internals.Job = Mongoose.model('job', internals.JobSchema);
