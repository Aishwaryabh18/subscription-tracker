// config/db.js
// This file handles connection to MongoDB database

const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 * Why async? Database connection takes time, we don't want to block other code
 */
const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise
    // await waits for the connection to complete
    // MongoDB 8.x doesn't need these options anymore (they're defaults now)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // If successful, log the host we connected to
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Optional: Log database name
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    // If connection fails, log error and exit process
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Exit process with failure code
    // Why? If DB connection fails, app can't function properly
    process.exit(1);
  }
};

/**
 * Handle MongoDB connection events
 * These listeners help us know what's happening with the database
 */
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected");
});

// Handle app termination gracefully
// When app shuts down, close DB connection properly
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed due to app termination");
  process.exit(0);
});

// Export the connection function so we can use it in server.js
module.exports = connectDB;
