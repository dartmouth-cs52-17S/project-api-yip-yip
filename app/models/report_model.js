import mongoose, { Schema } from 'mongoose';
import CommentSchema from './comment_model';
import { PostSchema } from './post_model';

const ReportSchema = new Schema({
  timestamp: Date,
  reporter: String,
  severity: Number,
  additionalInfo: String,
  reportedPost: PostSchema,
  reportedComment: CommentSchema,
}, {
  toJSON: {
    virtuals: true,
  },
});

const ReportModel = mongoose.model('Report', ReportSchema);

export default ReportModel;
