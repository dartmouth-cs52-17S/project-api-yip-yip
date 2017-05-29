import { Router } from 'express';
import * as Posts from './controllers/post_controller';
import * as Reports from './controllers/report_controller';

const router = Router();

router.route('/posts')
  .get(Posts.getPosts)
  .post(Posts.createPost);

router.route('/posts/:id')
  .get(Posts.getPost)
  .put(Posts.editPost)
  .delete(Posts.deletePost);

router.route('/report')
  .post(Reports.createReport)
  .get(Reports.getReports);

router.get('/userPosts/:id', Posts.getUserPosts);

router.get('/search', Posts.getByTags);

router.get('/tags', Posts.getTrendingTags);

export default router;
