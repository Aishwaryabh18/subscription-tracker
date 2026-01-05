// Main entry point - starts the server

require("dotenv").config(); // Load env

const { validateEnv } = require("./src/config/validateEnv");

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = require("./src/app");
const connectDB = require("./src/config/db");
const startReminderCron = require("./src/utils/reminderCron");

const PORT = process.env.PORT || 5000;

connectDB();

startReminderCron();

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
