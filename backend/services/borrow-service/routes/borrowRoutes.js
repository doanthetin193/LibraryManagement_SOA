const express = require("express");
const {
  borrowBook,
  returnBook,
  getAllBorrows,
  getMyBorrows,
} = require("../controllers/borrowController");
const {
  authMiddleware,
  adminOnly,
} = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

// User mượn sách
router.post("/", authMiddleware, borrowBook);

// User hoặc Admin trả sách
router.put("/:id/return", authMiddleware, returnBook);

// Admin xem toàn bộ lịch sử mượn sách
router.get("/", authMiddleware, adminOnly, getAllBorrows);

// User xem danh sách mượn của mình
router.get("/me", authMiddleware, getMyBorrows);

module.exports = router;
