const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const logRoutes = require("../logging-service/routes/logRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");

dotenv.config();
connectDB("Logging Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Logging Service", timestamp: new Date().toISOString() });
});

// Routes
app.use("/", logRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("Logging Service"));

const PORT = process.env.LOGGING_PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 Logging Service running on port ${PORT}`);
});
