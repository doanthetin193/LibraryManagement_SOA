const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishedYear: { type: Number },
    genre: { type: String },
    availableCopies: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema, "books");
