const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { registerService, setupGracefulShutdown, isConsulAvailable } = require("../../shared/config/consulClient");

dotenv.config();
connectDB("User Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "User Service", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/", userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("User Service"));

const PORT = process.env.USER_PORT || 5001;
const SERVICE_NAME = "user-service";

app.listen(PORT, async () => {
  console.log(`🚀 User Service running on port ${PORT}`);
  
  // Register with Consul
  try {
    const consulAvailable = await isConsulAvailable();
    
    if (consulAvailable) {
      await registerService({
        id: `${SERVICE_NAME}-${PORT}`,
        name: SERVICE_NAME,
        address: "localhost",
        port: PORT,
        tags: ["user", "authentication", "authorization"],
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
