const express = require("express");
const { createLog, getLogs } = require("../controllers/logController");
const {
  authMiddleware,
  adminOnly,
} = require("../../../shared/middlewares/authMiddleware");

const router = express.Router();

// Service khác gọi -> ghi log
router.post("/", createLog);

// Admin xem log
router.get("/", authMiddleware, adminOnly, getLogs);

module.exports = router;
