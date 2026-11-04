const Post = require("../models/post");
const Comment = require("../models/comment");
const ExpressError = require("../utils/expressError");
const { cloudinary } = require("../config/cloudinary");

const POSTS_PER_PAGE = 12;

module.exports.index = async (req, res) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const totalPosts = await Post.countDocuments({});
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const [posts, currentUserPosts] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE)
      .select("content image owner likes createdAt")
      .populate("owner", "username fullName profileImage"),
    Post.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("content"),
  ]);
  res.render("posts/feed", {
    posts,
    currentUserPosts,
    postCreated: req.query.created === "1",
    pagination: {
      currentPage,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      totalPages,
    },
  });
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
  res.redirect("/feed?created=1");
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
