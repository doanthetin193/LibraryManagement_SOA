// backend/scripts/health-check.js
const axios = require("axios");

// Health endpoints
const HEALTH_ENDPOINTS = {
  API_GATEWAY: "http://localhost:5000/health",
  USER_SERVICE: "http://localhost:5001/health",
  BOOK_SERVICE: "http://localhost:5002/health",
  BORROW_SERVICE: "http://localhost:5003/health",
  LOGGING_SERVICE: "http://localhost:5004/health"
};

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function checkService(name, url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`${colors.green}✅ ${name}: ${response.data.status}${colors.reset}`);
    return { name, status: 'ok', data: response.data };
  } catch (error) {
    console.log(`${colors.red}❌ ${name}: ${error.message}${colors.reset}`);
    return { name, status: 'error', error: error.message };
  }
}

async function runHealthCheck() {
  console.log(`${colors.blue}🔍 Running SOA Health Check...${colors.reset}\n`);
  
  const services = [
    { name: "API Gateway", url: HEALTH_ENDPOINTS.API_GATEWAY },
    { name: "User Service", url: HEALTH_ENDPOINTS.USER_SERVICE },
    { name: "Book Service", url: HEALTH_ENDPOINTS.BOOK_SERVICE },
    { name: "Borrow Service", url: HEALTH_ENDPOINTS.BORROW_SERVICE },
    { name: "Logging Service", url: HEALTH_ENDPOINTS.LOGGING_SERVICE }
  ];

  const results = await Promise.all(
    services.map(service => checkService(service.name, service.url))
  );

  const healthy = results.filter(r => r.status === 'ok').length;
  const total = results.length;

  console.log(`\n${colors.blue}📊 Health Check Summary:${colors.reset}`);
  console.log(`${colors.green}Healthy: ${healthy}/${total}${colors.reset}`);
  
  if (healthy === total) {
    console.log(`${colors.green}🎉 All services are running!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Some services are down.${colors.reset}`);
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };