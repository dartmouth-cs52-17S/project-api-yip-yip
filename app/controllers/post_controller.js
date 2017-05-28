import Post from '../models/post_model';

export const createPost = (req, res) => {
  const { text, tags, coordinates, user } = req.body;
  const p = new Post({ tags, text, user, location: { coordinates }, upvoters: [user] });
  p.score = 1;
  p.commentsLen = 0;
  p.timestamp = Date.now();
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
      sort.timestamp = -1;
      break;
  }

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
  // TODO maybe sort the comments by time
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

function vote(item, user, direction) {
  let addArray = [];
  let removeArray = [];
  let scoreChange = 1;
  if (direction === 'UP') {
    addArray = item.upvoters;
    removeArray = item.downvoters;
  } else if (direction === 'DOWN') {
    addArray = item.downvoters;
    removeArray = item.upvoters;
    scoreChange *= -1;
  } else {
    console.log('Neither UP nor DOWN direction was provided.');
    return item;
  }
  if (addArray.includes(user)) {
    return item;
  } else if (removeArray.includes(user)) {
    removeArray.splice(removeArray.indexOf(user), 1);
    addArray.push(user);
    item.score += scoreChange * 2;
  } else {
    addArray.push(user);
    item.score += scoreChange;
  }
  return item;
}

function updatePost(post, params) {
  switch (params.action) {
    case 'UPVOTE_POST':
      post = vote(post, params.user, 'UP');
      break;
    case 'DOWNVOTE_POST':
      post = vote(post, params.user, 'DOWN');
      break;
    case 'UPVOTE_COMMENT':
      post.comments.forEach((comment, index, comments) => {
        if (comment._id === params.commentId) {
          // console.log('HUZZAH A MATCH');
          comments[index] = vote(comment, params.user, 'UP');
        }
      });
      break;
    case 'DOWNVOTE_COMMENT':
      post.comments.forEach((comment, index, comments) => {
        console.log('ID');
        console.log(params._id);
        if (comment._id === params.commentId) {
          // console.log('HUZZAH A MATCH');
          comments[index] = vote(comment, params.user, 'DOWN');
        }
      });
      break;
    case 'CREATE_COMMENT':
      post.comments.push({
        text: params.comment,
        user: params.user,
        upvoters: [params.user],
        downvoters: [],
        timestamp: Date.now(),
      });
      break;
    default:
  }

  return post;
}

export const editPost = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      console.log(`before post ${post}`);
      post = updatePost(post, req.body);
      console.log(`after post ${post}`);
      post.save()
        .then((updated) => {
          res.json(updated);
        })
        .catch((err) => {
          res.status(555).json(err);
        });
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
