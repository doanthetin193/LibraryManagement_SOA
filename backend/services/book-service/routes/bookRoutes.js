const express = require("express");
const { createBook, getBooks, getBookById, updateBook, deleteBook } = require("../controllers/bookController");
const { authMiddleware } = require("../../../shared/middlewares/authMiddleware");
const { adminOnly } = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authMiddleware, adminOnly, createBook);
router.put("/:id", authMiddleware, adminOnly, updateBook);
router.delete("/:id", authMiddleware, adminOnly, deleteBook);

module.exports = router;
