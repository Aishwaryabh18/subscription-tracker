// controllers/subscriptionController.js
// Handles all subscription CRUD operations

const Subscription = require("../models/Subscription");

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions for logged-in user
 * @access  Private
 *
 * Why filter by user?
 * - Users should only see their own subscriptions
 * - req.user is set by protect middleware (contains user ID)
 */
const getAllSubscriptions = async (req, res) => {
  try {
    // Query parameters for filtering and sorting
    const { status, category, sort } = req.query;

    // Build query object
    let query = { user: req.user._id }; // Only get current user's subscriptions

    // Add filters if provided
    if (status) {
      query.status = status; // Filter by status (active/cancelled/paused)
    }
    if (category) {
      query.category = category; // Filter by category (Entertainment, Software, etc.)
    }

    // Build sort object
    let sortOption = {};
    if (sort === "cost-high") {
      sortOption = { cost: -1 }; // Highest cost first (-1 = descending)
    } else if (sort === "cost-low") {
      sortOption = { cost: 1 }; // Lowest cost first (1 = ascending)
    } else if (sort === "date-newest") {
      sortOption = { createdAt: -1 }; // Newest first
    } else if (sort === "date-oldest") {
      sortOption = { createdAt: 1 }; // Oldest first
    } else {
      sortOption = { nextBillingDate: 1 }; // Default: sort by next billing date
    }

    // Execute query
    const subscriptions = await Subscription.find(query).sort(sortOption);

    // Calculate total statistics
    const totalMonthly = subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => sum + sub.monthlyCost, 0);

    const totalYearly = totalMonthly * 12;

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      totalMonthly: totalMonthly.toFixed(2),
      totalYearly: totalYearly.toFixed(2),
      subscriptions,
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get single subscription by ID
 * @access  Private
 */
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    // Check if subscription exists
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Security: Check if subscription belongs to current user
    // Why? User A shouldn't access User B's subscriptions
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this subscription",
      });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Get subscription by ID error:", error);

    // Handle invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching subscription",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/subscriptions
 * @desc    Create new subscription
 * @access  Private
 */
const createSubscription = async (req, res) => {
  try {
    // Get data from request body
    const {
      name,
      description,
      cost,
      billingCycle,
      startDate,
      nextBillingDate,
      category,
      paymentMethod,
      website,
      logo,
      notes,
      reminderEnabled,
      reminderDaysBefore,
    } = req.body;

    // Create subscription object
    const subscriptionData = {
      user: req.user._id, // Associate with current user
      name,
      cost,
      currency: "INR", // Force INR
      billingCycle,
      category,
      nextBillingDate,
    };

    // Add optional fields if provided
    if (description) subscriptionData.description = description;
    if (startDate) subscriptionData.startDate = startDate;
    if (paymentMethod) subscriptionData.paymentMethod = paymentMethod;
    if (website) subscriptionData.website = website;
    if (logo) subscriptionData.logo = logo;
    if (notes) subscriptionData.notes = notes;
    if (reminderEnabled !== undefined)
      subscriptionData.reminderEnabled = reminderEnabled;
    if (reminderDaysBefore)
      subscriptionData.reminderDaysBefore = reminderDaysBefore;

    // Create subscription in database
    const subscription = await Subscription.create(subscriptionData);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update subscription
 * @access  Private
 */
const updateSubscription = async (req, res) => {
  try {
    // Find subscription
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this subscription",
      });
    }

    // Update subscription
    // { new: true } returns updated document
    // { runValidators: true } runs schema validations on update
    const updateData = { ...req.body, currency: "INR" };

    subscription = await Subscription.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update subscription error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating subscription",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Delete subscription
 * @access  Private
 */
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this subscription",
      });
    }

    // Delete subscription
    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Delete subscription error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting subscription",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/subscriptions/stats/summary
 * @desc    Get subscription statistics and analytics
 * @access  Private
 */
const getSubscriptionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all active subscriptions
    const activeSubscriptions = await Subscription.find({
      user: userId,
      status: "active",
    });

    // Calculate totals
    const totalMonthly = activeSubscriptions.reduce(
      (sum, sub) => sum + sub.monthlyCost,
      0
    );
    const totalYearly = totalMonthly * 12;

    // Group by category
    const byCategory = {};
    activeSubscriptions.forEach((sub) => {
      if (!byCategory[sub.category]) {
        byCategory[sub.category] = {
          count: 0,
          totalMonthly: 0,
        };
      }
      byCategory[sub.category].count += 1;
      byCategory[sub.category].totalMonthly += sub.monthlyCost;
    });

    // Get upcoming renewals (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingRenewals = await Subscription.find({
      user: userId,
      status: "active",
      nextBillingDate: {
        $gte: new Date(), // Greater than or equal to today
        $lte: thirtyDaysFromNow, // Less than or equal to 30 days from now
      },
    }).sort({ nextBillingDate: 1 });

    res.status(200).json({
      success: true,
      stats: {
        totalSubscriptions: activeSubscriptions.length,
        totalMonthly: totalMonthly.toFixed(2),
        totalYearly: totalYearly.toFixed(2),
        byCategory,
        upcomingRenewals: upcomingRenewals.map((sub) => ({
          id: sub._id,
          name: sub.name,
          cost: sub.cost,
          nextBillingDate: sub.nextBillingDate,
          daysUntil: Math.ceil(
            (sub.nextBillingDate - new Date()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
    });
  } catch (error) {
    console.error("Get subscription stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
};
