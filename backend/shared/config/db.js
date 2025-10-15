const mongoose = require("mongoose");

// SOA Architecture: All services share the same database
// Unlike Microservices, we use a single MongoDB database
const connectDB = async (serviceName) => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // libraryDB
    console.log(`✅ ${serviceName} connected to shared database`);
  } catch (err) {
    console.error(`❌ ${serviceName} DB connection failed`);
    process.exit(1);
  }
};

module.exports = connectDB;
