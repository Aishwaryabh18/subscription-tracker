// middleware/validation.js
// Validates user input using express-validator

const { body, validationResult } = require("express-validator");

/**
 * Validation rules for user registration
 *
 * Why validate?
 * - Prevent invalid data from entering database
 * - Security (prevent malicious input)
 * - Better error messages for users
 */
const validateRegister = [
  // Name validation
  body("name")
    .trim() // Remove whitespace from start/end
    .notEmpty() // Must not be empty
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail() // Check if valid email format
    .withMessage("Please provide a valid email")
    .normalizeEmail(), // Convert to lowercase, remove dots in Gmail, etc.

  // Password validation
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/) // Must contain at least one number
    .withMessage("Password must contain at least one number"),

  // Confirm password validation
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      // Custom validator: check if passwords match
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for creating/updating subscription
 */
const validateSubscription = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subscription name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("cost")
    .notEmpty()
    .withMessage("Cost is required")
    .isFloat({ min: 0 }) // Must be a positive number
    .withMessage("Cost must be a positive number"),

  body("billingCycle")
    .notEmpty()
    .withMessage("Billing cycle is required")
    .isIn(["weekly", "monthly", "quarterly", "yearly"]) // Must be one of these
    .withMessage("Invalid billing cycle"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Entertainment",
      "Software",
      "Fitness",
      "Education",
      "Cloud Storage",
      "News & Media",
      "Gaming",
      "Utilities",
      "Other",
    ])
    .withMessage("Invalid category"),

  body("nextBillingDate")
    .notEmpty()
    .withMessage("Next billing date is required")
    .isISO8601() // Must be valid date format (YYYY-MM-DD)
    .withMessage("Invalid date format. Use YYYY-MM-DD"),

  // Optional fields validation
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),

  body("website")
    .optional()
    .trim()
    .isURL() // Must be valid URL
    .withMessage("Invalid URL format"),
];

/**
 * Middleware to check validation results
 *
 * This runs AFTER validation rules
 * If validation fails, return errors
 * If validation passes, continue to controller
 */
const handleValidationErrors = (req, res, next) => {
  // Get validation errors from request
  const errors = validationResult(req);

  // If there are errors
  if (!errors.isEmpty()) {
    // Format errors into array of messages
    const errorMessages = errors.array().map((error) => ({
      field: error.path, // Which field has error
      message: error.msg, // Error message
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }

  // No errors, continue to controller
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSubscription,
  handleValidationErrors,
};
