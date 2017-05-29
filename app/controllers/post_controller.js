import Post from '../models/post_model';

const RANGE = 8000;

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
    case 'Top':
      sort.score = -1;
      break;
    case 'Comments':
      sort.commentsLen = -1;
      break;
    default:
  }
  sort.timestamp = -1;

  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } } })
    .skip((req.query.page - 1) * 5)
    .limit(5)
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

function addComment(post, params) {
  let icon = post.commentIcons[post.iconIndex];
  let color = post.commentColors[post.colorIndex];
  let match = false;
  for (let i = 0; i < post.comments.length; i++) {
    console.log(post.comments[i], params.user);
    console.log('here');
    if (post.comments[i].user === params.user) {
      icon = post.comments[i].icon;
      color = post.comments[i].color;
      match = true;
      break;
    }
  }

  if (!match) {
    post.iconIndex = post.iconIndex >= 9 ? 0 : post.iconIndex + 1;
    post.colorIndex = post.colorIndex >= 7 ? 0 : post.colorIndex + 1;
  }

  post.comments.push({
    text: params.comment,
    user: params.user,
    upvoters: [params.user],
    downvoters: [],
    timestamp: Date.now(),
    icon,
    color,
  });
  post.commentsLen += 1;

  return post;
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
        if (comment._id.equals(params.commentId)) {
          comments[index] = vote(comment, params.user, 'UP');
        }
      });
      break;
    case 'DOWNVOTE_COMMENT':
      post.comments.forEach((comment, index, comments) => {
        if (comment._id.equals(params.commentId)) {
          comments[index] = vote(comment, params.user, 'DOWN');
        }
      });
      break;
    case 'CREATE_COMMENT':
      post = addComment(post, params);
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
  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } }, tags: { $all: req.query.tags } })
    .skip((req.query.page - 1) * 5)
    .limit(5)
    .sort('-timestamp')
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const getTrendingTags = (req, res) => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  console.log(date);
  Post.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } }, timestamp: { $gte: date } })
    .select('tags')
    .then((tags) => {
      const tagFreqs = {};
      for (let i = 0; i < tags.length; i++) {
        for (let j = 0; j < tags[i].tags.length; j++) {
          const tag = tags[i].tags[j];
          if (tagFreqs.hasOwnProperty(tag)) {
            tagFreqs[tag] += 1;
          } else {
            tagFreqs[tag] = 1;
          }
        }
      }

      const sortArray = [];
      for (const tag in tagFreqs) {
        sortArray.push([tag, tagFreqs[tag]]);
      }

      sortArray.sort((a, b) => {
        return b[1] - a[1];
      });

      const trendingTags = [];
      for (let i = 0; i < 5; i++) {
        if (!sortArray[i]) {
          break;
        }
        trendingTags.push(sortArray[i][0]);
      }

      res.json(trendingTags);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
