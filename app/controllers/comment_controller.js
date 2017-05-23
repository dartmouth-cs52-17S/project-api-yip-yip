import shortid from 'shortid';
import Comment from '../models/comment_model';

export const createComment = (comment, user) => {
  const c = new Comment();
  c.id = shortid.generate();
  c.text = comment.text;
  c.timestamp = Date.now();
  c.user = user;
  c.upvoters = [c.user];
  c.downvoters = [];
  return c;
};
