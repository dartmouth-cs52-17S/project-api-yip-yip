import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  text: String,
  score: Number,
  comments: [
    {
      text: String,
      score: Number,
      timestamp: Date,
      user: String,
      upvoters: [String],
      downvoters: [String],
    },
  ],
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
// create PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);
export default PostModel;
