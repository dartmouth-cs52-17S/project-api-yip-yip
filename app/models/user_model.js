import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  phoneNumber: Number,
  favorites: [String], // IDs of posts
  arrows: Number,
  tags: [String],
  homebase: {
    name: String,
    type: String,
    coordinates: [Number],
  },
}, {
  toJSON: {
    virtuals: true,
  },
});
// create PostModel class from schema
const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
