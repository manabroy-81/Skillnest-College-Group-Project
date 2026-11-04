const Post = require("../models/post");
const Comment = require("../models/comment");
const ExpressError = require("../utils/expressError");
const { cloudinary } = require("../config/cloudinary");

module.exports.index = async (req, res) => {
  const [posts, currentUserPosts] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .populate("owner", "username fullName profileImage"),
    Post.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(3),
  ]);
  res.render("posts/feed", { posts, currentUserPosts });
};

module.exports.show = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("owner", "username fullName profileImage");
  if (!post) throw new ExpressError("Post not found.", 404);
  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: -1 })
    .populate("author", "username fullName profileImage");
  res.render("posts/show", { post, comments });
};

module.exports.create = async (req, res) => {
  const post = new Post({
    ...req.body.post,
    content: req.body.post.content.trim(),
    owner: req.user._id,
    ...(req.file && { image: req.file.path, imagePublicId: req.file.filename }),
  });
  await post.save();
  res.redirect(`/feed/${post._id}`);
};

module.exports.editForm = async (req, res) =>
  res.render("posts/edit", { post: req.post });

module.exports.update = async (req, res) => {
  const updates = {
    ...req.body.post,
    content: req.body.post.content.trim(),
  };
  if (req.file) {
    updates.image = req.file.path;
    updates.imagePublicId = req.file.filename;
  }
  await Post.findByIdAndUpdate(req.post._id, updates, { runValidators: true });
  if (req.file && req.post.imagePublicId) {
    await cloudinary.uploader.destroy(req.post.imagePublicId);
  }
  res.redirect(`/feed/${req.post._id}`);
};

module.exports.destroy = async (req, res) => {
  await Promise.all([
    Post.findByIdAndDelete(req.post._id),
    Comment.deleteMany({ post: req.post._id }),
    ...(req.post.imagePublicId
      ? [cloudinary.uploader.destroy(req.post.imagePublicId)]
      : []),
  ]);
  res.redirect("/feed");
};

module.exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ExpressError("Post not found.", 404);
  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));
  await Post.findByIdAndUpdate(
    post._id,
    alreadyLiked
      ? { $pull: { likes: req.user._id } }
      : { $addToSet: { likes: req.user._id } },
  );
  res.redirect(req.get("referer") || `/feed/${post._id}`);
};
