// server.js
// Main entry point - starts the server

require("dotenv").config(); // Load environment variables
const app = require("./src/app");
const connectDB = require("./src/config/db");

// Define port
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
