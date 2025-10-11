const Book = require("../models/Book");
const { sendLog } = require("../../../shared/utils/logger"); // ✅ thêm dòng này

// POST /books (admin)
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genre, totalCopies } = req.body;
    const book = await Book.create({ 
      title, 
      author, 
      isbn,
      publishedYear, 
      genre, 
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1 
    });

    // ✅ Ghi log
    await sendLog(
      "Book Service",
      "create_book",
      { id: req.user.id, username: req.user.username },
      { bookId: book._id, title: book.title },
      "info"
    );

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /books/:id (admin)
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });

    // ✅ Ghi log
    await sendLog(
      "Book Service",
      "update_book",
      { id: req.user.id, username: req.user.username },
      { bookId: book._id, title: book.title },
      "info"
    );

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /books/:id (admin)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // ✅ Ghi log
    await sendLog(
      "Book Service",
      "delete_book",
      { id: req.user.id, username: req.user.username },
      { bookId: req.params.id },
      "info"
    );

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /books - Lấy tất cả sách với pagination tùy chọn
const getBooks = async (req, res) => {
  try {
    // If no pagination params, return all books (for homepage)
    if (!req.query.page && !req.query.limit) {
      const books = await Book.find().sort({ createdAt: -1 });
      
      // Skip logging for simple get requests to avoid spam
      return res.json(books);
    }

    // With pagination (for admin)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Book.countDocuments();
    const pages = Math.ceil(total / limit);

    // Skip logging for admin pagination requests to avoid spam
    
    res.json({
      data: books,
      pagination: {
        current: page,
        pages,
        total,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /books/:id - Lấy sách theo ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    // Skip logging for simple get requests
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /books/:id/copies - Update available copies (for service-to-service calls)
const updateBookCopies = async (req, res) => {
  try {
    const { availableCopies } = req.body;
    
    if (availableCopies < 0) {
      return res.status(400).json({ message: "Available copies cannot be negative" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id, 
      { availableCopies }, 
      { new: true }
    );
    
    if (!book) return res.status(404).json({ message: "Book not found" });

    // ✅ Ghi log (system operation from other services)
    await sendLog(
      "Book Service",
      "update_book_copies",
      { id: "system", username: "System" },
      { bookId: book._id, title: book.title, newCopies: availableCopies },
      "info"
    );

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook, updateBookCopies };
