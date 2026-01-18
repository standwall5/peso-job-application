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

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = searchParams?.status;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <h1 className={styles.authTitle}>Reset Your Password</h1>
        <p className={styles.authSubtitle}>
          Enter your email address and we'll send you instructions to reset your
          password.
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
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
