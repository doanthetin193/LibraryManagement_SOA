// backend/api-gateway/server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Lấy port từ .env (bạn đã có trong backend/.env)
const USER_SERVICE = `http://localhost:${process.env.USER_PORT || 5001}`;
const BOOK_SERVICE = `http://localhost:${process.env.BOOK_PORT || 5002}`;
const BORROW_SERVICE = `http://localhost:${process.env.BORROW_PORT || 5003}`;
const LOGGING_SERVICE = `http://localhost:${process.env.LOGGING_PORT || 5004}`;

// Proxy options chung (giữ headers, forward req body, preserve auth header)
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    res.status(502).json({ message: "Bad gateway", error: err.message });
  }
});

// Routes: frontend calls /users, /books, /borrows, /logs, /notifications
app.use("/users", createProxyMiddleware(proxyOptions(USER_SERVICE)));
app.use("/books", createProxyMiddleware(proxyOptions(BOOK_SERVICE)));
app.use("/borrows", createProxyMiddleware(proxyOptions(BORROW_SERVICE)));
app.use("/logs", createProxyMiddleware(proxyOptions(LOGGING_SERVICE)));

// Health check for gateway
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "api-gateway" })
);

const PORT = process.env.GATEWAY_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔀 API Gateway running on port ${PORT}`);
});
