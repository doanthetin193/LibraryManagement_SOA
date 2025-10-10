// backend/shared/config/services.js
/**
 * Service configuration and registry
 * Centralized service URLs and settings
 */

const SERVICE_CONFIG = {
  USER_SERVICE: {
    name: "User Service",
    port: process.env.USER_PORT || 5001,
    url: process.env.USER_SERVICE_URL || `http://localhost:${process.env.USER_PORT || 5001}`
  },
  BOOK_SERVICE: {
    name: "Book Service", 
    port: process.env.BOOK_PORT || 5002,
    url: process.env.BOOK_SERVICE_URL || `http://localhost:${process.env.BOOK_PORT || 5002}`
  },
  BORROW_SERVICE: {
    name: "Borrow Service",
    port: process.env.BORROW_PORT || 5003,
    url: process.env.BORROW_SERVICE_URL || `http://localhost:${process.env.BORROW_PORT || 5003}`
  },
  LOGGING_SERVICE: {
    name: "Logging Service",
    port: process.env.LOGGING_PORT || 5004,
    url: process.env.LOGGING_SERVICE_URL || `http://localhost:${process.env.LOGGING_PORT || 5004}`
  },
  API_GATEWAY: {
    name: "API Gateway",
    port: process.env.GATEWAY_PORT || 5000,
    url: process.env.GATEWAY_URL || `http://localhost:${process.env.GATEWAY_PORT || 5000}`
  }
};

/**
 * Get service configuration by name
 * @param {string} serviceName - Service name (USER_SERVICE, BOOK_SERVICE, etc.)
 * @returns {object} Service configuration
 */
const getServiceConfig = (serviceName) => {
  const config = SERVICE_CONFIG[serviceName];
  if (!config) {
    throw new Error(`Service configuration not found for: ${serviceName}`);
  }
  return config;
};

/**
 * Get all service configurations
 * @returns {object} All service configurations
 */
const getAllServices = () => SERVICE_CONFIG;

/**
 * Health check endpoints for all services
 */
const HEALTH_ENDPOINTS = {
  USER_SERVICE: `${SERVICE_CONFIG.USER_SERVICE.url}/health`,
  BOOK_SERVICE: `${SERVICE_CONFIG.BOOK_SERVICE.url}/health`,
  BORROW_SERVICE: `${SERVICE_CONFIG.BORROW_SERVICE.url}/health`,
  LOGGING_SERVICE: `${SERVICE_CONFIG.LOGGING_SERVICE.url}/health`,
  API_GATEWAY: `${SERVICE_CONFIG.API_GATEWAY.url}/health`
};

module.exports = {
  SERVICE_CONFIG,
  getServiceConfig,
  getAllServices,
  HEALTH_ENDPOINTS
};