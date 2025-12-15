// app/signup/page.tsx
// Signup page with Material-UI and TypeScript

"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { register } from "@/lib/api";
import { RegisterFormData, FormErrors } from "@/types";
import toast from "react-hot-toast";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { AxiosError } from "axios";

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  // Form state with proper typing
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  /**
   * Calculate password strength
   * Returns value between 0-100
   */
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;

    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;

    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  /**
   * Get password strength color
   */
  const getPasswordStrengthColor = (): "error" | "warning" | "success" => {
    if (passwordStrength < 50) return "error";
    if (passwordStrength < 75) return "warning";
    return "success";
  };

  /**
   * Validate form data
   * Returns true if valid, false otherwise
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const data = await register(formData);

      // Save token and user data to context
      loginUser(data.token, data.user);

      // Show success message
      toast.success(
        `Welcome, ${data.user.name}! Your account has been created.`
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      // Type-safe error handling
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Signup failed. Please try again.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change
   * Clear error for the field being edited
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box className="text-center mb-6">
            <PersonAddIcon
              sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h4" component="h1" className="font-bold mb-2">
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start tracking your subscriptions today
            </Typography>
          </Box>

          <Divider className="mb-6" />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              margin="normal"
              required
              autoComplete="name"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              margin="normal"
              required
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={
                errors.password || "Must be at least 6 characters with a number"
              }
              disabled={loading}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <Box className="mt-2 mb-3">
                <Box className="flex justify-between items-center mb-1">
                  <Typography variant="caption" color="text.secondary">
                    Password Strength
                  </Typography>
                  <Typography
                    variant="caption"
                    className="font-semibold"
                    color={getPasswordStrengthColor()}
                  >
                    {passwordStrength < 50
                      ? "Weak"
                      : passwordStrength < 75
                      ? "Medium"
                      : "Strong"}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  color={getPasswordStrengthColor()}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.confirmPassword &&
                    formData.password === formData.confirmPassword ? (
                      <CheckIcon color="success" />
                    ) : (
                      <IconButton
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a408b 100%)",
                },
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Terms */}
            <Typography
              variant="caption"
              color="text.secondary"
              className="block text-center mb-4"
            >
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </Typography>

            {/* Login Link */}
            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <MuiLink
                  component={Link}
                  href="/login"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "primary.main",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in instead
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
