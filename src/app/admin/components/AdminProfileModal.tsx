"use client";

import React, { useState } from "react";
import styles from "./AdminProfileModal.module.css";
import Button from "@/components/Button";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import Toast from "@/components/toast/Toast";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPictureUrl?: string | null;
  onProfileUpdate?: (url: string) => void;
  isForced?: boolean; // If true, modal cannot be closed and blocks all navigation
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentPictureUrl,
  onProfileUpdate,
  isForced = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
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

    setLoading(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          isFirstLogin: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      // Reset form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");

      // Show success toast
      setToast({
        show: true,
        title: "Success",
        message: "Password changed successfully!",
        type: "success",
      });

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Cannot close if forced mode or loading
    if (isForced || loading) return;

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const allRequirementsMet =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isForced ? styles.forced : ""}`}
      onClick={isForced ? undefined : handleClose}
    >
      <div
        className={`${styles.modal} ${isForced ? styles.forced : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>Account Settings</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.twoColumnContent}>
          {/* LEFT COLUMN - Profile Picture (Optional) */}
          <div className={styles.leftColumn}>
            <h3 className={styles.columnTitle}>
              Profile Picture
              <span className={styles.optionalBadge}>Optional</span>
            </h3>
            <p className={styles.sectionDescription}>
              Upload a profile picture to personalize your admin account. You
              can skip this and add it later.
            </p>
            <div className={styles.profileSection}>
              <ProfilePictureUpload
                currentPictureUrl={currentPictureUrl}
                onUploadSuccess={(url) => {
                  console.log("✅ Profile picture uploaded successfully:", url);
                  if (onProfileUpdate) {
                    onProfileUpdate(url);
                  }
                  setToast({
                    show: true,
                    title: "Success",
                    message: "Profile picture uploaded and saved to database!",
                    type: "success",
                  });
                }}
                onFileSelected={(file) => {
                  if (file) {
                    console.log(
                      "📁 Profile picture selected:",
                      file.name,
                      file.size,
                      "bytes",
                    );
                  }
                }}
                onUploadHandlerReady={() => {
                  // No need to store handler in profile modal
                }}
                onUploadStart={() => {
                  console.log("⏳ Starting profile picture upload...");
                }}
                showUploadButton={true}
                showRemoveButton={true}
                showSuccessAlerts={false}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Change Password (Optional) */}
          <div className={styles.rightColumn}>
            <h3 className={styles.columnTitle}>
              Change Password
              <span className={styles.optionalBadge}>Optional</span>
            </h3>
            <p className={styles.sectionDescription}>
              Update your password to keep your account secure. Leave blank to
              keep your current password.
            </p>
            <form onSubmit={handleSubmit} className={styles.passwordForm}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter current password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className={styles.passwordRequirements}>
                  <p>Password must contain:</p>
                  <ul>
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
                      className={
                        /[^A-Za-z0-9]/.test(newPassword) ? styles.met : ""
                      }
                    >
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              {(currentPassword || newPassword || confirmPassword) && (
                <>
                  <Button
                    type="submit"
                    disabled={loading || !allRequirementsMet}
                    style={{ width: "100%" }}
                  >
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>

                  {!allRequirementsMet && newPassword.length > 0 && (
                    <p className={styles.buttonHelper}>
                      Please meet all password requirements to continue
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        </div>

        <Toast
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          title={toast.title}
          message={toast.message}
          type={toast.type}
        />
      </div>
    </div>
  );
};
