const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../../../shared/utils/generateToken");
const { sendLog } = require("../../../shared/utils/logger"); // ✅ thêm dòng này

// POST /users/register
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });

    // ✅ Ghi log
    await sendLog(
      "User Service",
      "register",
      { id: user._id.toString(), username: user.username },
      {},
      "info"
    );

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /users/login
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      // ✅ Ghi log login thành công
      await sendLog(
        "User Service",
        "login_success",
        { id: user._id.toString(), username: user.username },
        {},
        "info"
      );

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      // ✅ Ghi log login thất bại
      await sendLog(
        "User Service",
        "login_failed",
        { username }, // không có id vì login fail
        {},
        "warn"
      );

      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/me
const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  res.json({
    _id: req.user._id,
    username: req.user.username,
    role: req.user.role,
  });
};

module.exports = { registerUser, loginUser, getMe };
