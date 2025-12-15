// app/subscriptions/[id]/edit/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getSubscriptionById, updateSubscription } from "@/lib/api";
import { Subscription } from "@/types";
import toast from "react-hot-toast";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const categories = [
  "Entertainment",
  "Software",
  "Fitness",
  "Education",
  "Cloud Storage",
  "News & Media",
  "Gaming",
  "Utilities",
  "Other",
];

const billingCycles = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Bank Transfer",
  "Other",
];

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionById(id);
      setFormData({
        ...data.subscription,
        nextBillingDate: new Date(data.subscription.nextBillingDate)
          .toISOString()
          .split("T")[0],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.cost || formData.cost <= 0) {
      newErrors.cost = "Cost must be greater than 0";
    }

    if (!formData.nextBillingDate) {
      newErrors.nextBillingDate = "Next billing date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      await updateSubscription(id, formData);
      toast.success("Subscription updated successfully!");
      router.push("/subscriptions");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <Box className="min-h-screen flex items-center justify-center">
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Navbar />
        <Container maxWidth="md" className="py-8">
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" className="py-8">
        <Box className="flex items-center gap-4 mb-6">
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h4" className="font-bold">
            Edit Subscription
          </Typography>
        </Box>

        <Card>
          <CardContent className="p-6">
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subscription Name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost"
                    name="cost"
                    type="number"
                    value={formData.cost || ""}
                    onChange={handleChange}
                    error={!!errors.cost}
                    helperText={errors.cost}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Currency"
                    name="currency"
                    value={formData.currency || "INR"}
                    onChange={handleChange}
                  >
                    <MenuItem value="INR">INR</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Billing Cycle"
                    name="billingCycle"
                    value={formData.billingCycle || "monthly"}
                    onChange={handleChange}
                    required
                  >
                    {billingCycles.map((cycle) => (
                      <MenuItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Next Billing Date"
                    name="nextBillingDate"
                    type="date"
                    value={formData.nextBillingDate || ""}
                    onChange={handleChange}
                    error={!!errors.nextBillingDate}
                    helperText={errors.nextBillingDate}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="category"
                    value={formData.category || "Entertainment"}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Payment Method"
                    name="paymentMethod"
                    value={formData.paymentMethod || "Credit Card"}
                    onChange={handleChange}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status || "active"}
                    onChange={handleChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Reminder"
                    name="reminderEnabled"
                    value={formData.reminderEnabled ? "true" : "false"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reminderEnabled: e.target.value === "true",
                      }))
                    }
                  >
                    <MenuItem value="true">Enabled</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reminder Days Before"
                    name="reminderDaysBefore"
                    type="number"
                    value={formData.reminderDaysBefore || 3}
                    onChange={handleChange}
                    disabled={!formData.reminderEnabled}
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box className="flex gap-3 justify-end">
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  );
}
