const mongoose = require("mongoose");

const connectDB = async (serviceName) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch {
    process.exit(1);
  }
};

module.exports = connectDB;
