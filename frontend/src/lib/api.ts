// lib/api.ts
// API client for making requests to backend with TypeScript

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  AuthResponse,
  UserResponse,
  SubscriptionsResponse,
  SubscriptionResponse,
  StatsResponse,
  RegisterFormData,
  LoginFormData,
  SubscriptionFormData,
  SubscriptionQueryParams,
} from "@/types";

/**
 * Create axios instance with base configuration
 *
 * Why axios over fetch?
 * - Automatic JSON parsing
 * - Request/response interceptors
 * - Better error handling
 * - TypeScript support out of the box
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Runs BEFORE every request is sent
 *
 * Use case: Automatically attach JWT token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookies
    const token = Cookies.get("token");

    // If token exists, add to Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Runs AFTER every response is received
 *
 * Use case: Handle errors globally (401 Unauthorized, 500 Server Error)
 */
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status

      // 401 = Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        // Clear token and redirect to login
        Cookies.remove("token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // 403 = Forbidden (not authorized to access resource)
      if (error.response.status === 403) {
        console.error("Access forbidden");
      }

      // 500 = Server error
      if (error.response.status === 500) {
        console.error("Server error");
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API CALLS
// ============================================

/**
 * Register new user
 * @param userData - User registration data
 * @returns Promise with auth response
 */
export const register = async (
  userData: RegisterFormData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", userData);
  return response.data;
};

/**
 * Login user
 * @param credentials - User login credentials
 * @returns Promise with auth response
 */
export const login = async (
  credentials: LoginFormData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

/**
 * Get current user profile
 * @returns Promise with user data
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>("/auth/me");
  return response.data;
};

/**
 * Update user profile
 * @param userData - Fields to update
 * @returns Promise with updated user
 */
export const updateProfile = async (
  userData: Partial<{
    name: string;
    email: string;
    preferences: {
      currency?: string;
      reminderDays?: number;
      emailNotifications?: boolean;
    };
  }>
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>("/auth/update", userData);
  return response.data;
};

/**
 * Change password
 * @param passwords - Current and new password
 * @returns Promise with new token
 */
export const changePassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResponse> => {
  const response = await api.put<AuthResponse>(
    "/auth/change-password",
    passwords
  );
  return response.data;
};

// ============================================
// SUBSCRIPTION API CALLS
// ============================================

/**
 * Get all subscriptions with optional filters
 * @param params - Query parameters for filtering and sorting
 * @returns Promise with subscriptions array and totals
 */
export const getAllSubscriptions = async (
  params: SubscriptionQueryParams = {}
): Promise<SubscriptionsResponse> => {
  const response = await api.get<SubscriptionsResponse>("/subscriptions", {
    params,
  });
  return response.data;
};

/**
 * Get single subscription by ID
 * @param id - Subscription ID
 * @returns Promise with subscription data
 */
export const getSubscriptionById = async (
  id: string
): Promise<SubscriptionResponse> => {
  const response = await api.get<SubscriptionResponse>(`/subscriptions/${id}`);
  return response.data;
};

/**
 * Create new subscription
 * @param subscriptionData - Subscription details
 * @returns Promise with created subscription
 */
export const createSubscription = async (
  subscriptionData: SubscriptionFormData
): Promise<SubscriptionResponse> => {
  const response = await api.post<SubscriptionResponse>(
    "/subscriptions",
    subscriptionData
  );
  return response.data;
};

/**
 * Update subscription
 * @param id - Subscription ID
 * @param subscriptionData - Fields to update
 * @returns Promise with updated subscription
 */
export const updateSubscription = async (
  id: string,
  subscriptionData: Partial<SubscriptionFormData>
): Promise<SubscriptionResponse> => {
  const response = await api.put<SubscriptionResponse>(
    `/subscriptions/${id}`,
    subscriptionData
  );
  return response.data;
};

/**
 * Delete subscription
 * @param id - Subscription ID
 * @returns Promise with success message
 */
export const deleteSubscription = async (
  id: string
): Promise<{ success: boolean; message: string; id: string }> => {
  const response = await api.delete(`/subscriptions/${id}`);
  return response.data;
};

/**
 * Get subscription statistics and analytics
 * @returns Promise with stats data
 */
export const getSubscriptionStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>("/subscriptions/stats/summary");
  return response.data;
};

// Export api instance for custom requests
export default api;
