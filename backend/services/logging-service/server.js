const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const logRoutes = require("../logging-service/routes/logRoutes");

dotenv.config();
connectDB("Logging Service");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", logRoutes);

const PORT = process.env.LOGGING_PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 Logging Service running on port ${PORT}`);
});
