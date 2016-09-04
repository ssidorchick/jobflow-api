import mongoose, {Schema} from 'mongoose';

const TodoSchema = new Schema({
  name: {type: String, required: true},
});

TodoSchema.statics.getAll = function() {
  return this.find()
    .exec();
};

TodoSchema.statics.get = function(id) {
  return this.findById(id)
    .exec();
};

TodoSchema.statics.create = function(data) {
  let todo = new this(data);
  return todo.save()
    .then(result => this.get(result.id));
};

TodoSchema.statics.update = function(todo) {
  return this.findById(todo.id)
    .exec()
    .then(result => {
      result.name = todo.name;
      return result.save();
    });
};

TodoSchema.statics.remove = function(id) {
  return this.findById(id)
    .exec()
    .then(result => result.remove());
};

export default mongoose.model('Todo', TodoSchema);
