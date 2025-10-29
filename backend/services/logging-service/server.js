const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const logRoutes = require("../logging-service/routes/logRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { registerService, setupGracefulShutdown, isConsulAvailable } = require("../../shared/config/consulClient");

dotenv.config();
connectDB("Logging Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Logging Service", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/", logRoutes);

// Error handling middleware (must be last)
app.use(errorHandler("Logging Service"));

const PORT = process.env.LOGGING_PORT || 5004;
const SERVICE_NAME = "logging-service";

app.listen(PORT, async () => {
  console.log(`🚀 Logging Service running on port ${PORT}`);
  
  // Register with Consul
  try {
    const consulAvailable = await isConsulAvailable();
    
    if (consulAvailable) {
      await registerService({
        id: `${SERVICE_NAME}-${PORT}`,
        name: SERVICE_NAME,
        address: "localhost",
        port: PORT,
        tags: ["logging", "audit", "monitoring"],
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
