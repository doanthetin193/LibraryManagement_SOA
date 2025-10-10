
const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};


const authWithUserData = (UserModel) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      if (UserModel) {
        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
      } else {
        req.user = decoded;
      }
      
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};


const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access only" });
};

module.exports = { authMiddleware, authWithUserData, adminOnly };
