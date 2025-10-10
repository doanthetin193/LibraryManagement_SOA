
const express = require("express");
const { registerUser, loginUser, getMe, getUserById } = require("../controllers/userController");
const { authWithUserData, adminOnly } = require("../../../shared/middlewares/authMiddleware");
const User = require("../models/User");

const router = express.Router();


const protect = authWithUserData(User);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});
router.get("/:id", protect, adminOnly, getUserById);

module.exports = router;
