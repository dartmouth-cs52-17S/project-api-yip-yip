import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  text: String,
  timestamp: Date,
  user: String,
  upvoters: [String],
  downvoters: [String],
}, {
  toJSON: {
    virtuals: true,
  },
});

CommentSchema.virtual('score').get(function calcScore() {
  return this.upvoters.length - this.downvoters.length;
});

// create CommentModel class from schema
const CommentModel = mongoose.model('Comment', CommentSchema);
export default CommentModel;
