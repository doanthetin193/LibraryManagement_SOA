// backend/services/borrow-service/helpers/serviceClient.js
const axios = require("axios");
const { getServiceConfig } = require("../../../shared/config/services");

// SOA Architecture: Use API Gateway for service-to-service communication
const API_GATEWAY_URL = getServiceConfig("API_GATEWAY").url;
const USER_SERVICE_URL = `${API_GATEWAY_URL}/users`;
const BOOK_SERVICE_URL = `${API_GATEWAY_URL}/books`;

/**
 * Lấy thông tin user từ User Service bằng token (cho current user)
 * @param {string} token - JWT token 
 * @returns {Promise<Object>} User data
 */
const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 3000 // 3 second timeout for service calls
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Lấy thông tin user từ User Service bằng user ID (admin only)
 * @param {string} userId - User ID
 * @param {string} token - Admin token
 * @returns {Promise<Object>} User data
 */
const getUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 3000
    });
    return response.data;
  } catch (error) {
    // Fallback nếu không lấy được user data
    return {
      _id: userId,
      username: "Unknown User",
      role: "user"
    };
  }
};

/**
 * Lấy thông tin sách từ Book Service
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Book data
 */
const getBookById = async (bookId) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/${bookId}`, {
      timeout: 3000
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get book: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Cập nhật số lượng sách còn lại
 * 🔒 Hỗ trợ atomic operation để tránh race condition
 * @param {string} bookId - Book ID
 * @param {number} availableCopies - New available copies count
 * @param {boolean} atomic - Nếu true, chỉ update nếu còn sách available (dùng cho borrow)
 * @returns {Promise<Object|null>} Updated book data, hoặc null nếu atomic fail
 */
const updateBookCopies = async (bookId, availableCopies, atomic = false) => {
  try {
    const response = await axios.put(`${BOOK_SERVICE_URL}/${bookId}/copies`, 
      { availableCopies, atomic },
      { timeout: 3000 }
    );
    
    // Kiểm tra atomic operation success
    if (atomic && response.data.success === false) {
      return null; // Race condition: sách đã hết
    }
    
    return response.data;
  } catch (error) {
    // Nếu là 409 (conflict) trong atomic mode, trả về null
    if (atomic && error.response?.status === 409) {
      return null;
    }
    throw new Error(`Failed to update book: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = {
  getCurrentUser,
  getUserById,
  getBookById,
  updateBookCopies
};