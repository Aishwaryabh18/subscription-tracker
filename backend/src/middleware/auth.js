// Protects routes - only authenticated users can access

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to verify JWT token and authenticate user
 *
 * How it works:
 * 1. Extract token from request header
 * 2. Verify token is valid and not expired
 * 3. Find user from token payload
 * 4. Attach user to request object
 * 5. Allow request to continue to next middleware/controller
 *
 * Usage: Add this middleware to any route that needs authentication
 * Example: router.get('/profile', protect, getProfile)
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Split by space: ["Bearer", "actual_token"]
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found in header
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Please login.",
      });
    }

    // Verify token
    // jwt.verify() decodes token and checks if it's valid
    // If token is tampered with or expired, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains: { id: 'user_id', iat: issued_at, exp: expiry }
    // We stored user ID when creating the token

    // Find user by ID from token
    // select('-password') excludes password field from result
    req.user = await User.findById(decoded.id).select("-password");

    // If user not found (maybe deleted after token was issued)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // User is authenticated! Continue to next middleware/controller
    next();
  } catch (error) {
    // Token verification failed
    console.error("Auth middleware error:", error.message);

    // Provide specific error messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

module.exports = { protect };
