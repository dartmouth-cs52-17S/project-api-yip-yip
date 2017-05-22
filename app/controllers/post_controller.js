import Post from '../models/post_model';

export const createPost = (post) => {
  const p = new Post();
  p.text = post.text;
  p.score = 1;
  p.timestamp = Date.now();
  p.tags = post.tags;
  p.location = post.location;
  return p.save();
};

export const getPosts = (req, res) => {
  return Post.find({ location: { $lte: req.location } })
    .limit(10)
    .sort('-timestamp');
};

export const getPost = (id) => {
  return Post.findById(id);
};

export const deletePost = (id) => {
  return Post.findByIdAndRemove(id);
};
