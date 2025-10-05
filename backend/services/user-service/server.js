const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
connectDB("User Service");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", userRoutes);

const PORT = process.env.USER_PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});
