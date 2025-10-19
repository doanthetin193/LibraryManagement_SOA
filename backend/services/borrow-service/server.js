const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const borrowRoutes = require("./routes/borrowRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { announceService } = require("../../shared/utils/serviceRegistration");

dotenv.config();

connectDB("Borrow Service")
  .catch(() => {});

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Borrow Service", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/", borrowRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("Borrow Service"));

const PORT = process.env.BORROW_PORT || 5003;
app.listen(PORT, async () => {
  const serviceInfo = {
    name: "Borrow Service",
    port: PORT,
    url: `http://localhost:${PORT}`
  };
  
  await announceService(serviceInfo);
});
