const axios = require("axios");

// Logging service: Direct URL (fallback if Consul not available)
const LOGGING_URL = process.env.LOGGING_SERVICE_URL || "http://localhost:5004";

/**
 * Gửi log đến Logging Service
 * @param {string} service - Service name
 * @param {string} action - Action name (eg: REGISTER, LOGIN_SUCCESS)
 * @param {object} user - { id, username }
 * @param {object} details - Extra details
 * @param {string} level - info | warn | error
 */
const sendLog = async (service, action, user = {}, details = {}, level = "info") => {
  try {
    const logData = {
      service,
      action,
      user: {
        id: user.id || null,
        username: user.username || null,
      },
      details,
      level,
      timestamp: new Date(),
    };

    await axios.post(LOGGING_URL, logData, {
      timeout: 2000, // Reduce timeout to 2 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Silently fail for logging to avoid cascading errors
    // Only log critical errors to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [${service}] Logging failed: ${error.message}`);
    }
    
    // Could also write to local log file as fallback
    // or send to another logging system
  }
};

module.exports = { sendLog };
