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
    },
  ],
  timestamp: Date,
  tags: [String],
  location: {
    type: String,
    coordinates: [Number],
  },
}, {
  toJSON: {
    virtuals: true,
  },
});
// create PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);
export default PostModel;
