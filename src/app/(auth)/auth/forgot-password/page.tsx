import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/lib/auth-actions";
import styles from "@/app/(auth)/AuthForms.module.css";

async function resetAction(formData: FormData) {
  "use server";
  await requestPasswordReset(formData);
  // Always show success message for security (don't reveal if email exists)
  redirect("/auth/forgot-password?status=success");
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        {/* Lock Icon */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div className={styles.iconBounce}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h1 className={styles.authTitle}>Reset Your Password</h1>
        <p className={styles.authSubtitle}>
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
        </p>

        {status === "success" && (
          <div
            className={`${styles.alert} ${styles.alertSuccess}`}
            role="status"
          >
            If an account exists with that email address, you will receive
            password reset instructions. Please check your inbox and spam
            folder.
          </div>
        )}

        <form action={resetAction} noValidate className={styles.authForm}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.fieldLabel}>
              Email address <span className={styles.redAsterisk}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={styles.input}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.blueButton}>
              Send Reset Link
            </button>
          </div>
        </form>

        <div className={styles.centerLink}>
          <Link href="/login" className={styles.link}>
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
