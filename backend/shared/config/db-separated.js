const mongoose = require("mongoose");

// Create separate connections for each service
const createConnection = (dbName, serviceName) => {
  const connection = mongoose.createConnection(
    process.env.MONGO_URI.replace('libraryDB', dbName)
  );
  
  connection.on('connected', () => {
    console.log(`✅ ${serviceName} connected to ${dbName}`);
  });
  
  connection.on('error', (err) => {
    console.error(`❌ ${serviceName} database error:`, err);
  });
  
  return connection;
};

// Service-specific database connections
const userDB = createConnection('userDB', 'User Service');
const bookDB = createConnection('bookDB', 'Book Service');
const borrowDB = createConnection('borrowDB', 'Borrow Service');
const loggingDB = createConnection('loggingDB', 'Logging Service');

module.exports = {
  userDB,
  bookDB,
  borrowDB,
  loggingDB
};