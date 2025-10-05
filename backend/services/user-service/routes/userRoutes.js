// backend/services/user-service/routes/userRoutes.js
const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/userController");
const { protect } = require("../middlewares/userAuth");
const { adminOnly } = require("../../../shared/middlewares/authMiddleware"); // ✅ thêm dòng này

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
