"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./SetupInitial.module.css";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminSetupInitialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasUploadedPicture, setHasUploadedPicture] = useState(false);
  const [hasSelectedPicture, setHasSelectedPicture] = useState(false);
  const profileUploadHandlerRef = useRef<
    (() => Promise<{ success: boolean; url?: string }>) | null
  >(null);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Check if admin profile exists and needs setup
        const { data: adminData } = await supabase
          .from("peso")
          .select("id, name, is_first_login, profile_picture_url")
          .eq("auth_id", user.id)
          .single();

        if (!adminData) {
          router.push("/login");
          return;
        }

        setAdminName(adminData.name || "");

        // If already set up, redirect to admin panel
        if (!adminData.is_first_login) {
          router.push("/admin");
          return;
        }

        // If picture already uploaded, mark it
        if (adminData.profile_picture_url) {
          setHasUploadedPicture(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking setup status:", error);
        router.push("/login");
      }
    };

    checkSetupStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate profile picture
    if (!hasUploadedPicture && !hasSelectedPicture) {
      setError("Please select a profile picture to continue.");
      return;
    }

    // Validate password
    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength validation
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must contain at least one special character");
      return;
    }

    setSubmitting(true);

    try {
      // Upload profile picture if selected
      if (hasSelectedPicture && profileUploadHandlerRef.current) {
        const uploadResult = await profileUploadHandlerRef.current();
        if (!uploadResult.success) {
          throw new Error("Failed to upload profile picture");
        }
        setHasUploadedPicture(true);
        setHasSelectedPicture(false);
      }

      // Set password
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
          isFirstLogin: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      // Redirect to admin panel
      router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to complete setup");
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner message="Checking setup status..." fullscreen />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Welcome, {adminName}!</h1>
          <p className={styles.subtitle}>
            Complete your profile to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Profile Picture</h3>
            <ProfilePictureUpload
              currentPictureUrl={null}
              onUploadSuccess={(url) => {
                setHasUploadedPicture(!!url);
                setHasSelectedPicture(false);
              }}
              onFileSelected={(file) => {
                setHasSelectedPicture(!!file);
              }}
              onUploadHandlerReady={(handler) => {
                profileUploadHandlerRef.current = handler;
              }}
              showUploadButton={false}
              showRemoveButton={false}
              showSuccessAlerts={false}
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Set Your Password</h3>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter your password"
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="Confirm your password"
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.requirements}>
              <p className={styles.requirementsTitle}>Password must contain:</p>
              <ul className={styles.requirementsList}>
                <li className={newPassword.length >= 8 ? styles.met : ""}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(newPassword) ? styles.met : ""}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(newPassword) ? styles.met : ""}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(newPassword) ? styles.met : ""}>
                  One number
                </li>
                <li
                  className={/[^A-Za-z0-9]/.test(newPassword) ? styles.met : ""}
                >
                  One special character
                </li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              submitting || (!hasUploadedPicture && !hasSelectedPicture)
            }
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {submitting ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
