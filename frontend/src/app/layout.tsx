// app/layout.tsx
// Root layout - wraps all pages

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ThemeRegistry from "@/components/ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Subscription Tracker",
  description: "Track and manage your subscriptions efficiently",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} theme-root`}>
        <ThemeRegistry>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#262626", // Match MUI theme background.paper
                  color: "#f8fafc", // Match MUI theme text.primary
                  border: "1px solid #374151", // Subtle border
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  padding: "12px 16px",
                },
                success: {
                  duration: 3000,
                  style: {
                    background: "#262626",
                    color: "#f8fafc",
                    border: "1px solid #22c55e",
                  },
                  iconTheme: {
                    primary: "#22c55e", // success color from theme
                    secondary: "#262626",
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: "#262626",
                    color: "#f8fafc",
                    border: "1px solid #ef4444",
                  },
                  iconTheme: {
                    primary: "#ef4444", // error color from theme
                    secondary: "#262626",
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
