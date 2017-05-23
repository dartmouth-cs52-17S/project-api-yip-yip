import { Schema } from 'mongoose';

const CommentSchema = new Schema({
  id: String,
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

export default CommentSchema;
