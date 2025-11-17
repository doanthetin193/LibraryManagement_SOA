const express = require("express");
const { createBook, getBooks, getBookById, updateBook, deleteBook, updateBookCopies } = require("../controllers/bookController");
const { authMiddleware, adminOnly } = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authMiddleware, adminOnly, createBook);
router.put("/:id", authMiddleware, adminOnly, updateBook);
router.put("/:id/copies", updateBookCopies); // New endpoint for service-to-service calls
router.delete("/:id", authMiddleware, adminOnly, deleteBook);

module.exports = router;
