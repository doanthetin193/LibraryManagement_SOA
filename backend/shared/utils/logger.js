const axios = require("axios");
const { getServiceConfig } = require("../config/services");

const LOGGING_URL = getServiceConfig("LOGGING_SERVICE").url;

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
      timeout: 5000, // 5 second timeout
    });
  } catch (error) {
    // Log to console if logging service is unavailable
    console.error(`[${service}] Failed to send log to logging service:`, {
      action,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Could also write to local log file as fallback
    // or send to another logging system
  }
};

module.exports = { sendLog };
