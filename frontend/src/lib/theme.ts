// lib/theme.ts
// Material-UI theme configuration

import { createTheme } from "@mui/material/styles";

/**
 * Custom theme for the application
 *
 * You can customize colors, typography, spacing, etc.
 * MUI uses this theme throughout all components
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff6b00", // vivid orange
      light: "#ff944d",
      dark: "#c74f00",
      contrastText: "#0b0d11",
    },
    secondary: {
      main: "#111827", // near-black
      light: "#1f2937",
      dark: "#0b0f17",
      contrastText: "#f5f7fb",
    },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    info: { main: "#2563eb" },
    success: { main: "#22c55e" },
    background: {
      default: "#0f1115", // dark grey background
      paper: "#111827", // card surface
    },
    text: {
      primary: "#f8fafc",
      secondary: "#cbd5e1",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

export default theme;
