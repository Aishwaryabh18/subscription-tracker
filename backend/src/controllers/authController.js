// controllers/authController.js
// Handles user authentication logic

const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Helper function: Generate JWT token
 *
 * JWT contains user ID (payload)
 * Signed with secret key
 * Has expiration time
 *
 * Why JWT?
 * - Stateless (no session storage needed)
 * - Can be verified without database lookup
 * - Contains user info (user ID)
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload: data stored in token
    process.env.JWT_SECRET, // Secret key to sign token
    { expiresIn: process.env.JWT_EXPIRE } // Token expires in 7 days
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (anyone can register)
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    // Why? Email must be unique (one account per email)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    // Password will be hashed automatically (pre-save middleware in User model)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token, // Send token to frontend
      user: user.toSafeObject(), // User data without password
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    // Why select('+password')? Password has select: false in model
    const user = await User.findOne({ email }).select("+password");

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches
    // matchPassword() is a method we defined in User model
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires authentication)
 *
 * This route uses protect middleware
 * req.user is set by protect middleware
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    // It already has user data (without password)
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/auth/update
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    // Fields that can be updated
    const { name, email, preferences } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email already exists (for different user)
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Save updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password field
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    // Pre-save middleware will hash it automatically
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token, // New token after password change
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
