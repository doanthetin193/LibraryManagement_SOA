const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const bookRoutes = require("./routes/bookRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { announceService } = require("../../shared/utils/serviceRegistration");

dotenv.config();
connectDB("Book Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Book Service", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/", bookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("Book Service"));

const PORT = process.env.BOOK_PORT || 5002;
app.listen(PORT, async () => {
  const serviceInfo = {
    name: "Book Service",
    port: PORT,
    url: `http://localhost:${PORT}`
  };
  
  await announceService(serviceInfo);
});
