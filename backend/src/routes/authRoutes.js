// Defines API endpoints for authentication
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

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

router.post("/register", ...validateRegister, handleValidationErrors, register);

router.post("/login", ...validateLogin, handleValidationErrors, login);

// Frontend must send: Authorization: Bearer <token>
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
