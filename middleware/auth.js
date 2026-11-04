const ExpressError = require("../utils/expressError");
const Post = require("../models/post");
const Comment = require("../models/comment");

const isLoggedIn = (req, res, next) => {
  if (!req.user)
    return res.redirect(
      `/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`,
    );
  next();
};

const isPostOwner = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ExpressError("Post not found.", 404);
  if (!post.owner || !post.owner.equals(req.user._id))
    throw new ExpressError("You can only change your own posts.", 403);
  req.post = post;
  next();
};

const isCommentOwner = async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ExpressError("Comment not found.", 404);
  if (!comment.author.equals(req.user._id))
    throw new ExpressError("You can only change your own comments.", 403);
  req.comment = comment;
  next();
};

module.exports = { isLoggedIn, isPostOwner, isCommentOwner };
