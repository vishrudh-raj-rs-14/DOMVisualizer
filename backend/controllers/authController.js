const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(user._id);

  if (process.env.NODE_ENV == "production") {
    user.password = undefined;
  }
  res
    .cookie("jwt", token, {
      secure: process.env.NODE_ENV == "production",
    })
    .status(200)
    .json({
      status: "success",
      token,
      user,
    });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(401);
    throw new Error("A email is required to login");
    return;
  }

  if (!password) {
    res.status(401);
    throw new Error("A password is required to login");
    return;
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPasswords(password, user.password))) {
    res.status(401);
    throw new Error("Email or Password is incorrect");
    return;
  }

  const token = signToken(user._id);
  res
    .status(200)
    .cookie("jwt", token, {
      expires: new Date(
        Date.now() +
          Number(process.env.JWT_COOKIE_EXPIRE_TIME) * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV == "production",
    })
    .json({
      status: "success",
      token,
      user,
    });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    res.status(403);
    throw new Error("You must login to access this page");
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("The user with this credentials does not exist anymore", 401)
    );
  }
  req.user = user;
  next();
});

exports.logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};
