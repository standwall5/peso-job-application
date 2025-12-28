import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/lib/auth-actions";
import styles from "@/app/(auth)/AuthForms.module.css";

async function resetAction(formData: FormData) {
  "use server";
  const res = await requestPasswordReset(formData);

  if (res?.success) {
    redirect("/auth/forgot-password?status=success");
  } else {
    redirect("/auth/forgot-password?status=error");
  }
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
        <h1 className={styles.authTitle}>Forgot your password?</h1>
        <p className={styles.authSubtitle}>
          Enter the email associated with your account. If it exists, we’ll send
          a link to reset your password.
        </p>

        {status === "error" && (
          <div className={`${styles.alert} ${styles.alertError}`} role="alert">
            We couldn&apos;t send the reset email right now. Please try again in
            a moment.
          </div>
        )}

        {status === "success" && (
          <div
            className={`${styles.alert} ${styles.alertSuccess}`}
            role="status"
          >
            If an account exists for that email, a password reset link has been
            sent.
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
              Send reset link
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
