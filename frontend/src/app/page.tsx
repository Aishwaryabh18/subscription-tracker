// app/page.tsx
// Home page with Material-UI

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", color: "white", mb: 8 }}>
          <Typography variant="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Track Your Subscriptions
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, color: "#ffd700" }}>
            Save Money. Stay Organized.
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 6, opacity: 0.95, maxWidth: 700, mx: "auto" }}
          >
            Never miss a renewal date again. Manage all your subscriptions in
            one place and get reminders before you're charged.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-8px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Smart Reminders
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get notified before renewal dates so you're never caught off
                  guard by unexpected charges.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-8px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  See exactly how much you're spending monthly and yearly with
                  detailed breakdowns.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-8px)" },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <LockIcon sx={{ fontSize: 40, color: "primary.main" }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Secure & Private
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your data is encrypted and secure. We never share your
                  information with third parties.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
