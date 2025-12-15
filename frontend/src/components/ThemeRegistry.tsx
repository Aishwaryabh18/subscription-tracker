// components/ThemeRegistry.tsx
// Wraps app with MUI theme provider

"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/lib/theme";
import { ReactNode } from "react";

interface ThemeRegistryProps {
  children: ReactNode;
}

/**
 * ThemeRegistry Component
 *
 * Provides MUI theme to all child components
 * CssBaseline normalizes styles across browsers
 */
export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
