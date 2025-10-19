// backend/shared/config/services.js
/**
 * Dynamic Service Discovery with Auto Health Monitoring
 * SOA Pattern: Service Registry with automatic health checks
 */

const axios = require("axios");
const EventEmitter = require("events");

// Service Registry Event Emitter
const serviceEvents = new EventEmitter();

// Initial Service Configuration
const SERVICE_CONFIG = {
  USER_SERVICE: {
    name: "User Service",
    port: process.env.USER_PORT || 5001,
    url: process.env.USER_SERVICE_URL || `http://localhost:${process.env.USER_PORT || 5001}`,
    status: "unknown",
    lastCheck: null,
    failureCount: 0
  },
  BOOK_SERVICE: {
    name: "Book Service", 
    port: process.env.BOOK_PORT || 5002,
    url: process.env.BOOK_SERVICE_URL || `http://localhost:${process.env.BOOK_PORT || 5002}`,
    status: "unknown",
    lastCheck: null,
    failureCount: 0
  },
  BORROW_SERVICE: {
    name: "Borrow Service",
    port: process.env.BORROW_PORT || 5003,
    url: process.env.BORROW_SERVICE_URL || `http://localhost:${process.env.BORROW_PORT || 5003}`,
    status: "unknown",
    lastCheck: null,
    failureCount: 0
  },
  LOGGING_SERVICE: {
    name: "Logging Service",
    port: process.env.LOGGING_PORT || 5004,
    url: process.env.LOGGING_SERVICE_URL || `http://localhost:${process.env.LOGGING_PORT || 5004}`,
    status: "unknown",
    lastCheck: null,
    failureCount: 0
  },
  API_GATEWAY: {
    name: "API Gateway",
    port: process.env.GATEWAY_PORT || 5000,
    url: process.env.GATEWAY_URL || `http://localhost:${process.env.GATEWAY_PORT || 5000}`,
    status: "unknown",
    lastCheck: null,
    failureCount: 0
  }
};

/**
 * Dynamic Service Registry - stores runtime service instances
 */
class ServiceRegistry {
  constructor() {
    this.services = { ...SERVICE_CONFIG };
    this.healthCheckInterval = null;
    this.healthCheckFrequency = 60000; // 60 seconds (reduced from 30s to reduce console spam)
    this.maxFailures = 3; // Max failures before marking as down
  }

  /**
   * Register a new service dynamically (for future scaling)
   */
  register(serviceName, config) {
    this.services[serviceName] = {
      ...config,
      status: "unknown",
      lastCheck: null,
      failureCount: 0
    };
    console.log(`✅ Service registered: ${serviceName} at ${config.url}`);
    serviceEvents.emit("service:registered", { serviceName, config });
  }

  /**
   * Unregister a service
   */
  unregister(serviceName) {
    if (this.services[serviceName]) {
      delete this.services[serviceName];
      console.log(`❌ Service unregistered: ${serviceName}`);
      serviceEvents.emit("service:unregistered", { serviceName });
    }
  }

  /**
   * Get service configuration with current health status
   */
  getService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service not found in registry: ${serviceName}`);
    }
    return service;
  }

  /**
   * Get all services
   */
  getAllServices() {
    return this.services;
  }

  /**
   * Check health of a single service
   */
  async checkServiceHealth(serviceName) {
    const service = this.services[serviceName];
    if (!service) return;

    try {
      const response = await axios.get(`${service.url}/health`, { 
        timeout: 3000,
        validateStatus: (status) => status === 200
      });
      
      const wasDown = service.status === "down";
      const wasUnknown = service.status === "unknown";
      
      // Update service status
      service.status = "healthy";
      service.lastCheck = new Date();
      service.failureCount = 0;
      service.responseTime = response.headers['x-response-time'] || 'N/A';

      // Only log recovery, not regular healthy checks (reduce console spam)
      if (wasDown) {
        console.log(`🟢 ${service.name} is back online!`);
        serviceEvents.emit("service:up", { serviceName, service });
      } else if (wasUnknown) {
        // Log initial discovery
        console.log(`✅ ${service.name} discovered and healthy`);
      }

      return { serviceName, status: "healthy", data: response.data };
    } catch (error) {
      service.failureCount++;
      service.lastCheck = new Date();

      // Mark as down after max failures
      if (service.failureCount >= this.maxFailures) {
        const wasHealthy = service.status === "healthy" || service.status === "degraded";
        service.status = "down";
        
        // Only log once when first marked as down
        if (wasHealthy) {
          console.log(`🔴 ${service.name} is down! (${service.failureCount} failures)`);
          serviceEvents.emit("service:down", { serviceName, service, error: error.message });
        }
      } else {
        const wasDegraded = service.status === "degraded";
        service.status = "degraded";
        
        // Only log first degradation
        if (!wasDegraded && service.status !== "down") {
          console.log(`🟡 ${service.name} is degraded (${service.failureCount} failures)`);
        }
      }

      return { 
        serviceName, 
        status: service.status, 
        error: error.message,
        failureCount: service.failureCount 
      };
    }
  }

  /**
   * Check health of all services
   */
  async checkAllServicesHealth() {
    const results = await Promise.allSettled(
      Object.keys(this.services)
        .filter(name => name !== 'API_GATEWAY') // Don't check Gateway itself
        .map(name => this.checkServiceHealth(name))
    );
    
    return results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason });
  }

  /**
   * Start automatic health monitoring
   */
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      console.log("⚠️  Health monitoring already running");
      return;
    }

    console.log(`🏥 Starting automatic health monitoring (every ${this.healthCheckFrequency/1000}s)`);
    
    // Initial health check
    this.checkAllServicesHealth();

    // Periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.checkAllServicesHealth();
    }, this.healthCheckFrequency);
  }

  /**
   * Stop automatic health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log("🛑 Health monitoring stopped");
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    // Filter out API_GATEWAY from stats (it monitors others, not itself)
    const services = Object.entries(this.services)
      .filter(([key]) => key !== 'API_GATEWAY')
      .map(([, service]) => service);
    
    return {
      total: services.length,
      healthy: services.filter(s => s.status === "healthy").length,
      degraded: services.filter(s => s.status === "degraded").length,
      down: services.filter(s => s.status === "down").length,
      unknown: services.filter(s => s.status === "unknown").length
    };
  }
}

// Singleton instance
const registry = new ServiceRegistry();

/**
 * Get service configuration by name (with current health status)
 * @param {string} serviceName - Service name (USER_SERVICE, BOOK_SERVICE, etc.)
 * @returns {object} Service configuration with health status
 */
const getServiceConfig = (serviceName) => {
  return registry.getService(serviceName);
};

/**
 * Get all service configurations
 * @returns {object} All service configurations with health status
 */
const getAllServices = () => {
  return registry.getAllServices();
};

/**
 * Health check endpoints for all services
 */
const HEALTH_ENDPOINTS = Object.fromEntries(
  Object.entries(SERVICE_CONFIG).map(([key, config]) => [
    key,
    `${config.url}/health`
  ])
);

module.exports = {
  SERVICE_CONFIG,
  serviceRegistry: registry,
  getServiceConfig,
  getAllServices,
  HEALTH_ENDPOINTS,
  serviceEvents
};