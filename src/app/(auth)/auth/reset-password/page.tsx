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
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

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

  const calculatePasswordStrength = (
    pwd: string,
  ): "weak" | "medium" | "strong" | null => {
    if (!pwd) return null;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 3) return "medium";
    return "strong";
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

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
        {/* Key Icon */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
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
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
        </div>

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
            {/* Password Strength Indicator */}
            {password && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{ display: "flex", gap: "4px", marginBottom: "4px" }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background:
                        passwordStrength === "weak"
                          ? "#ef4444"
                          : passwordStrength === "medium"
                            ? "#f59e0b"
                            : passwordStrength === "strong"
                              ? "#22c55e"
                              : "#e5e7eb",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background:
                        passwordStrength === "medium" ||
                        passwordStrength === "strong"
                          ? passwordStrength === "medium"
                            ? "#f59e0b"
                            : "#22c55e"
                          : "#e5e7eb",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background:
                        passwordStrength === "strong" ? "#22c55e" : "#e5e7eb",
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color:
                      passwordStrength === "weak"
                        ? "#ef4444"
                        : passwordStrength === "medium"
                          ? "#f59e0b"
                          : "#22c55e",
                    fontWeight: 600,
                  }}
                >
                  Password strength:{" "}
                  {passwordStrength === "weak"
                    ? "Weak"
                    : passwordStrength === "medium"
                      ? "Medium"
                      : "Strong"}
                </p>
              </div>
            )}
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
            ← Back to Login
          </Link>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
