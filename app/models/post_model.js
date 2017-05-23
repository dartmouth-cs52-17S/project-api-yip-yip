import mongoose, { Schema } from 'mongoose';
import CommentSchema from './comment_model';

const PostSchema = new Schema({
  text: String,
  comments: [CommentSchema],
  timestamp: { type: Date, default: Date.now() },
  tags: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  upvoters: [String],
  downvoters: [String],
}, {
  toJSON: {
    virtuals: true,
  },
});

PostSchema.virtual('score').get(function calcScore() {
  return this.upvoters.length - this.downvoters.length;
});

const PostModel = mongoose.model('Post', PostSchema);
export default PostModel;
