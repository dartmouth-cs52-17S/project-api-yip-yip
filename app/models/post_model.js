import mongoose, { Schema } from 'mongoose';
import CommentModel from './comment_model';

const PostSchema = new Schema({
  text: String,
  comments: [CommentModel],
  timestamp: Date,
  tags: [String],
  location: {
    type: String,
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
