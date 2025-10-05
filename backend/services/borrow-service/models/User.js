const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    role: String,
  },
  { timestamps: true }
);

// trỏ tới collection "users"
module.exports = mongoose.model("User", userSchema, "users");
