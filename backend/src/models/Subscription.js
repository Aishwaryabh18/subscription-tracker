// models/Subscription.js
// Defines the structure of Subscription data in MongoDB

const mongoose = require("mongoose");

/**
 * Subscription Schema
 * Each subscription belongs to one user
 *
 * Think of schema as a blueprint/template that defines:
 * - What fields exist
 * - What type of data (String, Number, Date, etc.)
 * - What validations apply (required, min, max, enum)
 * - Default values
 */
const subscriptionSchema = new mongoose.Schema(
  {
    // ============================================
    // RELATIONSHIP FIELD
    // ============================================

    /**
     * user: Links this subscription to a specific user
     *
     * Why ObjectId? MongoDB uses unique IDs for each document
     * ref: 'User' means this ID references a User document
     * This allows us to "join" data (like SQL foreign key)
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
      index: true, // Create database index for faster queries
    },

    // ============================================
    // BASIC INFORMATION
    // ============================================

    name: {
      type: String,
      required: [true, "Please provide subscription name"],
      trim: true, // Removes whitespace from start/end
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // ============================================
    // FINANCIAL DETAILS
    // ============================================

    cost: {
      type: Number,
      required: [true, "Please provide subscription cost"],
      min: [0, "Cost cannot be negative"],
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"], // Force INR as the only supported currency
    },

    // ============================================
    // BILLING CYCLE
    // ============================================

    /**
     * billingCycle: How often you're charged
     * weekly = every 7 days
     * monthly = every month
     * quarterly = every 3 months
     * yearly = once a year
     */
    billingCycle: {
      type: String,
      required: [true, "Please provide billing cycle"],
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },

    // ============================================
    // DATE MANAGEMENT
    // ============================================

    startDate: {
      type: Date,
      required: [true, "Please provide start date"],
      default: Date.now, // Automatically set to current date
    },

    /**
     * nextBillingDate: When you'll be charged next
     * This is used for reminders and analytics
     */
    nextBillingDate: {
      type: Date,
      required: [true, "Please provide next billing date"],
    },

    // ============================================
    // CATEGORIZATION
    // ============================================

    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "Entertainment", // Netflix, Spotify, Disney+
        "Software", // Adobe, Microsoft 365, GitHub
        "Fitness", // Gym, Peloton, fitness apps
        "Education", // Udemy, Coursera, online courses
        "Cloud Storage", // Google Drive, Dropbox, iCloud
        "News & Media", // Newspapers, magazines
        "Gaming", // PlayStation Plus, Xbox Live, Steam
        "Utilities", // Phone bills, internet
        "Other",
      ],
    },

    // ============================================
    // PAYMENT INFORMATION
    // ============================================

    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Other"],
      default: "Credit Card",
    },

    // ============================================
    // STATUS
    // ============================================

    /**
     * status: Current state of subscription
     * active = currently paying
     * cancelled = stopped, no longer paying
     * paused = temporarily stopped
     */
    status: {
      type: String,
      enum: ["active", "cancelled", "paused"],
      default: "active",
    },

    // ============================================
    // OPTIONAL FIELDS
    // ============================================

    website: {
      type: String,
      trim: true,
    },

    /**
     * logo: URL to subscription service logo
     * Example: "https://cdn.example.com/netflix-logo.png"
     */
    logo: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    // ============================================
    // REMINDER SETTINGS
    // ============================================

    /**
     * reminderEnabled: Should we send reminder emails?
     * reminderDaysBefore: How many days before billing to send reminder
     */
    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    reminderDaysBefore: {
      type: Number,
      default: 3, // Send reminder 3 days before billing
      min: 1,
      max: 30,
    },

    /**
     * lastReminderSent: Track when we last sent reminder
     * Used to prevent sending duplicate reminders
     */
    lastReminderSent: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ============================================
// DATABASE INDEXES
// ============================================

/**
 * Indexes make database queries faster
 * Like an index in a book - helps find things quickly
 *
 * Compound index: { user: 1, status: 1 }
 * Makes queries like "find user's active subscriptions" super fast
 *
 * 1 = ascending order, -1 = descending order
 */
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 }); // For reminder cron job

// ============================================
// VIRTUAL PROPERTIES
// ============================================

/**
 * Virtuals are computed properties (not stored in database)
 * Calculated on-the-fly when you access them
 *
 * Why use virtuals?
 * - Save storage space (don't store calculated values)
 * - Always up-to-date (calculated from source data)
 * - Can't get out of sync
 */

/**
 * monthlyCost: Convert any billing cycle to monthly equivalent
 *
 * Why? Makes it easy to compare subscriptions and calculate totals
 * Example: $120/year = $10/month
 */
subscriptionSchema.virtual("monthlyCost").get(function () {
  switch (this.billingCycle) {
    case "weekly":
      return this.cost * 4.33; // Average weeks per month
    case "monthly":
      return this.cost;
    case "quarterly":
      return this.cost / 3; // Divide by 3 months
    case "yearly":
      return this.cost / 12; // Divide by 12 months
    default:
      return this.cost;
  }
});

/**
 * yearlyCost: Total cost per year
 */
subscriptionSchema.virtual("yearlyCost").get(function () {
  return this.monthlyCost * 12;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Instance methods are functions you can call on a document
 * Example: subscription.calculateNextBillingDate()
 *
 * 'this' refers to the document (single subscription)
 */

/**
 * calculateNextBillingDate: Calculate when next charge happens
 *
 * @param {Date} fromDate - Starting date (default: today)
 * @returns {Date} - Next billing date
 *
 * Example: If today is Jan 1 and cycle is monthly:
 * Result: Feb 1
 */
subscriptionSchema.methods.calculateNextBillingDate = function (
  fromDate = new Date()
) {
  const date = new Date(fromDate); // Create copy to avoid modifying original

  switch (this.billingCycle) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
};

/**
 * shouldSendReminder: Check if we should send reminder email
 *
 * Returns true only if ALL conditions are met:
 * 1. Subscription is active (not cancelled/paused)
 * 2. Reminder is enabled by user
 * 3. Next billing is within reminder window (e.g., 3 days)
 * 4. We haven't sent reminder recently (avoid spam)
 *
 * This method is used by the cron job that checks daily
 */
subscriptionSchema.methods.shouldSendReminder = function () {
  // Check 1: Is subscription active?
  if (this.status !== "active" || !this.reminderEnabled) {
    return false;
  }

  // Check 2: Did we send reminder recently?
  if (this.lastReminderSent) {
    const hoursSinceLastReminder =
      (Date.now() - this.lastReminderSent) / (1000 * 60 * 60);

    // Don't send if we sent within last 24 hours
    if (hoursSinceLastReminder < 24) {
      return false;
    }
  }

  // Check 3: Is next billing within reminder window?
  const daysUntilBilling =
    (this.nextBillingDate - Date.now()) / (1000 * 60 * 60 * 24);

  // Send if billing is within reminder days AND still in future
  return daysUntilBilling <= this.reminderDaysBefore && daysUntilBilling > 0;
};

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

/**
 * pre('save'): Runs automatically BEFORE saving document
 *
 * Use case: Auto-calculate nextBillingDate if not provided
 *
 * Using async function (modern way, no next() needed)
 * Mongoose automatically waits for function to complete
 */
subscriptionSchema.pre("save", async function () {
  // If nextBillingDate is not set, calculate it automatically
  if (!this.nextBillingDate && this.startDate) {
    this.nextBillingDate = this.calculateNextBillingDate(this.startDate);
  }
  // Function completes, Mongoose continues with save
});

// ============================================
// CONFIGURATION
// ============================================

/**
 * Enable virtuals in JSON output
 *
 * Without this: res.json(subscription) won't include monthlyCost, yearlyCost
 * With this: Virtual properties are included in API responses
 */
subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

// ============================================
// CREATE AND EXPORT MODEL
// ============================================

/**
 * Create model from schema
 *
 * 'Subscription' = Model name (MongoDB will create 'subscriptions' collection)
 * MongoDB automatically pluralizes: Subscription → subscriptions
 */
const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
