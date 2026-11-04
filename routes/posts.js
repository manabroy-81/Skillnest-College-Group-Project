const express = require("express");
const router = express.Router();
const posts = require("../controllers/postRouters");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isPostOwner } = require("../middleware/auth");
const { validatePost } = require("../middleware/validate");
const { normalizeImageFields } = require("../middleware/upload");
const { upload } = require("../config/cloudinary");

router
  .route("/")
  .get(isLoggedIn, wrapAsync(posts.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    normalizeImageFields,
    validatePost,
    wrapAsync(posts.create),
  );
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isPostOwner),
  wrapAsync(posts.editForm),
);
router
  .route("/:id")
  .get(isLoggedIn, wrapAsync(posts.show))
  .put(
    isLoggedIn,
    wrapAsync(isPostOwner),
    upload.single("image"),
    normalizeImageFields,
    validatePost,
    wrapAsync(posts.update),
  )
  .delete(isLoggedIn, wrapAsync(isPostOwner), wrapAsync(posts.destroy));
router.post("/:id/like", isLoggedIn, wrapAsync(posts.toggleLike));

module.exports = router;
