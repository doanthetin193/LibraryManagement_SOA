
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const { getServiceConfig } = require("../shared/config/services");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


const USER_SERVICE = getServiceConfig("USER_SERVICE").url;
const BOOK_SERVICE = getServiceConfig("BOOK_SERVICE").url;
const BORROW_SERVICE = getServiceConfig("BORROW_SERVICE").url;
const LOGGING_SERVICE = getServiceConfig("LOGGING_SERVICE").url;


const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    res.status(502).json({ message: "Bad gateway", error: err.message });
  }
});


app.use("/users", createProxyMiddleware(proxyOptions(USER_SERVICE)));
app.use("/books", createProxyMiddleware(proxyOptions(BOOK_SERVICE)));
app.use("/borrows", createProxyMiddleware(proxyOptions(BORROW_SERVICE)));
app.use("/logs", createProxyMiddleware(proxyOptions(LOGGING_SERVICE)));


app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "api-gateway" })
);

const PORT = getServiceConfig("API_GATEWAY").port;
app.listen(PORT, () => {
  console.log(`🔀 API Gateway running on port ${PORT}`);
  console.log(`📋 Service Registry:`);
  console.log(`   • User Service: ${USER_SERVICE}`);
  console.log(`   • Book Service: ${BOOK_SERVICE}`);
  console.log(`   • Borrow Service: ${BORROW_SERVICE}`);
  console.log(`   • Logging Service: ${LOGGING_SERVICE}`);
});
