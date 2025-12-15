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
                  background: "var(--panel-bg)",
                  color: "var(--text)",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "var(--orange-500)",
                    secondary: "var(--grey-900)",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "var(--danger)",
                    secondary: "var(--grey-900)",
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
