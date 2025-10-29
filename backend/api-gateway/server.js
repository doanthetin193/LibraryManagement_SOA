const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const { 
  getServiceUrl, 
  getAllServices, 
  registerService, 
  setupGracefulShutdown, 
  isConsulAvailable,
  consul
} = require("../shared/config/consulClient");

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

// SOA Gateway: Dynamic proxy configuration with Consul service discovery
const createDynamicProxy = (serviceName, displayName) => {
  return createProxyMiddleware({
    router: async (req) => {
      try {
        // Query Consul for healthy service instance
        const serviceUrl = await getServiceUrl(serviceName);
        return serviceUrl;
      } catch (error) {
        console.error(`❌ Gateway: Failed to get ${displayName} from Consul - ${error.message}`);
        throw error;
      }
    },
    changeOrigin: true,
    logLevel: 'warn',
    onError: (err, req, res) => {
      console.error(`❌ Gateway Error: ${displayName} - ${err.message}`);
      
      if (!res.headersSent) {
        res.status(502).json({ 
          success: false,
          message: `Service ${displayName} unavailable`, 
          error: err.message,
          timestamp: new Date().toISOString(),
          hint: "Service may be down or not registered with Consul"
        });
      }
    }
  });
};


// SOA Gateway: Route all requests through gateway with Consul-based dynamic proxies
app.use("/users", createDynamicProxy("user-service", "User Service"));
app.use("/books", createDynamicProxy("book-service", "Book Service"));
app.use("/borrows", createDynamicProxy("borrow-service", "Borrow Service"));
app.use("/logs", createDynamicProxy("logging-service", "Logging Service"));


// SOA Gateway: Service Registry endpoint - Query from Consul
app.get("/registry", async (req, res) => {
  try {
    const services = await getAllServices();
    
    // Get detailed health for each service
    const serviceDetails = await Promise.all(
      Object.keys(services)
        .filter(name => name !== 'consul') // Skip consul itself
        .map(async (serviceName) => {
          try {
            const instances = await consul.health.service({ 
              service: serviceName, 
              passing: false // Get all instances, not just healthy
            });
            
            return {
              name: serviceName,
              instances: instances.length,
              healthy: instances.filter(i => 
                i.Checks.every(check => check.Status === 'passing')
              ).length,
              tags: instances[0]?.Service?.Tags || [],
              addresses: instances.map(i => ({
                address: i.Service.Address,
                port: i.Service.Port,
                status: i.Checks.every(check => check.Status === 'passing') ? 'healthy' : 'unhealthy'
              }))
            };
          } catch (error) {
            return {
              name: serviceName,
              instances: 0,
              healthy: 0,
              error: error.message
            };
          }
        })
    );
    
    res.json({
      message: "SOA Service Registry (Powered by Consul)",
      timestamp: new Date().toISOString(),
      consulUrl: "http://localhost:8500",
      totalServices: serviceDetails.length,
      services: serviceDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to query service registry",
      error: error.message
    });
  }
});


// SOA Gateway: Enhanced health check with Consul registry info
app.get("/health", async (req, res) => {
  try {
    const services = await getAllServices();
    const serviceNames = Object.keys(services).filter(name => name !== 'consul');
    
    const healthChecks = await Promise.all(
      serviceNames.map(async (serviceName) => {
        try {
          const instances = await consul.health.service({ 
            service: serviceName, 
            passing: false 
          });
          
          const healthy = instances.filter(i => 
            i.Checks.every(check => check.Status === 'passing')
          ).length;
          
          return {
            service: serviceName,
            instances: instances.length,
            healthy: healthy,
            status: healthy === instances.length ? 'healthy' : 
                   healthy > 0 ? 'degraded' : 'down'
          };
        } catch (error) {
          return {
            service: serviceName,
            status: 'unknown',
            error: error.message
          };
        }
      })
    );
    
    const totalServices = healthChecks.length;
    const healthyServices = healthChecks.filter(s => s.status === 'healthy').length;
    const downServices = healthChecks.filter(s => s.status === 'down').length;
    
    res.json({
      gateway: {
        status: "ok",
        service: "SOA API Gateway (Consul)",
        timestamp: new Date().toISOString(),
        port: PORT
      },
      registry: {
        type: "Consul",
        url: "http://localhost:8500",
        monitoring: "automatic",
        checkInterval: "10s"
      },
      services: healthChecks,
      summary: {
        total: totalServices,
        healthy: healthyServices,
        degraded: healthChecks.filter(s => s.status === 'degraded').length,
        down: downServices,
        overall: healthyServices === totalServices ? 'healthy' : 
                downServices === 0 ? 'degraded' : 'critical'
      }
    });
  } catch (error) {
    res.status(500).json({
      gateway: {
        status: "ok",
        service: "SOA API Gateway",
        timestamp: new Date().toISOString(),
        port: PORT
      },
      error: "Failed to query Consul",
      message: error.message
    });
  }
});


const PORT = process.env.GATEWAY_PORT || 5000;
const SERVICE_NAME = "api-gateway";

app.listen(PORT, async () => {
  console.log(`\n🚀 SOA API Gateway started successfully!`);
  console.log(`🔀 Gateway URL: http://localhost:${PORT}`);
  
  // Register API Gateway with Consul
  try {
    const consulAvailable = await isConsulAvailable();
    
    if (consulAvailable) {
      await registerService({
        id: `${SERVICE_NAME}-${PORT}`,
        name: SERVICE_NAME,
        address: "localhost",
        port: PORT,
        tags: ["gateway", "proxy", "esb", "routing"],
        check: {
          http: `http://localhost:${PORT}/health`,
          interval: "10s",
          timeout: "5s"
        }
      });
      
      console.log(`\n✅ Features enabled:`);
      console.log(`   ✓ Consul Service Discovery`);
      console.log(`   ✓ Automatic Health Monitoring (Consul)`);
      console.log(`   ✓ Service Registry API (/registry)`);
      console.log(`   ✓ Health-aware Routing`);
      console.log(`   ✓ Consul Web UI: http://localhost:8500`);
      
      console.log(`\n📋 Registered routes:`);
      console.log(`   🔗 /users   → user-service`);
      console.log(`   🔗 /books   → book-service`);
      console.log(`   🔗 /borrows → borrow-service`);
      console.log(`   🔗 /logs    → logging-service`);
      
      console.log(`\n🏥 Health monitoring by Consul (10s interval)\n`);
      
      // Setup graceful shutdown
      setupGracefulShutdown(`${SERVICE_NAME}-${PORT}`);
    } else {
      console.warn("\n⚠️  Consul not available - Gateway running in standalone mode");
      console.log("   Services must be manually configured\n");
    }
  } catch (error) {
    console.error("\n❌ Failed to register with Consul:", error.message);
    console.log("⚠️  Gateway will continue without Consul registration\n");
  }
});
