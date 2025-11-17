const Borrow = require("../models/Borrow");
const { sendLog } = require("../../../shared/utils/logger");
const {
  getCurrentUser,
  getUserById,
  getBookById,
  updateBookCopies,
} = require("../helpers/serviceClient");

// POST /borrows -> user mượn sách
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    // ⚠️ RACE CONDITION PROTECTION ⚠️
    // Sử dụng atomic operation để đảm bảo chỉ 1 người mượn được sách cuối cùng

    // Lấy thông tin sách từ Book Service
    const book = await getBookById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }

    // 🔒 ATOMIC OPERATION: Giảm số lượng sách TRƯỚC KHI tạo borrow
    // Book Service sẽ dùng findOneAndUpdate với condition để đảm bảo atomic
    const updated = await updateBookCopies(
      bookId,
      book.availableCopies - 1,
      true
    );

    if (!updated) {
      // Trường hợp race condition: người khác đã mượn trước
      return res.status(409).json({
        message: "Book was just borrowed by another user. Please try again.",
        code: "RACE_CONDITION",
      });
    }

    // Chỉ tạo borrow record sau khi đã giảm số lượng thành công
    const borrow = await Borrow.create({
      user: req.user.id,
      book: bookId,
    });

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
    // Nếu có lỗi sau khi đã giảm số lượng sách, cần rollback
    if (err.message && err.message.includes("ROLLBACK_NEEDED")) {
      // Cố gắng khôi phục số lượng sách
      try {
        const book = await getBookById(req.body.bookId);
        if (book) {
          await updateBookCopies(req.body.bookId, book.availableCopies + 1);
        }
      } catch (rollbackErr) {
        console.error("Failed to rollback book copies:", rollbackErr);
      }
    }
    res.status(500).json({ message: err.message });
  }
};

// PUT /borrows/:id/return -> trả sách
const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow)
      return res.status(404).json({ message: "Borrow record not found" });

    const userId = borrow.user._id
      ? borrow.user._id.toString()
      : borrow.user.toString();
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    // Lấy thông tin sách từ Book Service
    const book = await getBookById(borrow.book);

    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    // Cập nhật số lượng sách qua Book Service
    await updateBookCopies(borrow.book, book.availableCopies + 1);

    // ✅ Gửi log qua shared logger
    await sendLog(
      "Borrow Service",
      "RETURN_BOOK",
      { id: req.user.id, username: req.user.username },
      { bookId: borrow.book, borrowId: borrow._id },
      "info"
    );

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /borrows (admin xem tất cả) với pagination
const getAllBorrows = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Borrow.countDocuments();

    // Get paginated borrows
    const borrows = await Borrow.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get unique user and book IDs to minimize API calls
    const userIds = [...new Set(borrows.map((b) => b.user))];
    const bookIds = [...new Set(borrows.map((b) => b.book))];

    // Fetch users and books in parallel
    const [usersResults, booksResults] = await Promise.allSettled([
      Promise.allSettled(userIds.map((id) => getUserById(id, token))),
      Promise.allSettled(bookIds.map((id) => getBookById(id))),
    ]);

    // Create lookup maps
    const usersMap = new Map();
    const booksMap = new Map();

    if (usersResults.status === "fulfilled") {
      userIds.forEach((id, index) => {
        const result = usersResults.value[index];
        usersMap.set(
          id.toString(),
          result.status === "fulfilled"
            ? result.value
            : { _id: id, username: "Unknown User", role: "user" }
        );
      });
    }

    if (booksResults.status === "fulfilled") {
      bookIds.forEach((id, index) => {
        const result = booksResults.value[index];
        booksMap.set(
          id.toString(),
          result.status === "fulfilled"
            ? result.value
            : { _id: id, title: "Book not found", author: "Unknown" }
        );
      });
    }

    // Enhance borrow data using lookup maps
    const enhancedBorrows = borrows.map((borrow) => {
      const user = usersMap.get(borrow.user.toString()) || {
        _id: borrow.user,
        username: "Unknown User",
        role: "user",
      };
      const book = booksMap.get(borrow.book.toString()) || {
        _id: borrow.book,
        title: "Book not found",
        author: "Unknown",
      };

      return {
        ...borrow.toObject(),
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
        book: {
          _id: book._id,
          title: book.title,
          author: book.author,
        },
      };
    });

    res.json({
      data: enhancedBorrows,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
        limit: limit,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /borrows/me (user xem danh sách mượn của mình)
const getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id });

    // Enhance borrow data with book information from Book Service
    const enhancedBorrows = await Promise.all(
      borrows.map(async (borrow) => {
        try {
          const book = await getBookById(borrow.book);
          return {
            ...borrow.toObject(),
            book: {
              _id: book._id,
              title: book.title,
              author: book.author,
            },
          };
        } catch (error) {
          return {
            ...borrow.toObject(),
            book: {
              _id: borrow.book,
              title: "Book not found",
              author: "Unknown",
            },
          };
        }
      })
    );

    res.json(enhancedBorrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { borrowBook, returnBook, getAllBorrows, getMyBorrows };
