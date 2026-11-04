const express = require("express");
const router = express.Router({ mergeParams: true });
const comments = require("../controllers/commentRouters");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isCommentOwner } = require("../middleware/auth");
const { validateComment } = require("../middleware/validate");

router.post("/", isLoggedIn, validateComment, wrapAsync(comments.create));
router
  .route("/:commentId")
  .put(
    isLoggedIn,
    wrapAsync(isCommentOwner),
    validateComment,
    wrapAsync(comments.update),
  )
  .delete(isLoggedIn, wrapAsync(isCommentOwner), wrapAsync(comments.destroy));

module.exports = router;
