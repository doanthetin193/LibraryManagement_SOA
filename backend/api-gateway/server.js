
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const { getServiceConfig, serviceRegistry, getAllServices, serviceEvents } = require("../shared/config/services");

require("dotenv").config();

const app = express();

// SOA Gateway: Enhanced CORS and middleware setup
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend URLs
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request logging middleware (skip health checks to reduce noise)
app.use((req, res, next) => {
  // Only log non-health check requests
  if (req.path !== '/health' && req.path !== '/registry') {
    console.log(`🔀 Gateway: ${req.method} ${req.path} from ${req.ip}`);
  }
  next();
});

// SOA Gateway: Dynamic proxy configuration with health-aware routing
const createDynamicProxy = (serviceName, displayName) => {
  return createProxyMiddleware({
    router: (req) => {
      const service = getServiceConfig(serviceName);
      
      // Warn if service is down but still try to route
      if (service.status === 'down') {
        console.warn(`⚠️  Routing to ${displayName} but service is marked as DOWN`);
      }
      
      return service.url;
    },
    changeOrigin: true,
    logLevel: 'warn',
    onError: (err, req, res) => {
      console.error(`❌ Gateway Error: ${displayName} - ${err.message}`);
      
      // Mark service as having issues
      const service = getServiceConfig(serviceName);
      service.failureCount++;
      
      if (!res.headersSent) {
        res.status(502).json({ 
          success: false,
          message: `Service ${displayName} unavailable`, 
          error: err.message,
          serviceStatus: service.status,
          timestamp: new Date().toISOString()
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Reset failure count on successful response
      const service = getServiceConfig(serviceName);
      if (proxyRes.statusCode < 500) {
        service.failureCount = 0;
      }
    }
  });
};


// SOA Gateway: Route all requests through gateway with dynamic proxies
app.use("/users", createDynamicProxy("USER_SERVICE", "User Service"));
app.use("/books", createDynamicProxy("BOOK_SERVICE", "Book Service"));
app.use("/borrows", createDynamicProxy("BORROW_SERVICE", "Borrow Service"));
app.use("/logs", createDynamicProxy("LOGGING_SERVICE", "Logging Service"));


// SOA Gateway: Service Registry endpoint
app.get("/registry", (req, res) => {
  const services = getAllServices();
  const stats = serviceRegistry.getStats();
  
  res.json({
    message: "SOA Service Registry",
    timestamp: new Date().toISOString(),
    statistics: stats,
    services: Object.entries(services)
      .filter(([key]) => key !== 'API_GATEWAY') // Don't include Gateway in its own registry
      .map(([key, service]) => ({
        key,
        name: service.name,
        url: service.url,
        port: service.port,
        status: service.status,
        lastCheck: service.lastCheck,
        failureCount: service.failureCount,
        healthEndpoint: `${service.url}/health`
      }))
  });
});


// SOA Gateway: Enhanced health check with registry info
app.get("/health", async (req, res) => {
  const healthResults = await serviceRegistry.checkAllServicesHealth();
  const stats = serviceRegistry.getStats();
  
  res.json({
    gateway: {
      status: "ok",
      service: "SOA API Gateway",
      timestamp: new Date().toISOString(),
      port: PORT
    },
    registry: {
      statistics: stats,
      monitoring: "automatic",
      checkInterval: `${serviceRegistry.healthCheckFrequency / 1000}s`
    },
    services: healthResults,
    summary: {
      total: stats.total,
      healthy: stats.healthy,
      degraded: stats.degraded,
      down: stats.down,
      overall: stats.healthy === stats.total ? 'healthy' : 
               stats.down === 0 ? 'degraded' : 'critical'
    }
  });
});


const PORT = getServiceConfig("API_GATEWAY").port;
app.listen(PORT, () => {
  console.log(`\n🚀 SOA API Gateway started successfully!`);
  console.log(`🔀 Gateway URL: http://localhost:${PORT}`);
  
  // Start automatic health monitoring
  serviceRegistry.startHealthMonitoring();
  
  console.log(`\n📋 Dynamic Service Registry:`);
  const services = getAllServices();
  Object.entries(services).forEach(([key, service]) => {
    if (key !== 'API_GATEWAY') {
      console.log(`   🔗 /${key.toLowerCase().replace('_service', '')}s → ${service.url} [${service.status}]`);
    }
  });
  
  console.log(`\n✅ Features enabled:`);
  console.log(`   ✓ Dynamic Service Discovery`);
  console.log(`   ✓ Automatic Health Monitoring (every 60s)`);
  console.log(`   ✓ Service Registry API (/registry)`);
  console.log(`   ✓ Health-aware Routing`);
  console.log(`   ✓ Auto-recovery Detection`);
  console.log(`   ✓ Silent Health Checks (reduced console spam)`);
  console.log(`\n🏥 Health monitoring is running in background...\n`);
});

// Listen to service events
serviceEvents.on('service:down', ({ serviceName, service }) => {
  console.log(`\n⚠️  ALERT: ${service.name} is DOWN!`);
  console.log(`   URL: ${service.url}`);
  console.log(`   Failures: ${service.failureCount}`);
  console.log(`   Will keep monitoring for recovery...\n`);
});

serviceEvents.on('service:up', ({ serviceName, service }) => {
  console.log(`\n✅ RECOVERY: ${service.name} is back online!`);
  console.log(`   URL: ${service.url}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Gateway...');
  serviceRegistry.stopHealthMonitoring();
  process.exit(0);
});

