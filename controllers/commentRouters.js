const Comment = require("../models/comment");
const Post = require("../models/post");
const ExpressError = require("../utils/expressError");

module.exports.create = async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ExpressError("Post not found.", 404);
  await Comment.create({
    text: req.body.comment.text.trim(),
    post: post._id,
    author: req.user._id,
  });
  res.redirect(`/feed/${post._id}`);
};

module.exports.update = async (req, res) => {
  req.comment.text = req.body.comment.text.trim();
  await req.comment.save();
  res.redirect(`/feed/${req.params.postId}`);
};

module.exports.destroy = async (req, res) => {
  await Comment.findByIdAndDelete(req.comment._id);
  res.redirect(`/feed/${req.params.postId}`);
};
