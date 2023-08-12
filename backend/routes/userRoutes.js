const express = require("express");
const { signup, login, logoutUser } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logoutUser);

module.exports = router;
