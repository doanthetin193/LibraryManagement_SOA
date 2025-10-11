
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const axios = require("axios");
const { getServiceConfig } = require("../shared/config/services");

require("dotenv").config();

const app = express();

// SOA Gateway: Enhanced CORS and middleware setup
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend URLs
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🔀 Gateway: ${req.method} ${req.path} from ${req.ip}`);
  next();
});


const USER_SERVICE = getServiceConfig("USER_SERVICE").url;
const BOOK_SERVICE = getServiceConfig("BOOK_SERVICE").url;
const BORROW_SERVICE = getServiceConfig("BORROW_SERVICE").url;
const LOGGING_SERVICE = getServiceConfig("LOGGING_SERVICE").url;


// SOA Gateway: Enhanced proxy configuration
const proxyOptions = (target, serviceName) => ({
  target,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error(`❌ Gateway Error: ${serviceName} - ${err.message}`);
    res.status(502).json({ 
      success: false,
      message: `Service ${serviceName} unavailable`, 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward original headers
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add gateway headers
    proxyRes.headers['x-powered-by'] = 'SOA-Gateway';
    proxyRes.headers['x-gateway-timestamp'] = new Date().toISOString();
  }
});


// SOA Gateway: Route all requests through gateway
app.use("/users", createProxyMiddleware(proxyOptions(USER_SERVICE, "User Service")));
app.use("/books", createProxyMiddleware(proxyOptions(BOOK_SERVICE, "Book Service")));
app.use("/borrows", createProxyMiddleware(proxyOptions(BORROW_SERVICE, "Borrow Service")));
app.use("/logs", createProxyMiddleware(proxyOptions(LOGGING_SERVICE, "Logging Service")));


// SOA Gateway: Enhanced health check
app.get("/health", async (req, res) => {
  const services = {
    "User Service": USER_SERVICE,
    "Book Service": BOOK_SERVICE,
    "Borrow Service": BORROW_SERVICE,
    "Logging Service": LOGGING_SERVICE
  };

  const healthChecks = await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        return { service: name, status: 'healthy', url };
      } catch (error) {
        return { service: name, status: 'unhealthy', url, error: error.message };
      }
    })
  );

  const results = healthChecks.map(result => result.value);
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  
  res.json({
    gateway: {
      status: "ok",
      service: "SOA API Gateway",
      timestamp: new Date().toISOString(),
      port: PORT
    },
    services: results,
    summary: {
      total: results.length,
      healthy: healthyCount,
      unhealthy: results.length - healthyCount,
      overall: healthyCount === results.length ? 'healthy' : 'degraded'
    }
  });
});

const PORT = getServiceConfig("API_GATEWAY").port;
app.listen(PORT, () => {
  console.log(`\n� SOA API Gateway started successfully!`);
  console.log(`🔀 Gateway URL: http://localhost:${PORT}`);
  console.log(`\n📋 Service Registry (via Gateway):`);
  console.log(`   🔗 /users   → ${USER_SERVICE}`);
  console.log(`   🔗 /books   → ${BOOK_SERVICE}`);
  console.log(`   🔗 /borrows → ${BORROW_SERVICE}`);
  console.log(`   🔗 /logs    → ${LOGGING_SERVICE}`);
  console.log(`\n✅ All client requests now route through Gateway`);
  console.log(`✅ Service-to-service calls route through Gateway`);
  console.log(`✅ SOA Architecture: Complete\n`);
});
