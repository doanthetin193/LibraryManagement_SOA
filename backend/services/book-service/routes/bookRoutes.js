const express = require("express");
const { createBook, getBooks, getBookById, updateBook, deleteBook, updateBookCopies } = require("../controllers/bookController");
const { authWithUserData, adminOnly } = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

// Import User model for auth middleware
const User = require("../../user-service/models/User");
const protect = authWithUserData(User);

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, adminOnly, createBook);
router.put("/:id", protect, adminOnly, updateBook);
router.put("/:id/copies", updateBookCopies); // New endpoint for service-to-service calls
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;
