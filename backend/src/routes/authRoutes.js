// routes/authRoutes.js
// Defines API endpoints for authentication

const express = require("express");
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

// Import middleware
const { protect } = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

/**
 * Route structure:
 * router.METHOD(path, [middleware1, middleware2, ...], controller)
 *
 * Middleware runs in order from left to right
 * Example: validation → error handling → controller
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * Flow:
 * 1. validateRegister checks input
 * 2. handleValidationErrors catches validation errors
 * 3. register controller creates user
 */
router.post(
  "/register",
  ...validateRegister, // Run validation rules
  handleValidationErrors, // Check for validation errors
  register // If valid, create user
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 *
 * Flow:
 * 1. validateLogin checks input
 * 2. handleValidationErrors catches errors
 * 3. login controller authenticates user
 */
router.post("/login", ...validateLogin, handleValidationErrors, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 *
 * Flow:
 * 1. protect middleware verifies JWT token
 * 2. If valid, attaches user to req.user
 * 3. getMe controller returns user data
 *
 * Frontend must send: Authorization: Bearer <token>
 */
router.get("/me", protect, getMe);

/**
 * @route   PUT /api/auth/update
 * @desc    Update user profile
 * @access  Private
 */
router.put("/update", protect, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put("/change-password", protect, changePassword);

// Export router
module.exports = router;
