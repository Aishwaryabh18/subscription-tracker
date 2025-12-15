// app/profile/page.tsx
// User profile page with settings and password change

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword } from "@/lib/api";
import { FormErrors } from "@/types";
import toast from "react-hot-toast";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  MenuItem,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { AxiosError } from "axios";

// Profile form data type
interface ProfileFormData {
  name: string;
  email: string;
  currency: string;
  reminderDays: number;
  emailNotifications: boolean;
}

// Password change form data type
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    email: "",
    currency: "INR",
    reminderDays: 3,
    emailNotifications: true,
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false);

  // Error states
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  /**
   * Initialize form with user data
   */
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        currency: user.preferences.currency,
        reminderDays: user.preferences.reminderDays,
        emailNotifications: user.preferences.emailNotifications,
      });
    }
  }, [user]);

  /**
   * Validate profile form
   */
  const validateProfile = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!profileData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (profileData.reminderDays < 1 || profileData.reminderDays > 30) {
      newErrors.reminderDays = "Reminder days must be between 1 and 30";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate password form
   */
  const validatePassword = (): boolean => {
    const newErrors: FormErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (!/\d/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword && passwordData.newPassword) {
      if (passwordData.currentPassword === passwordData.newPassword) {
        newErrors.newPassword =
          "New password must be different from current password";
      }
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle profile form submission
   */
  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setLoadingProfile(true);

    try {
      const data = await updateProfile({
        name: profileData.name,
        email: profileData.email,
        preferences: {
          currency: profileData.currency,
          reminderDays: profileData.reminderDays,
          emailNotifications: profileData.emailNotifications,
        },
      });

      updateUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Failed to update profile";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  /**
   * Handle password form submission
   */
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoadingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      console.error("Password change error:", error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Failed to change password";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  /**
   * Handle profile field change
   */
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: name === "reminderDays" ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handle password field change
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        {/* Header */}
        <Typography variant="h4" className="font-bold mb-6">
          Profile Settings
        </Typography>

        <Grid container spacing={4}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className="p-6 text-center">
              <Avatar
                className="w-24 h-24 mx-auto mb-4 text-4xl"
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" className="font-semibold mb-1">
                {user.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-4"
              >
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {/* Profile Information */}
            <Card className="mb-4">
              <CardContent className="p-6">
                <Box className="flex items-center gap-2 mb-4">
                  <PersonIcon color="primary" />
                  <Typography variant="h6" className="font-semibold">
                    Personal Information
                  </Typography>
                </Box>

                <Divider className="mb-4" />

                <Box component="form" onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        error={!!profileErrors.name}
                        helperText={profileErrors.name}
                        disabled={loadingProfile}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        error={!!profileErrors.email}
                        helperText={profileErrors.email}
                        disabled={loadingProfile}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Currency */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Currency"
                        name="currency"
                        value={profileData.currency}
                        onChange={handleProfileChange}
                        disabled={loadingProfile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                      </TextField>
                    </Grid>

                    {/* Reminder Days */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Reminder Days Before"
                        name="reminderDays"
                        type="number"
                        value={profileData.reminderDays}
                        onChange={handleProfileChange}
                        error={!!profileErrors.reminderDays}
                        helperText={
                          profileErrors.reminderDays ||
                          "Days before billing to send reminder"
                        }
                        disabled={loadingProfile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ScheduleIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          inputProps: { min: 1, max: 30 },
                        }}
                      />
                    </Grid>

                    {/* Email Notifications */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Email Notifications"
                        name="emailNotifications"
                        value={
                          profileData.emailNotifications ? "true" : "false"
                        }
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            emailNotifications: e.target.value === "true",
                          }))
                        }
                        disabled={loadingProfile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NotificationsIcon
                                color="action"
                                fontSize="small"
                              />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="true">Enabled</MenuItem>
                        <MenuItem value="false">Disabled</MenuItem>
                      </TextField>
                    </Grid>

                    {/* Save Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loadingProfile}
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {loadingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardContent className="p-6">
                <Box className="flex items-center gap-2 mb-4">
                  <LockIcon color="secondary" />
                  <Typography variant="h6" className="font-semibold">
                    Change Password
                  </Typography>
                </Box>

                <Divider className="mb-4" />

                <Alert severity="info" className="mb-4">
                  For security, you'll be logged out after changing your
                  password.
                </Alert>

                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={3}>
                    {/* Current Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        disabled={loadingPassword}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                edge="end"
                                disabled={loadingPassword}
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* New Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.newPassword}
                        helperText={
                          passwordErrors.newPassword ||
                          "At least 6 characters with a number"
                        }
                        disabled={loadingPassword}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                edge="end"
                                disabled={loadingPassword}
                              >
                                {showNewPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Confirm New Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        disabled={loadingPassword}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {passwordData.confirmPassword &&
                              passwordData.newPassword ===
                                passwordData.confirmPassword ? (
                                <CheckIcon color="success" />
                              ) : (
                                <IconButton
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  edge="end"
                                  disabled={loadingPassword}
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
                    </Grid>

                    {/* Change Password Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        startIcon={<LockIcon />}
                        disabled={loadingPassword}
                      >
                        {loadingPassword ? "Changing..." : "Change Password"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}
