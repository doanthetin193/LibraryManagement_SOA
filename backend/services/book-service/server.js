const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const bookRoutes = require("./routes/bookRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { registerService, setupGracefulShutdown, isConsulAvailable } = require("../../shared/config/consulClient");

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
const SERVICE_NAME = "book-service";

app.listen(PORT, async () => {
  console.log(`🚀 Book Service running on port ${PORT}`);
  
  // Register with Consul
  try {
    const consulAvailable = await isConsulAvailable();
    
    if (consulAvailable) {
      await registerService({
        id: `${SERVICE_NAME}-${PORT}`,
        name: SERVICE_NAME,
        address: "localhost",
        port: PORT,
        tags: ["book", "catalog", "inventory"],
        check: {
          http: `http://localhost:${PORT}/health`,
          interval: "10s",
          timeout: "5s"
        }
      });
      
      // Setup graceful shutdown
      setupGracefulShutdown(`${SERVICE_NAME}-${PORT}`);
    } else {
      console.warn("⚠️  Consul not available - service running without registration");
    }
  } catch (error) {
    console.error("❌ Failed to register with Consul:", error.message);
    console.log("⚠️  Service will continue without Consul registration");
  }
});
