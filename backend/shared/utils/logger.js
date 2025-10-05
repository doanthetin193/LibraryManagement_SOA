const axios = require("axios");

const LOGGING_URL = process.env.LOGGING_URL || "http://localhost:5004";

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

    await axios.post(LOGGING_URL, logData);
  } catch {
    // Silently handle logging errors
  }
};

module.exports = { sendLog };
