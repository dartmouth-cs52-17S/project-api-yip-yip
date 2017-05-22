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
  // Find nearest posts, max distance of 8000m/~5miles (temporary)
  return Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.body.long, req.body.lat] }, $maxDistance: 8000 } } })
    .limit(10)
    .sort('-timestamp');
};

export const getPost = (id) => {
  return Post.findById(id);
};

export const deletePost = (id) => {
  return Post.findByIdAndRemove(id);
};
