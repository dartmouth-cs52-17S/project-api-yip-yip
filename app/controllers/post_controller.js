import Post from '../models/post_model';

export const createPost = (req, res) => {
  const { text, tags, coordinates } = req.body;
  const p = new Post({ tags, text, location: { coordinates }, upvoters: ['user.id'] });
  p.save()
    .then((result) => {
      res.json(p);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getPosts = (req, res) => {
  // Find nearest posts, max distance of 8000m/~5miles (temporary)
  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: 8000 } } })
    .limit(10)
    .sort('-timestamp')
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const getPost = (req, res) => {
  console.log(req.params.id);
  Post.findById(req.params.id)
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
