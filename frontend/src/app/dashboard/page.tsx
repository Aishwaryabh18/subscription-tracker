// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getAllSubscriptions, getSubscriptionStats } from "@/lib/api";
import { Subscription, SubscriptionStats } from "@/types";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// const COLORS = [
//   "#FF8A3D", // Accent orange (use for primary / selected slice)
//   "#1F2937", // Deep charcoal
//   "#374151", // Dark slate
//   "#4B5563", // Mid grey
//   "#6B7280", // Cool grey
//   "#9CA3AF", // Light grey
//   "#D1D5DB", // Very light divider grey
// ];

const COLORS = [
  "#f5d389",
  "#fcf1e8",
  "#c88d37",
  "#a34f2b",
  "#7a3f30",
  "#4c2d23",
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, subsData] = await Promise.all([
        getSubscriptionStats(),
        getAllSubscriptions({ sort: "date-newest" }),
      ]);
      setStats(statsData.stats);
      setRecentSubs(subsData.subscriptions.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const categoryData = stats
    ? Object.entries(stats.byCategory).map(([name, data]) => ({
        name,
        value: data.totalMonthly,
      }))
    : [];

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

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" className="font-bold">
            Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/subscriptions/add")}
            className="bg-gradient-to-r from-purple-500 to-indigo-500"
          >
            Add Subscription
          </Button>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="h-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="opacity-90">
                      Total Subscriptions
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-2">
                      {stats?.totalSubscriptions || 0}
                    </Typography>
                  </Box>
                  <ReceiptIcon className="text-5xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="h-full bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="opacity-90">
                      Monthly Total
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-2">
                      ₹{stats?.totalMonthly || "0.00"}
                    </Typography>
                  </Box>
                  <MoneyIcon className="text-5xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="h-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="opacity-90">
                      Yearly Total
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-2">
                      ₹{stats?.totalYearly || "0.00"}
                    </Typography>
                  </Box>
                  <TrendingUpIcon className="text-5xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="h-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="opacity-90">
                      Upcoming Renewals
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-2">
                      {stats?.upcomingRenewals.length || 0}
                    </Typography>
                  </Box>
                  <CalendarIcon className="text-5xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Category Chart */}
          <Grid item xs={12} md={6} mt={2}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Spending by Category
                </Typography>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `₹${entry.value.toFixed(2)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box className="flex items-center justify-center h-64">
                    <Typography color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Renewals */}
          <Grid item xs={12} md={6} mt={2}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="font-semibold mb-4">
                  Upcoming Renewals
                </Typography>
                {stats && stats.upcomingRenewals.length > 0 ? (
                  <Box className="space-y-3">
                    {stats.upcomingRenewals.map((renewal) => (
                      <Box
                        key={renewal.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <Box>
                          <Typography variant="body1" className="font-medium">
                            {renewal.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{renewal.cost} •{" "}
                            {new Date(
                              renewal.nextBillingDate
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${renewal.daysUntil} days`}
                          color={renewal.daysUntil <= 3 ? "error" : "warning"}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box className="flex items-center justify-center h-64">
                    <Typography color="text.secondary">
                      No upcoming renewals
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Subscriptions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-semibold">
                    Recent Subscriptions
                  </Typography>
                  <Button
                    onClick={() => router.push("/subscriptions")}
                    size="small"
                  >
                    View All
                  </Button>
                </Box>
                {recentSubs.length > 0 ? (
                  <Grid container spacing={2}>
                    {recentSubs.map((sub) => (
                      <Grid item xs={12} sm={6} md={4} key={sub._id}>
                        <Card
                          variant="outlined"
                          sx={{
                            bgcolor: "#333333",
                            color: "white",
                            "&:hover": {
                              boxShadow: 6,
                            },
                          }}
                          className="transition-shadow"
                        >
                          <CardContent>
                            <Typography
                              variant="h6"
                              className="font-semibold truncate"
                            >
                              {sub.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              className="mt-1"
                            >
                              {sub.category}
                            </Typography>
                            <Box className="flex justify-between items-center mt-3">
                              <Typography
                                variant="h6"
                                color="primary"
                                className="font-bold"
                              >
                                ₹{sub.cost}
                              </Typography>
                              <Chip
                                label={sub.billingCycle}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box className="flex flex-col items-center justify-center py-12">
                    <Typography color="text.secondary" className="mb-4">
                      No subscriptions yet
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => router.push("/subscriptions/add")}
                    >
                      Add Your First Subscription
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
}
