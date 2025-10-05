const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const bookRoutes = require("./routes/bookRoutes");

dotenv.config();
connectDB("Book Service");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", bookRoutes);

const PORT = process.env.BOOK_PORT || 5002;
app.listen(PORT, () => {
  console.log(`📚 Book Service running on port ${PORT}`);
});
