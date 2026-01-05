const { validateEnv, requiredEnvVars } = require("../validateEnv");

describe("validateEnv", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    // Restore original env
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  test("throws when required vars missing", () => {
    // Remove required vars
    for (const k of requiredEnvVars) {
      delete process.env[k];
    }

    expect(() => validateEnv()).toThrow(
      /Missing required environment variables/
    );
  });

  test("returns true when all required vars present", () => {
    // Set all required vars
    for (const k of requiredEnvVars) {
      process.env[k] = "dummy";
    }

    expect(validateEnv()).toBe(true);
  });
});
