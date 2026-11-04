const Post = require("../models/post");
const User = require("../models/user");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.search = async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query)
    return res.render("search/results", { query, posts: [], users: [] });

  const expression = new RegExp(escapeRegex(query), "i");
  const [posts, users] = await Promise.all([
    Post.find({ content: expression })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("owner", "username fullName profileImage"),
    User.find({ $or: [{ username: expression }, { fullName: expression }] })
      .select("username fullName profileImage bio")
      .limit(20),
  ]);
  res.render("search/results", { query, posts, users });
};
