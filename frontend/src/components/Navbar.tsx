// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Subscriptions as SubscriptionsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

export default function Navbar() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logoutUser();
  };

  const handleProfile = () => {
    handleClose();
    router.push("/profile");
  };

  const isActive = (path: string) => pathname === path;

  if (!isAuthenticated) return null;

  return (
    <AppBar position="sticky" className="shadow-lg">
      <Container maxWidth="xl">
        <Toolbar className="flex justify-between py-2">
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/dashboard"
            className="font-bold text-white no-underline flex items-center gap-2"
          >
            💳 SubTracker
          </Typography>

          {/* Navigation Links */}
          <Box className="hidden md:flex gap-2">
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<DashboardIcon />}
              className={`text-white ${
                isActive("/dashboard") ? "bg-white/20" : ""
              }`}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              href="/subscriptions"
              startIcon={<SubscriptionsIcon />}
              className={`text-white ${
                isActive("/subscriptions") ? "bg-white/20" : ""
              }`}
            >
              Subscriptions
            </Button>
          </Box>

          {/* User Menu */}
          <Box className="flex items-center gap-2">
            <Typography variant="body2" className="hidden sm:block text-white">
              {user?.name}
            </Typography>
            <IconButton onClick={handleMenu} className="p-1">
              <Avatar className="bg-white text-primary w-10 h-10">
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfile}>
                <PersonIcon className="mr-2" />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon className="mr-2" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
