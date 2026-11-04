const express = require("express");
const router = express.Router();
const search = require("../controllers/searchRouters");
const wrapAsync = require("../utils/wrapAsync");
const { validateSearch } = require("../middleware/validate");
const { isLoggedIn } = require("../middleware/auth");

router.get("/search", isLoggedIn, validateSearch, wrapAsync(search.search));

module.exports = router;
