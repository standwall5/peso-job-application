"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./SetupInitial.module.css";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminSetupInitialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasUploadedPicture, setHasUploadedPicture] = useState(false);
  const [hasSelectedPicture, setHasSelectedPicture] = useState(false);
  const profileUploadHandlerRef = useRef<
    (() => Promise<{ success: boolean; url?: string }>) | null
  >(null);
  const [adminName, setAdminName] = useState("");
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string | null>(
    null,
  );

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
          setCurrentPictureUrl(adminData.profile_picture_url);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking setup status:", error);
        router.push("/login");
      }
    };

    checkSetupStatus();
  }, [router]);

  const handleSkipSetup = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Mark as no longer first login so modal won't show again
      await supabase
        .from("peso")
        .update({ is_first_login: false })
        .eq("auth_id", user.id);

      router.push("/admin");
    } catch (error) {
      console.error("Error skipping setup:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate profile picture
    if (!hasUploadedPicture && !hasSelectedPicture) {
      setError("Please upload a profile picture to continue.");
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

  const allRequirementsMet =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner message="Checking setup status..." fullscreen />
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
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
            <div>
              <h1 className={styles.title}>Welcome, {adminName}!</h1>
              <p className={styles.subtitle}>
                Complete your profile to access the admin panel
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.twoColumnContent}>
            {/* LEFT COLUMN - Profile Picture */}
            <div className={styles.leftColumn}>
              <h3 className={styles.columnTitle}>
                Profile Picture
                <span className={styles.requiredBadge}>Required</span>
              </h3>
              <p className={styles.sectionDescription}>
                Upload a professional profile picture. This will be visible to
                all users in the system.
              </p>
              <div className={styles.profileSection}>
                <ProfilePictureUpload
                  currentPictureUrl={currentPictureUrl}
                  onUploadSuccess={(url) => {
                    console.log("✅ Profile picture uploaded:", url);
                    setHasUploadedPicture(!!url);
                    setHasSelectedPicture(false);
                    setCurrentPictureUrl(url);
                  }}
                  onFileSelected={(file) => {
                    setHasSelectedPicture(!!file);
                  }}
                  onUploadHandlerReady={(handler) => {
                    profileUploadHandlerRef.current = handler;
                  }}
                  onUploadStart={() => {
                    console.log("⏳ Starting profile picture upload...");
                  }}
                  showUploadButton={false}
                  showRemoveButton={false}
                  showSuccessAlerts={false}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Set Password */}
            <div className={styles.rightColumn}>
              <h3 className={styles.columnTitle}>
                Set Your Password
                <span className={styles.requiredBadge}>Required</span>
              </h3>
              <p className={styles.sectionDescription}>
                Create a secure password for your admin account. You can change
                this later in your account settings.
              </p>

              <div className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Enter your password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          <path
                            fillRule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Confirm your password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                          <path
                            fillRule="evenodd"
                            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                          <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                          <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className={styles.passwordRequirements}>
                    <p className={styles.requirementsTitle}>
                      Password must contain:
                    </p>
                    <ul className={styles.requirementsList}>
                      <li className={newPassword.length >= 8 ? styles.met : ""}>
                        At least 8 characters
                      </li>
                      <li
                        className={/[A-Z]/.test(newPassword) ? styles.met : ""}
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={/[a-z]/.test(newPassword) ? styles.met : ""}
                      >
                        One lowercase letter
                      </li>
                      <li className={/\d/.test(newPassword) ? styles.met : ""}>
                        One number
                      </li>
                      <li
                        className={
                          /[^A-Za-z0-9]/.test(newPassword) ? styles.met : ""
                        }
                      >
                        One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                width: "100%",
                maxWidth: "600px",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipSetup}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Not Now
              </Button>
              <Button
                type="submit"
                disabled={
                  submitting ||
                  (!hasUploadedPicture && !hasSelectedPicture) ||
                  !allRequirementsMet
                }
                style={{ flex: 1 }}
              >
                {submitting ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
            {!hasUploadedPicture && !hasSelectedPicture && (
              <p className={styles.footerHelper}>
                Please upload a profile picture to continue
              </p>
            )}
            {!allRequirementsMet && newPassword.length > 0 && (
              <p className={styles.footerHelper}>
                Please meet all password requirements to continue
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
