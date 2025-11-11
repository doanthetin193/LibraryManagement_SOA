const axios = require("axios");

/**
 * ✅ SOA PATTERN: Gửi log QUA API GATEWAY
 *
 * Lý do qua Gateway:
 * 1. Tuân thủ SOA Architecture (all communication via ESB)
 * 2. Tận dụng Service Discovery (Consul)
 * 3. Dynamic routing (Logging Service đổi port không cần sửa code)
 * 4. Centralized monitoring & metrics
 * 5. Circuit breaker & fallback support
 *
 * Xử lý khi service down:
 * - Gateway down → catch error → silently fail → service chính vẫn chạy ✅
 * - Logging down → Gateway return 503 → catch error → silently fail → service chính vẫn chạy ✅
 *
 * Kết luận: Dù Gateway hay Logging down, service chính KHÔNG BỊ ẢNH HƯỞNG!
 */
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:5000";
const LOGGING_ENDPOINT = `${GATEWAY_URL}/logs`; // Qua Gateway

/**
 * Gửi log đến Logging Service qua API Gateway
 * @param {string} service - Service name
 * @param {string} action - Action name (eg: REGISTER, LOGIN_SUCCESS)
 * @param {object} user - { id, username }
 * @param {object} details - Extra details
 * @param {string} level - info | warn | error
 */
const sendLog = async (
  service,
  action,
  user = {},
  details = {},
  level = "info"
) => {
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

    // ✅ GỌI QUA GATEWAY thay vì direct
    await axios.post(LOGGING_ENDPOINT, logData, {
      timeout: 3000, // 3 seconds (tăng lên vì qua Gateway)
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // ✅ SILENTLY FAIL - Logging fail KHÔNG làm crash service chính
    // Đáp ứng yêu cầu: "Service down không ảnh hưởng services khác"

    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️ [${service}] Logging failed: ${error.message}`);
    }

    // Optional: Write to local file as fallback
    // const fs = require('fs').promises;
    // await fs.appendFile('local-logs.txt', JSON.stringify(logData) + '\n');
  }
};

module.exports = { sendLog };
