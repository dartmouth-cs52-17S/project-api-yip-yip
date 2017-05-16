import mongoose, { Schema } from 'mongoose';

// create a PostSchema with a title field
const PostSchema = new Schema({
  content: String,
  tags: String,
  cover_url: String,

}, {
  toJSON: {
    virtuals: true,
  },
});
// create PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);
export default PostModel;
