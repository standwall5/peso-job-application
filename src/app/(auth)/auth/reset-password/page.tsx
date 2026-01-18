"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "@/app/(auth)/AuthForms.module.css";

type ActionResult = {
  error?: string;
  success?: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Attempt to exchange the URL code/token for a session on the client.
  useEffect(() => {
    const code =
      searchParams.get("code") ||
      searchParams.get("token_hash") ||
      searchParams.get("access_token");

    if (!code) return;

    // Safely try to exchange for a session. If it fails, user can still try to update —
    // Supabase will respond accordingly.
    supabase.auth.exchangeCodeForSession(code).catch((err) => {
      // Non-fatal; we'll surface an error on submit if session truly isn't present
      console.error("exchangeCodeForSession error:", err);
    });
  }, [searchParams, supabase]);

  useEffect(() => {
    if (localError) setLocalError(null);
  }, [password, confirm]);

  const validate = (): string | null => {
    if (!password || !confirm)
      return "Please enter and confirm your new password.";
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    setResult(null);

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("updateUser error:", error);
        setResult({ error: "Could not update password. Please try again." });
        return;
      }

      // Sign out the user to prevent auto-login
      await supabase.auth.signOut();

      setResult({
        success: "Password updated successfully. Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    });
  };

  const hasAnyToken =
    !!searchParams.get("code") ||
    !!searchParams.get("token_hash") ||
    !!searchParams.get("access_token");

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <h1 className={styles.authTitle}>Reset Your Password</h1>

        <p className={styles.authSubtitle}>
          Enter a new password for your account. Make sure it&apos;s at least 8
          characters long.
        </p>

        {!hasAnyToken && (
          <div className={`${styles.alert} ${styles.alertInfo}`} role="status">
            Tip: Use the link from your email to securely reset your password.
          </div>
        )}

        {localError && (
          <div className={`${styles.alert} ${styles.alertError}`} role="alert">
            {localError}
          </div>
        )}

        {result?.error && (
          <div className={`${styles.alert} ${styles.alertError}`} role="alert">
            {result.error}
          </div>
        )}

        {result?.success && (
          <div
            className={`${styles.alert} ${styles.alertSuccess}`}
            role="status"
          >
            {result.success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.fieldLabel}>
              New Password <span className={styles.redAsterisk}>*</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={8}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className={styles.togglePassword}
                disabled={isPending}
              >
                {showPwd ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.fieldLabel}>
              Confirm New Password <span className={styles.redAsterisk}>*</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                minLength={8}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isPending}
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className={styles.togglePassword}
                disabled={isPending}
              >
                {showConfirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="submit"
              disabled={isPending}
              className={styles.blueButton}
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        <div className={styles.centerLink}>
          <Link href="/login" className={styles.link}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
