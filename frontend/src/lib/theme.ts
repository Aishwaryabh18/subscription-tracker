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
      main: "#667eea",
      light: "#8b9ff5",
      dark: "#4c5fd5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#764ba2",
      light: "#9a6fc4",
      dark: "#5a3880",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
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
