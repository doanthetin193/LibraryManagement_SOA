const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");

dotenv.config();
connectDB("User Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "User Service", timestamp: new Date().toISOString() });
});

// Routes
app.use("/", userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("User Service"));

const PORT = process.env.USER_PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});
