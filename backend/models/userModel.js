const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validators = require("validator");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name of user is compulsory"],
  },

  email: {
    type: String,
    unique: true,
    required: [true, "Email is Compulsory"],
    lowercase: true,
    validate: [validators.isEmail, "Given email is invalid"],
  },
  password: {
    type: String,
    required: [true, "password is mandratory"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm Password is mandratory"],
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "Password and Confirm Password does not match",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.methods.checkPasswords = async (given, actual) => {
  return await bcrypt.compare(given, actual);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
