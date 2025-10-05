const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    service: { type: String, required: true }, // service nào gửi log
    action: { type: String, required: true }, // hành động gì
    user: {
      id: { type: String },
      username: { type: String },
    }, // id hoặc username
    details: { type: Object }, // dữ liệu bổ sung
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema, "logs");
