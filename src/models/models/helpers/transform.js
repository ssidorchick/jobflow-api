export default function(Schema) {
  function transform(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  }

  Schema.set('toJSON', {virtuals: true, transform});
  Schema.set('toObject', {virtuals: true, transform})
}
