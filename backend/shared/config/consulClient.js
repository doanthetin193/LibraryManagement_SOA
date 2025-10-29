// backend/shared/config/consulClient.js
/**
 * Consul Service Discovery Client
 * Replaces manual service registry with Consul
 */

const Consul = require('consul');

// Initialize Consul client
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true
});

/**
 * Register a service with Consul
 * @param {Object} config - Service configuration
 * @param {string} config.id - Unique service ID (e.g., "user-service-5001")
 * @param {string} config.name - Service name (e.g., "user-service")
 * @param {string} config.address - Service address (e.g., "localhost")
 * @param {number} config.port - Service port (e.g., 5001)
 * @param {Array} config.tags - Service tags (optional)
 * @param {Object} config.check - Health check configuration
 */
async function registerService(config) {
  try {
    const serviceConfig = {
      id: config.id,
      name: config.name,
      address: config.address || 'localhost',
      port: parseInt(config.port),
      tags: config.tags || [],
      check: {
        http: config.check?.http || `http://${config.address || 'localhost'}:${config.port}/health`,
        interval: config.check?.interval || '10s',
        timeout: config.check?.timeout || '5s'
      }
    };

    await consul.agent.service.register(serviceConfig);
    
    console.log(`✅ [Consul] Service registered: ${config.name} (${config.id}) at ${config.address}:${config.port}`);
    console.log(`   Health check: ${serviceConfig.check.http} every ${serviceConfig.check.interval}`);
    
    return { success: true, serviceId: config.id };
  } catch (error) {
    console.error(`❌ [Consul] Failed to register service ${config.name}:`, error.message);
    console.error(`   Debug - Config sent:`, JSON.stringify(serviceConfig, null, 2));
    throw error;
  }
}

/**
 * Deregister a service from Consul
 * @param {string} serviceId - Service ID to deregister
 */
async function deregisterService(serviceId) {
  try {
    await consul.agent.service.deregister(serviceId);
    console.log(`✅ [Consul] Service deregistered: ${serviceId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Consul] Failed to deregister service ${serviceId}:`, error.message);
    throw error;
  }
}

/**
 * Get healthy instances of a service
 * @param {string} serviceName - Name of the service to query
 * @param {boolean} onlyHealthy - Return only healthy instances (default: true)
 * @returns {Array} Array of service instances
 */
async function getService(serviceName, onlyHealthy = true) {
  try {
    const services = await consul.health.service({
      service: serviceName,
      passing: onlyHealthy
    });

    if (!services || services.length === 0) {
      console.warn(`⚠️  [Consul] No ${onlyHealthy ? 'healthy ' : ''}instances found for service: ${serviceName}`);
      return [];
    }

    // Map to simpler format
    const instances = services.map(s => ({
      id: s.Service.ID,
      name: s.Service.Service,
      address: s.Service.Address,
      port: s.Service.Port,
      tags: s.Service.Tags,
      status: s.Checks.every(check => check.Status === 'passing') ? 'healthy' : 'unhealthy'
    }));

    return instances;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get service ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * Get all registered services
 * @returns {Object} Object with service names as keys
 */
async function getAllServices() {
  try {
    const services = await consul.catalog.services();
    console.log(`📋 [Consul] Found ${Object.keys(services).length} registered services`);
    return services;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get all services:`, error.message);
    throw error;
  }
}

/**
 * Get service URL for proxying (returns first healthy instance)
 * @param {string} serviceName - Name of the service
 * @returns {string} Service URL (e.g., "http://localhost:5001")
 */
async function getServiceUrl(serviceName) {
  try {
    const instances = await getService(serviceName, true);
    
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    // Return first healthy instance (can implement load balancing here)
    const instance = instances[0];
    const url = `http://${instance.address}:${instance.port}`;
    
    return url;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get URL for service ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * Setup graceful shutdown - deregister service on process exit
 * @param {string} serviceId - Service ID to deregister on shutdown
 */
function setupGracefulShutdown(serviceId) {
  const shutdown = async (signal) => {
    console.log(`\n🛑 [${signal}] Shutting down gracefully...`);
    try {
      await deregisterService(serviceId);
      console.log(`✅ Service ${serviceId} deregistered from Consul`);
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error during shutdown:`, error.message);
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error);
    try {
      await deregisterService(serviceId);
    } catch (e) {
      console.error('Failed to deregister during uncaught exception');
    }
    process.exit(1);
  });
}

/**
 * Check if Consul is available
 * @returns {boolean} True if Consul is reachable
 */
async function isConsulAvailable() {
  try {
    await consul.agent.self();
    return true;
  } catch (error) {
    console.error('❌ [Consul] Consul is not available:', error.message);
    return false;
  }
}

module.exports = {
  consul,
  registerService,
  deregisterService,
  getService,
  getAllServices,
  getServiceUrl,
  setupGracefulShutdown,
  isConsulAvailable
};
