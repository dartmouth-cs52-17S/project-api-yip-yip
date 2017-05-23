import Post from '../models/post_model';
import * as Comments from './comment_controller';

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
  item.upvoters.push(user);
  if (direction === 'UP') {
    if (item.downvoters.contains(user)) {
      item.downvoters.remove(item.downvoters.indexOf(user));
      item.score += 2;
    } else {
      item.score += 1;
    }
  } else if (direction === 'DOWN') {
    if (item.upvoters.contains(user)) {
      item.upvoters.remove(item.upvoters.indexOf(user));
      item.score -= 2;
    } else {
      item.score -= 1;
    }
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
        if (comment.id === params.commentId) {
          comments[index] = vote(comment, params.user, 'UP');
        }
      });
      break;
    case 'DOWNVOTE_COMMENT':
      post.comments.forEach((comment, index, comments) => {
        if (comment.id === params.commentId) {
          comments[index] = vote(comment, params.user, 'DOWN');
        }
      });
      break;
    case 'CREATE_COMMENT':
      post.comments.push(Comments.createComment(params.comment, params.user));
      break;
    default:
  }

  return post;
}

export const editPost = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      post = updatePost(post, req.body);
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
