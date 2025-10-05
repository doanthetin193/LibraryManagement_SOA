const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const borrowRoutes = require("./routes/borrowRoutes");

dotenv.config();

connectDB("Borrow Service")
  .catch(() => {});

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", borrowRoutes);

const PORT = process.env.BORROW_PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Borrow Service running on port ${PORT}`);
});
