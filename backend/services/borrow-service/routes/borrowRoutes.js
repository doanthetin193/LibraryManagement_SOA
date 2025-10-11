const express = require("express");
const {
  borrowBook,
  returnBook,
  getAllBorrows,
  getMyBorrows,
} = require("../controllers/borrowController");
const {
  authWithUserData,
  adminOnly,
} = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

// Import User model for auth middleware
const User = require("../../user-service/models/User");
const protect = authWithUserData(User);

// User mượn sách
router.post("/", protect, borrowBook);

// User hoặc Admin trả sách
router.put("/:id/return", protect, returnBook);

// Admin xem toàn bộ lịch sử mượN sách
router.get("/", protect, adminOnly, getAllBorrows);

// User xem danh sách mượn của mình
router.get("/me", protect, getMyBorrows);

module.exports = router;
