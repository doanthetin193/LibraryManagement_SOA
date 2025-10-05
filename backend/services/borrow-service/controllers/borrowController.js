const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const User = require("../models/User");
const { sendLog } = require("../../../shared/utils/logger"); // ✅ dùng chung

// POST /borrows -> user mượn sách
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }

    const borrow = await Borrow.create({
      user: req.user.id,
      book: bookId,
    });

    book.availableCopies -= 1;
    await book.save();

    // ✅ Gửi log qua shared logger
    await sendLog(
      "Borrow Service",
      "BORROW_BOOK",
      { id: req.user.id, username: req.user.username },
      { bookId, borrowId: borrow._id },
      "info"
    );

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /borrows/:id/return -> trả sách
const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate("book");

    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });

    const userId = borrow.user._id ? borrow.user._id.toString() : borrow.user.toString();
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    borrow.book.availableCopies += 1;
    await borrow.book.save();

    // ✅ Gửi log qua shared logger
    await sendLog(
      "Borrow Service",
      "RETURN_BOOK",
      { id: req.user.id, username: req.user.username },
      { bookId: borrow.book._id, borrowId: borrow._id },
      "info"
    );

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /borrows (admin xem tất cả)
const getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate("user", "username role")
      .populate("book", "title author");
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /borrows/me (user xem danh sách mượn của mình)
const getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id })
      .populate("book", "title author");
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { borrowBook, returnBook, getAllBorrows, getMyBorrows };
