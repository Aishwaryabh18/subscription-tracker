// app/page.tsx
// Home page - Landing page for the application

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <main className={styles.hero}>
      {/* Hero Section */}
      <div className={styles.container}>
        <div className={styles.center}>
          {/* Header */}
          <h1 className={styles.title}>
            Track Your Subscriptions
            <span className={styles.highlight}>
              Save Money. Stay Organized.
            </span>
          </h1>

          <p className={styles.description}>
            Never miss a renewal date again. Manage all your subscriptions in
            one place and get reminders before you're charged.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <Link
              href="/signup"
              className={`${styles.button} ${styles.primaryButton}`}
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className={`${styles.button} ${styles.secondaryButton}`}
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>
                Smart Reminders
              </h3>
              <p className={styles.featureText}>
                Get notified before renewal dates so you're never caught off
                guard by unexpected charges.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>
                Analytics
              </h3>
              <p className={styles.featureText}>
                See exactly how much you're spending monthly and yearly with
                detailed breakdowns.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>
                Secure & Private
              </h3>
              <p className={styles.featureText}>
                Your data is encrypted and secure. We never share your
                information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
