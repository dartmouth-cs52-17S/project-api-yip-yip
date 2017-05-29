import mongoose, { Schema } from 'mongoose';
import CommentSchema from './comment_model';

const PostSchema = new Schema({
  text: String,
  score: Number,
  comments: [CommentSchema],
  commentsLen: { type: Number, default: 0 },
  timestamp: Date,
  tags: [String],
  user: String,
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

const PostModel = mongoose.model('Post', PostSchema);
export { PostSchema, PostModel };
