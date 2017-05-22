import Post from '../models/post_model';

export const createPost = (post) => {
  const p = new Post();
  p.text = post.text;
  p.timestamp = Date.now();
  p.tags = post.tags;
  p.location = post.location;
  p.upvoters = [];
  p.downvoters = [];
  return p.save();
};

export const getPosts = (req, res) => {
  // Find nearest posts, max distance of 8000m/~5miles (temporary)
  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.body.long, req.body.lat] }, $maxDistance: 8000 } } })
    .limit(10)
    .sort('-timestamp');
};

export const getPost = (req, res) => {
  Post.findById(req.body.id)
    .then((post) => {
      res.json(post);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

export const deletePost = (req, res) => {
  Post.findByIdAndRemove(req.body.id)
    .then((post) => {
      res.json(post);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

export const editPost = (req, res) => {
  Post.findByI(req.body.id)
    .then((post) => {
      res.json(post);
    }).catch((err) => {
      res.status(500).json(err);
    });
};
