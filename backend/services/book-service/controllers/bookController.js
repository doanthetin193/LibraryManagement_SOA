const Book = require("../models/Book");
const { sendLog } = require("../../../shared/utils/logger"); // ✅ thêm dòng này

// POST /books (admin)
const createBook = async (req, res) => {
  try {
    const { title, author, publishedYear, genre, availableCopies } = req.body;
    const book = await Book.create({ title, author, publishedYear, genre, availableCopies });

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

// GET /books - Lấy tất cả sách
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    
    // ✅ Ghi log
    await sendLog(
      "Book Service",
      "get_books",
      {},
      { count: books.length },
      "info"
    );
    
    res.json(books);
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
    
    // ✅ Ghi log
    await sendLog(
      "Book Service",
      "get_book_by_id",
      {},
      { bookId: book._id, title: book.title },
      "info"
    );
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook };
