import Comment from '../models/comment_model';

export const createComment = (comment) => {
  const c = new Comment();
  c.text = comment.text;
  c.timestamp = Date.now();
  c.user = comment.user;
  c.upvoters = [];
  c.downvoters = [];
  return c.save();
};

export const getComments = (req, res) => {
  Comment.find({})
    .sort('-timestamp')
    .then((comments) => {
      res.json(comments);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

export const deleteComment = (req, res) => {
  Comment.findByIdAndRemove(req.body.id)
    .then((comment) => {
      res.json(comment);
    }).catch((err) => {
      res.status(500).json(err);
    });
};
