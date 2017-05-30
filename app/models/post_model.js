import mongoose, { Schema } from 'mongoose';
import shuffle from 'shuffle-array';
import CommentSchema from './comment_model';

const icons = [
  'music',
  'futbol-o',
  'gamepad',
  'hand-spock-o',
  'diamond',
  'magic',
  'rocket',
  'tree',
  'trophy',
  'snowflake-o',
];

const colors = [
  '#6C56BA',
  '#9C8FC4',
  '#DA5AA4',
  '#E99BC9',
  '#7A719C',
  '#D0CCDF',
  '#88C5E8',
  '#489DCD',
];

const PostSchema = new Schema({
  text: String,
  score: Number,
  comments: [CommentSchema],
  commentsLen: { type: Number, default: 0 },
  timestamp: Date,
  tags: [String],
  searchTags: [String],
  user: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  upvoters: [String],
  downvoters: [String],
  commentIcons: { type: [String], default: shuffle(icons, { copy: true }) },
  commentColors: { type: [String], default: shuffle(colors, { copy: true }) },
  iconIndex: { type: Number, default: 0 },
  colorIndex: { type: Number, default: 0 },
}, {
  toJSON: {
    virtuals: true,
  },
});

const PostModel = mongoose.model('Post', PostSchema);
export { PostSchema, PostModel };
