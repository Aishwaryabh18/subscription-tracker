// Defines the structure of User data in MongoDB

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema - defines what fields a user has
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true, // No two users can have same email (creates index in DB)
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default (security!)
    },

    preferences: {
      currency: {
        type: String,
        default: "INR",
        enum: ["INR"], // Force INR preference
      },
      reminderDays: {
        type: Number,
        default: 3, // Send reminder 3 days before renewal
        min: 1,
        max: 30,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Track when user was created/updated
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Middleware: Hash password before saving to database
 * This runs automatically before save() or create()
 *
 * Why? Never store plain text passwords! If database is compromised,
 * hackers can't see actual passwords.
 */
userSchema.pre("save", async function () {
  // Only hash password if it's new or modified
  // (don't re-hash on every save, e.g., when updating email)
  if (!this.isModified("password")) {
    return;
  }

  // Generate salt (random data) and hash password
  // 10 = salt rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare entered password with hashed password
 * This method can be called on any user document
 *
 * Example: user.matchPassword('userEnteredPassword')
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() hashes enteredPassword and compares with stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance Method: Get user data without sensitive fields
 * Returns safe user object to send to frontend
 */
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();

  // Remove sensitive fields
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.__v; // MongoDB version key (not needed in frontend)

  return userObject;
};

// Create and export the User model
// 'User' = collection name in MongoDB (will be 'users' - MongoDB pluralizes it)
const User = mongoose.model("User", userSchema);

module.exports = User;
