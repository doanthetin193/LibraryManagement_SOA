// backend/shared/middlewares/errorHandler.js
const { sendLog } = require("../utils/logger");

/**
 * Centralized error handling middleware
 */
const errorHandler = (serviceName) => {
  return (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    const logError = async () => {
      try {
        await sendLog(
          serviceName,
          "ERROR",
          req.user ? { id: req.user.id, username: req.user.username } : {},
          {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip
          },
          "error"
        );
      } catch (logErr) {
        console.error("Failed to log error:", logErr.message);
      }
    };

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      const message = "Resource not found";
      error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = "Duplicate field value entered";
      error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(val => val.message).join(", ");
      error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      const message = "Invalid token";
      error = { message, statusCode: 401 };
    }

    if (err.name === "TokenExpiredError") {
      const message = "Token expired";
      error = { message, statusCode: 401 };
    }

    // Log the error asynchronously
    logError();

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    });
  };
};

module.exports = { errorHandler };