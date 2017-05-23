import Post from '../models/post_model';

export const createPost = (req, res) => {
  const { text, tags, coordinates } = req.body;
  const p = new Post({ tags, text, location: { coordinates }, upvoters: ['user.id'] });
  p.score = 1;
  p.commentsLen = 0;
  p.save()
    .then((result) => {
      res.json(p);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

export const getPosts = (req, res) => {
  const sort = {};
  switch (req.query.sort) {
    case 'VOTES':
      sort.score = -1;
      break;
    case 'COMMENTS':
      sort.commentsLen = -1;
      break;
    default:
  }
  sort.timestamp = -1;

  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: 8000 } } })
    .limit(10) // TODO: input limit to allow for dynamic loading
    .sort(sort)
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
  Post.findByIdAndRemove(req.params.id)
    .then((post) => {
      res.json(post);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

export const editPost = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      res.json(post);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

// query.tags needs to be an array of the tags
export const getByTags = (req, res) => {
  Post.find({ tags: { $all: req.query.tags } })
    .limit(10) // TODO: input limit to allow for dynamic loading
    .sort('-timestamp')
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
