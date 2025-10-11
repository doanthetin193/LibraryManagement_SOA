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

// Export APIs cho từng service
export const userAPI = createAPI("http://localhost:5001");
export const bookAPI = createAPI("http://localhost:5002");
export const borrowAPI = createAPI("http://localhost:5003");
export const logAPI = createAPI("http://localhost:5004");
