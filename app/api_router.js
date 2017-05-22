import { Router } from 'express';
import * as Posts from './controllers/post_controller';

const router = Router();

router.route('/posts')
  .get(Posts.getPosts)
  .post(Posts.createPost);

router.route('/posts/:id')
  .get(Posts.getPost)
  .put(Posts.editPost)
  .delete(Posts.deletePost);


export default router;
