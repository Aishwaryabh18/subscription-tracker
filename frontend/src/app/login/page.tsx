// app/login/page.tsx
// Login page with Material-UI and TypeScript

"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/api";
import { LoginFormData, FormErrors } from "@/types";
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
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  // Form state with proper typing
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /**
   * Validate form data
   * Returns true if valid, false otherwise
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

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
      // Call login API
      const data = await login(formData);

      // Save token and user data to context
      loginUser(data.token, data.user);

      // Show success message
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      // Type-safe error handling
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Login failed. Please try again.";
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
            <LoginIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" component="h1" className="font-bold mb-2">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          <Divider className="mb-6" />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
              autoFocus
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
              helperText={errors.password}
              disabled={loading}
              margin="normal"
              required
              autoComplete="current-password"
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Sign Up Link */}
            <Box className="text-center mt-4">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <MuiLink
                  component={Link}
                  href="/signup"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "primary.main",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Create one now
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Demo Credentials (Remove in production) */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mt: 2,
            bgcolor: "info.light",
            color: "info.contrastText",
          }}
        >
          <Typography variant="caption" className="block">
            <strong>Demo Account:</strong> demo@example.com / demo123456
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
