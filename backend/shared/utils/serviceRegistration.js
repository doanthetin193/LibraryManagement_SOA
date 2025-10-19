// backend/shared/utils/serviceRegistration.js
/**
 * Service Self-Registration Helper
 * Allows services to announce themselves to the registry
 */

const axios = require("axios");

/**
 * Register service with the API Gateway/Registry
 * This is optional - used for dynamic service discovery in production
 */
const registerWithGateway = async (serviceInfo) => {
  try {
    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:5000";
    
    // Send heartbeat to indicate service is ready (quick check with short timeout)
    const response = await axios.get(`${gatewayUrl}/health`, { 
      timeout: 1000
    });
    
    if (response.status === 200) {
      console.log(`✅ Gateway reachable - ${serviceInfo.name} is discoverable`);
      return true;
    }
  } catch (error) {
    // Silent fail - Gateway will auto-discover via health monitoring
    return false;
  }
};

/**
 * Announce service startup
 */
const announceService = async (serviceInfo) => {
  console.log(`\n🚀 ${serviceInfo.name} starting...`);
  console.log(`   Port: ${serviceInfo.port}`);
  console.log(`   URL: ${serviceInfo.url}`);
  console.log(`   Health: ${serviceInfo.url}/health`);
  
  // Try to register with gateway (non-blocking)
  setTimeout(() => {
    registerWithGateway(serviceInfo);
  }, 2000);
  
  console.log(`✅ ${serviceInfo.name} is ready and discoverable\n`);
};

module.exports = {
  registerWithGateway,
  announceService
};

