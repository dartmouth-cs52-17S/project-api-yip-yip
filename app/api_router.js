import { Router } from 'express';
import * as Posts from './controllers/post_controller';
import * as UserController from './controllers/user_controller';


// /your routes will go here

const router = Router();

// /your routes will go here
router.get('/posts', (req, res) => {
  Posts.getPosts().then((posts) => {
    res.send(posts);
  }).catch((error) => {
    res.send(`error: ${error}`);
  });
});

router.post('/posts', (req, res) => {
  const newPost = {
    tags: req.body.tags,
    content: req.body.content,
    cover_url: req.body.cover_url,
  };
  Posts.createPost(newPost).then((post) => {
    res.send(post);
  });
});

router.get('/posts/new', (req, res) => {
  res.send(res);
});
router.get('/posts/:id', (req, res) => {
  Posts.getPost(req.params.id).then((post) => {
    res.send({ post });
  }).catch((error) => {
    res.send(`error:${error}`);
  });
});

router.delete('/posts/:id', (req, res) => {
  Posts.deletePost(req.params.id).then(() => {
    res.send('deleted');
  }).catch((error) => {
    res.send(`error:${error}`);
  });
});

router.put('/posts/:id', (req, res) => {
  const updatedPost = {
    tags: req.body.tags,
    content: req.body.content,
    cover_url: req.body.cover_url,
  };
  Posts.updatePost(req.params.id, updatedPost).then(() => {
    res.send('ok');
  });
});

export default router;
