// backend/shared/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

// Middleware xác thực chung (chỉ decode token)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn payload vào request (id, role, ...)
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware kiểm tra quyền admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access only" });
};

module.exports = { authMiddleware, adminOnly };
