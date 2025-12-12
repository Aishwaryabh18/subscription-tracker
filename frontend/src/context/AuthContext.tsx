// context/AuthContext.tsx
// Manages authentication state globally with TypeScript

"use client"; // Next.js: This is a Client Component

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { getCurrentUser } from "@/lib/api";
import { User } from "@/types";

/**
 * Auth Context Type Definition
 * Defines what data and functions are available in the context
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginUser: (token: string, userData: User) => void;
  logoutUser: () => void;
  updateUser: (userData: User) => void;
}

/**
 * Create Context with undefined initial value
 * Will be provided by AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 * children = All components wrapped by this provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the entire app and provides authentication state
 *
 * State stored:
 * - user: Current user data (null if not logged in)
 * - loading: Is user data being fetched?
 * - isAuthenticated: Is user logged in? (computed from user state)
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Check if user is logged in on app load
   * Runs once when app starts (empty dependency array)
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in cookies
        const token = Cookies.get("token");

        if (token) {
          // Token exists, fetch user data from backend
          const data = await getCurrentUser();
          setUser(data.user);
        }
      } catch (error) {
        // Token invalid or expired
        console.error("Auth check failed:", error);
        Cookies.remove("token");
        setUser(null);
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * Called after successful login API call
   *
   * @param token - JWT token from backend
   * @param userData - User data from backend
   */
  const loginUser = (token: string, userData: User): void => {
    // Save token to cookies (expires in 7 days)
    Cookies.set("token", token, { expires: 7 });

    // Update user state
    setUser(userData);
  };

  /**
   * Logout function
   * Clears token and user data, redirects to login
   */
  const logoutUser = (): void => {
    // Remove token from cookies
    Cookies.remove("token");

    // Clear user state
    setUser(null);

    // Redirect to login page (only in browser)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  /**
   * Update user data
   * Called after profile update
   *
   * @param userData - Updated user data
   */
  const updateUser = (userData: User): void => {
    setUser(userData);
  };

  /**
   * Value provided to all components
   * Any component can access these through useAuth() hook
   */
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user, // Convert to boolean: null → false, User → true
    loginUser,
    logoutUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom Hook: useAuth
 * Makes it easy to use auth context in components
 *
 * Usage in component:
 * const { user, isAuthenticated, loginUser, logoutUser } = useAuth();
 *
 * TypeScript ensures you only access properties that exist!
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Throw error if used outside of AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
