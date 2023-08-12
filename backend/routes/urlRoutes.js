const express = require("express");
const {
  getMyUrls,
  shortendUrl,
  redirectTo,
} = require("../controllers/urlController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.route("/").post(protect, shortendUrl).get(protect, getMyUrls);
router.get("/:url", redirectTo);

module.exports = router;
