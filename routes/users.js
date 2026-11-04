const express = require("express");
const router = express.Router();
const users = require("../controllers/userRouters");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware/auth");
const {
  validateRegistration,
  validateProfile,
  validateLogin,
} = require("../middleware/validate");
const { normalizeImageFields } = require("../middleware/upload");
const passport = require("../config/passport");

router
  .route("/auth/register")
  .get(users.registerForm)
  .post(validateRegistration, wrapAsync(users.register));
router
  .route("/auth/login")
  .get(users.loginForm)
  .post(
    validateLogin,
    passport.authenticate("local", { failureRedirect: "/auth/login" }),
    users.login,
  );
router.post("/auth/logout", users.logout);
router.get("/users/:id", wrapAsync(users.profile));
router.get(
  "/users/:id/followers",
  (req, res, next) => {
    req.params.type = "followers";
    next();
  },
  wrapAsync(users.connections),
);
router.get(
  "/users/:id/following",
  (req, res, next) => {
    req.params.type = "following";
    next();
  },
  wrapAsync(users.connections),
);
router.get("/users/:id/edit", isLoggedIn, wrapAsync(users.editProfileForm));
router.put(
  "/users/:id",
  isLoggedIn,
  normalizeImageFields,
  validateProfile,
  wrapAsync(users.updateProfile),
);
router.post("/users/:id/follow", isLoggedIn, wrapAsync(users.toggleFollow));

module.exports = router;
