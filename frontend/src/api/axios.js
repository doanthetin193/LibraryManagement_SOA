import axios from "axios";

// Tạo multiple APIs cho từng service
const createAPI = (baseURL) => {
  const api = axios.create({ baseURL });
  
  // Gắn token vào header nếu có
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return api;
};

// SOA Architecture: All requests go through API Gateway
const API_GATEWAY_URL = "http://localhost:5000";

export const userAPI = createAPI(`${API_GATEWAY_URL}/users`);
export const bookAPI = createAPI(`${API_GATEWAY_URL}/books`);
export const borrowAPI = createAPI(`${API_GATEWAY_URL}/borrows`);
export const logAPI = createAPI(`${API_GATEWAY_URL}/logs`);
