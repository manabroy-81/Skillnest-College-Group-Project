const User = require("../models/user");
const Post = require("../models/post");
const crypto = require("crypto");
const ExpressError = require("../utils/expressError");

const safeReturnTo = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/feed";

const loginUser = (req, user) =>
  new Promise((resolve, reject) => {
    req.login(user, (error) => (error ? reject(error) : resolve()));
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });

module.exports.registerForm = (req, res) => res.render("users/register");

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body.user;
  const passwordHash = await User.hashPassword(password);
  const imageSeed = crypto.randomBytes(12).toString("hex");
  const user = await User.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    fullName: username.trim(),
    profileImage: `https://api.dicebear.com/9.x/adventurer/png?seed=${imageSeed}&backgroundColor=b6e3f4`,
    bannerImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=320&q=80",
  });
  await loginUser(req, user);
  await saveSession(req);
  res.redirect("/feed");
};

module.exports.loginForm = (req, res) =>
  res.render("users/login", { returnTo: req.query.returnTo || "" });

module.exports.login = async (req, res, next) => {
  try {
    await saveSession(req);
    res.redirect(safeReturnTo(req.body.returnTo));
  } catch (error) {
    next(error);
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    res.redirect("/");
  });
};

module.exports.profile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ExpressError("User not found.", 404);
  const posts = await Post.find({ owner: user._id }).sort({ createdAt: -1 });
  res.render("users/profile", { profileUser: user, posts });
};

module.exports.connections = async (req, res) => {
  const profileUser = await User.findById(req.params.id);
  if (!profileUser) throw new ExpressError("User not found.", 404);
  const type = req.params.type;
  if (!["followers", "following"].includes(type))
    throw new ExpressError("Connection list not found.", 404);
  const users = await User.find({ _id: { $in: profileUser[type] } }).select(
    "username fullName profileImage bio",
  );
  res.render("users/connections", { profileUser, users, type });
};

module.exports.editProfileForm = async (req, res) => {
  if (!req.user._id.equals(req.params.id))
    throw new ExpressError("You can only edit your own profile.", 403);
  res.render("users/edit", { profileUser: req.user });
};

module.exports.updateProfile = async (req, res) => {
  if (!req.user._id.equals(req.params.id))
    throw new ExpressError("You can only edit your own profile.", 403);
  const fields = ["fullName", "bio", "profileImage", "bannerImage"];
  const updates = Object.fromEntries(
    fields.map((field) => [field, req.body.user[field] ?? ""]),
  );
  await User.findByIdAndUpdate(req.user._id, updates, { runValidators: true });
  res.redirect(`/users/${req.user._id}`);
};

module.exports.toggleFollow = async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new ExpressError("User not found.", 404);
  if (target._id.equals(req.user._id))
    throw new ExpressError("You cannot follow yourself.", 400);
  const following = req.user.following.some((id) => id.equals(target._id));
  const operation = following ? "$pull" : "$addToSet";
  await Promise.all([
    User.findByIdAndUpdate(req.user._id, {
      [operation]: { following: target._id },
    }),
    User.findByIdAndUpdate(target._id, {
      [operation]: { followers: req.user._id },
    }),
  ]);
  res.redirect(req.get("referer") || `/users/${target._id}`);
};
