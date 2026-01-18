"use client";

import React, { useState } from "react";
import styles from "./AdminProfileModal.module.css";
import Button from "@/components/Button";
import { ProfilePictureUpload } from "./ProfilePictureUpload";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPictureUrl?: string | null;
  onProfileUpdate?: (url: string) => void;
  isFirstLogin?: boolean;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentPictureUrl,
  onProfileUpdate,
  isFirstLogin = false,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!isFirstLogin && !currentPassword) {
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

    if (!isFirstLogin && currentPassword === newPassword) {
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
          currentPassword: isFirstLogin ? undefined : currentPassword,
          newPassword,
          isFirstLogin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      alert("Password changed successfully!");

      // Reset form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");

      // Close modal and reload page if first login
      if (isFirstLogin) {
        onClose();
        // Reload page to refresh admin profile (is_first_login flag)
        window.location.reload();
      } else {
        onClose();
      }
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
    // Allow closing even on first login (user might close after setting password)
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isFirstLogin ? "Complete Your Profile" : "Account Settings"}</h2>
          {!isFirstLogin && (
            <button className={styles.closeButton} onClick={handleClose}>
              ×
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.tabIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            Profile
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "password" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("password")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.tabIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Password
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "profile" && (
            <div className={styles.profileTab}>
              <ProfilePictureUpload
                currentPictureUrl={currentPictureUrl}
                onUploadSuccess={(url) => {
                  if (onProfileUpdate) {
                    onProfileUpdate(url);
                  }
                }}
              />
              {isFirstLogin && (
                <p className={styles.firstLoginNote}>
                  Please set up your profile picture and password to continue.
                </p>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <form
              onSubmit={handlePasswordSubmit}
              className={styles.passwordForm}
            >
              {error && <div className={styles.error}>{error}</div>}

              {!isFirstLogin && (
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.passwordRequirements}>
                <p>Password must contain:</p>
                <ul>
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
