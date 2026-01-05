const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRE",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "FRONTEND_URL",
];

function validateEnv(vars = requiredEnvVars) {
  const missingVars = vars.filter((k) => !process.env[k]);
  if (missingVars.length) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
  return true;
}

module.exports = { validateEnv, requiredEnvVars };
