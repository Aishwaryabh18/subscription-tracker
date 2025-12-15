// types/index.ts
// TypeScript type definitions for the application

/**
 * User type definition
 * Represents a user in the system
 */
// Why define types?

// Type safety - Catch errors at compile time, not runtime
// Autocomplete - VS Code shows available properties
// Documentation - Types serve as inline documentation
// Refactoring - Easy to find all usages of a type
// TypeScript - Type safe
// Ex:
// const user: User = { name: 'John', emal: 'john@example.com' };
// Error: Property 'emal' does not exist. Did you mean 'email'?
// types/index.ts
// TypeScript type definitions for the application

/**
 * User type definition
 * Represents a user in the system
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: {
    currency: "INR";
    reminderDays: number;
    emailNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription type definition
 * Represents a subscription in the system
 */
export interface Subscription {
  _id: string;
  user: string;
  name: string;
  description?: string;
  cost: number;
  currency: "INR";
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: string;
  nextBillingDate: string;
  category:
    | "Entertainment"
    | "Software"
    | "Fitness"
    | "Education"
    | "Cloud Storage"
    | "News & Media"
    | "Gaming"
    | "Utilities"
    | "Other";
  paymentMethod:
    | "Credit Card"
    | "Debit Card"
    | "PayPal"
    | "Bank Transfer"
    | "Other";
  status: "active" | "cancelled" | "paused";
  website?: string;
  logo?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  lastReminderSent?: string;
  monthlyCost: number; // Virtual field
  yearlyCost: number; // Virtual field
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response types
 * Standardized response format from backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Auth API responses
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

/**
 * Subscription API responses
 */
export interface SubscriptionsResponse {
  success: boolean;
  count: number;
  totalMonthly: string;
  totalYearly: string;
  subscriptions: Subscription[];
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  message?: string;
}

/**
 * Statistics response
 */
export interface SubscriptionStats {
  totalSubscriptions: number;
  totalMonthly: string;
  totalYearly: string;
  byCategory: {
    [key: string]: {
      count: number;
      totalMonthly: number;
    };
  };
  upcomingRenewals: {
    id: string;
    name: string;
    cost: number;
    nextBillingDate: string;
    daysUntil: number;
  }[];
}

export interface StatsResponse {
  success: boolean;
  stats: SubscriptionStats;
}

/**
 * Form data types - Used in Login/Signup forms
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Subscription form data - Used in Add/Edit subscription forms
 */
export interface SubscriptionFormData {
  name: string;
  description?: string;
  cost: number;
  currency?: "INR";
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate?: string;
  nextBillingDate: string;
  category: string;
  paymentMethod?: string;
  website?: string;
  logo?: string;
  notes?: string;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
}

/**
 * Query parameters for filtering subscriptions
 */
export interface SubscriptionQueryParams {
  status?: "active" | "cancelled" | "paused";
  category?: string;
  sort?: "cost-high" | "cost-low" | "date-newest" | "date-oldest";
}

/**
 * Form error types
 */
export interface FormErrors {
  [key: string]: string;
}
