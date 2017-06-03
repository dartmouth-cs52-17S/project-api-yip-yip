import shuffle from 'shuffle-array';
import { icons, colors, PostModel } from '../models/post_model';

const RANGE = 8000;
const SELECTION = '-commentIcons -commentColors -searchTags -iconIndex -colorIndex';

function voted(item, user) {
  if (item.upvoters.includes(user)) {
    return 'UP';
  } else if (item.downvoters.includes(user)) {
    return 'DOWN';
  } else {
    return 'NONE';
  }
}

function checkVotes(post, user) {
  post.voted = voted(post, user);
  post.upvoters = undefined;
  post.downvoters = undefined;

  post.comments.forEach((comment) => {
    comment.voted = voted(comment, user);
    comment.upvoters = undefined;
    comment.downvoters = undefined;
  });
}

export const createPost = (req, res) => {
  const { tags, text, coordinates, user } = req.body;
  const p = new PostModel({ tags, text, user, location: { coordinates }, upvoters: [user] });
  p.searchTags = tags.map((tag) => {
    return tag.toLowerCase();
  });
  p.score = 1;
  p.commentsLen = 0;
  p.commentIcons = shuffle(icons, { copy: true });
  p.commentColors = shuffle(colors, { copy: true });
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

  PostModel.find({ score: { $gte: -4 }, location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } } })
    .select(SELECTION)
    .skip((req.query.page - 1) * 15)
    .limit(15)
    .sort(sort)
    .lean()
    .then((posts) => {
      posts.forEach((post) => {
        checkVotes(post, req.query.user);
      });
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const getPost = (req, res) => {
  PostModel.findById(req.params.id)
    .select(SELECTION)
    .lean()
    .then((post) => {
      checkVotes(post, req.query.user);
      res.json(post);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const deletePost = (req, res) => {
  PostModel.findByIdAndRemove(req.params.id)
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
  if (!user || addArray.includes(user)) {
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

function deleteComment(post, id) {
  for (let i = 0; i < post.comments.length; i++) {
    if (post.comments[i]._id.equals(id)) {
      post.comments.splice(i, 1);
      post.commentsLen -= 1;
      break;
    }
  }
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
    case 'DELETE_COMMENT':
      post = deleteComment(post, params.commentId);
      break;
    default:
  }

  return post;
}

export const editPost = (req, res) => {
  PostModel.findById(req.params.id)
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
  let noCaseTags = '';
  if (req.query.tags instanceof Array) {
    noCaseTags = req.query.tags.map((tag) => {
      return tag.toLowerCase();
    });
  } else {
    noCaseTags = req.query.tags.toLowerCase();
  }

  PostModel.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } }, searchTags: { $all: noCaseTags } })
    .select(SELECTION)
    .skip((req.query.page - 1) * 15)
    .limit(5)
    .sort('-timestamp')
    .lean()
    .then((posts) => {
      posts.forEach((post) => {
        checkVotes(post, req.query.user);
      });
      res.json(posts);
    })
    .catch((err) => {
      res.status(1500).json(err);
    });
};

export const getTrendingTags = (req, res) => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  console.log(date);
  PostModel.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [req.query.long, req.query.lat] }, $maxDistance: RANGE } }, timestamp: { $gte: date } })
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
        if (tag !== '') {
          sortArray.push([tag, tagFreqs[tag]]);
        }
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

export const getUserPosts = (req, res) => {
  PostModel.find({ user: req.params.id })
    .select(SELECTION)
    .skip((req.query.page - 1) * 15)
    .limit(15)
    .sort('-timestamp')
    .lean()
    .then((posts) => {
      posts.forEach((post) => {
        checkVotes(post, req.query.user);
      });
      res.json(posts);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
