// app/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getAllSubscriptions, deleteSubscription } from "@/lib/api";
import { Subscription } from "@/types";
import toast from "react-hot-toast";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({
    open: false,
    id: "",
    name: "",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-newest");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, statusFilter, categoryFilter, sortBy]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptions();
      setSubscriptions(data.subscriptions);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subscriptions];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((sub) => sub.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "cost-high":
          return b.cost - a.cost;
        case "cost-low":
          return a.cost - b.cost;
        case "date-newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredSubs(filtered);
  };

  const handleDelete = async () => {
    try {
      await deleteSubscription(deleteDialog.id);
      toast.success("Subscription deleted successfully");
      setDeleteDialog({ open: false, id: "", name: "" });
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete subscription"
      );
    }
  };

  const categories = Array.from(
    new Set(subscriptions.map((sub) => sub.category))
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            My Subscriptions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/subscriptions/add")}
            sx={{
              background: "linear-gradient(to right, #a855f7, #6366f1)",
              "&:hover": {
                background: "linear-gradient(to right, #9333ea, #4f46e5)",
              },
            }}
          >
            Add Subscription
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FilterIcon />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="date-newest">Newest First</MenuItem>
                    <MenuItem value="date-oldest">Oldest First</MenuItem>
                    <MenuItem value="cost-high">Highest Cost</MenuItem>
                    <MenuItem value="cost-low">Lowest Cost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Subscriptions Grid */}
        {filteredSubs.length > 0 ? (
          <Grid container spacing={3}>
            {filteredSubs.map((sub) => (
              <Grid item xs={12} sm={6} md={4} key={sub._id}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ 
                          fontWeight: 600, 
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {sub.name}
                      </Typography>
                      <Chip
                        label={sub.status}
                        size="small"
                        color={sub.status === "active" ? "success" : "default"}
                      />
                    </Box>

                    {sub.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {sub.description}
                      </Typography>
                    )}

                    <Box sx={{ "& > *:not(:last-child)": { mb: 1 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Cost
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{ fontWeight: "bold" }}
                        >
                          ₹{sub.cost}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Billing
                        </Typography>
                        <Chip
                          label={sub.billingCycle}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body2">{sub.category}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Next Billing
                        </Typography>
                        <Typography variant="body2">
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() =>
                        router.push(`/subscriptions/${sub._id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          id: sub._id,
                          name: sub.name,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6 }}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {subscriptions.length === 0
                    ? "No subscriptions yet"
                    : "No subscriptions match your filters"}
                </Typography>
                {subscriptions.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/subscriptions/add")}
                  >
                    Add Your First Subscription
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: "", name: "" })}
        >
          <DialogTitle>Delete Subscription</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{deleteDialog.name}</strong>? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, id: "", name: "" })}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}
