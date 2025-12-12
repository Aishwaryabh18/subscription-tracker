const express = require("express");
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");
const {
  validateSubscription,
  handleValidationErrors,
} = require("../middleware/validation");

/**
 * All routes here are PRIVATE (require authentication)
 * We'll apply protect middleware to all routes at once
 */

/**
 * @route   GET /api/subscriptions/stats/summary
 * @desc    Get subscription statistics
 * @access  Private
 *
 * NOTE: This route MUST come before /:id route
 * Why? Express matches routes top-to-bottom
 * If /:id comes first, "stats" would be treated as an ID
 */
router.get("/stats/summary", protect, getSubscriptionStats);

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions for current user
 * @access  Private
 *
 * Query parameters (optional):
 * - status: active/cancelled/paused
 * - category: Entertainment/Software/etc.
 * - sort: cost-high/cost-low/date-newest/date-oldest
 *
 * Example: /api/subscriptions?status=active&sort=cost-high
 */
router.get("/", protect, getAllSubscriptions);

/**
 * @route   POST /api/subscriptions
 * @desc    Create new subscription
 * @access  Private
 *
 * Flow:
 * 1. protect - verify user is logged in
 * 2. validateSubscription - check input data
 * 3. handleValidationErrors - catch validation errors
 * 4. createSubscription - create in database
 */
router.post(
  "/",
  protect,
  validateSubscription,
  handleValidationErrors,
  createSubscription
);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get single subscription
 * @access  Private
 *
 * :id is a route parameter (dynamic value)
 * Example: /api/subscriptions/507f1f77bcf86cd799439011
 */
router.get("/:id", protect, getSubscriptionById);

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update subscription
 * @access  Private
 */
router.put(
  "/:id",
  protect,
  validateSubscription,
  handleValidationErrors,
  updateSubscription
);

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Delete subscription
 * @access  Private
 */
router.delete("/:id", protect, deleteSubscription);

/**
 * Alternative: Route chaining for same path
 * Cleaner when multiple methods use same path
 */
// router.route('/:id')
//   .get(protect, getSubscriptionById)
//   .put(protect, validateSubscription, handleValidationErrors, updateSubscription)
//   .delete(protect, deleteSubscription);

module.exports = router;
