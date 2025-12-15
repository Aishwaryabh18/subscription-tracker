// app/subscriptions/add/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { createSubscription } from "@/lib/api";
import { SubscriptionFormData } from "@/types";
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

export default function AddSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    description: "",
    cost: 0,
  currency: "INR",
    billingCycle: "monthly",
    nextBillingDate: "",
    category: "Entertainment",
    paymentMethod: "Credit Card",
    website: "",
    notes: "",
    reminderEnabled: true,
    reminderDaysBefore: 3,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
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

    setLoading(true);
    try {
      await createSubscription(formData);
      toast.success("Subscription added successfully!");
      router.push("/subscriptions");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add subscription");
    } finally {
      setLoading(false);
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

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" className="py-8">
        <Box className="flex items-center gap-4 mb-6">
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h4" className="font-bold">
            Add New Subscription
          </Typography>
        </Box>

        <Card>
          <CardContent className="p-6">
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subscription Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    placeholder="e.g., Netflix Premium"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Optional description..."
                  />
                </Grid>

                {/* Cost & Currency */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost"
                    name="cost"
                    type="number"
                    value={formData.cost}
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
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <MenuItem value="INR">INR</MenuItem>
                  </TextField>
                </Grid>

                {/* Billing Cycle */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Billing Cycle"
                    name="billingCycle"
                    value={formData.billingCycle}
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

                {/* Next Billing Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Next Billing Date"
                    name="nextBillingDate"
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={handleChange}
                    error={!!errors.nextBillingDate}
                    helperText={errors.nextBillingDate}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="category"
                    value={formData.category}
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

                {/* Payment Method */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Payment Method"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Website */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </Grid>

                {/* Reminder Settings */}
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
                    value={formData.reminderDaysBefore}
                    onChange={handleChange}
                    disabled={!formData.reminderEnabled}
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box className="flex gap-3 justify-end">
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500"
                    >
                      {loading ? "Saving..." : "Save Subscription"}
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
