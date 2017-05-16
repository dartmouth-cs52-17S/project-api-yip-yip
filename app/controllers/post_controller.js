import Post from '../models/post_model';

export const createPost = (post) => {
  const p = new Post();
  p.tags = post.tags;
  p.content = post.content;
  p.cover_url = post.cover_url;
  return p.save();
};

export const getPosts = (req, res) => {
  return Post.find({});
};

export const getPost = (id) => {
  return Post.findById(id);
};

export const deletePost = (id) => {
  return Post.findByIdAndRemove(id);
};
export const updatePost = (id, post) => {
  return Post.findById(id).update(post);
};
