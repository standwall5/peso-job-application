"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SetupPassword.module.css";
import { createClient } from "@/utils/supabase/client";

type PasswordRequirements = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

function SetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState<{
    email: string;
    name: string;
    is_superadmin: boolean;
  } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordRequirements, setPasswordRequirements] =
    useState<PasswordRequirements>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    // Validate invitation token
    fetch(`/api/admin/invite?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvitation(data);
        }
      })
      .catch(() => {
        setError("Failed to validate invitation");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Update password requirements as user types
  useEffect(() => {
    if (password.length === 0) {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      return;
    }

    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const validatePassword = (): boolean => {
    return Object.values(passwordRequirements).every(Boolean);
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUploadError("");
    const file = e.target.files?.[0];

    if (!file) {
      setProfilePicture(null);
      setProfilePicturePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setProfilePicture(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadError("");

    // Validation
    if (!profilePicture) {
      setUploadError("Profile picture is required");
      return;
    }

    if (!validatePassword()) {
      setError("Password does not meet all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      // First, create the account with password
      const response = await fetch("/api/admin/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup password");
      }

      // Now upload the profile picture
      const supabase = createClient();

      // Sign in the newly created user to upload their profile picture
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation!.email,
        password: password,
      });

      if (signInError) {
        throw new Error(
          "Account created but failed to sign in for profile upload",
        );
      }

      // Get the user's auth_id to use in the file path
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Failed to get user information");
      }

      // Upload profile picture to Supabase Storage
      const fileExt = profilePicture.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("admin-profiles")
        .upload(filePath, profilePicture, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Profile picture upload error:", uploadError);
        throw new Error("Account created but failed to upload profile picture");
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("admin-profiles")
        .getPublicUrl(filePath);

      // Update the peso table with profile picture URL
      const { error: updateError } = await supabase
        .from("peso")
        .update({ profile_picture_url: urlData.publicUrl })
        .eq("auth_id", user.id);

      if (updateError) {
        console.error("Failed to update profile picture URL:", updateError);
        // Don't fail the whole process if this fails
      }

      // Sign out after setup
      await supabase.auth.signOut();

      // Success! Redirect to login
      alert(
        "Account created successfully! Please login with your credentials.",
      );
      router.push("/admin/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup account");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Validating invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <h2>Invalid Invitation</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/admin/login")}
              className={styles.backButton}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Setup Your Admin Account</h1>
          <p>Welcome to the PESO Administration Portal</p>
        </div>

        {invitation && (
          <div className={styles.inviteInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{invitation.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{invitation.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value}>
                {invitation.is_superadmin
                  ? "Super Administrator"
                  : "Administrator"}
              </span>
            </div>
            <p className={styles.notice}>
              <strong>Note:</strong> Your name cannot be changed after account
              creation. This ensures accountability for all administrative
              actions.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Profile Picture Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="profilePicture">
              Profile Picture <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.profilePictureSection}>
              {profilePicturePreview ? (
                <div className={styles.previewContainer}>
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className={styles.profilePreview}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePicture(null);
                      setProfilePicturePreview(null);
                      setUploadError("");
                    }}
                    className={styles.removeButton}
                    disabled={submitting}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p>Upload Profile Picture</p>
                </div>
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className={styles.fileInput}
                disabled={submitting}
              />
            </div>
            {uploadError && (
              <span className={styles.errorText}>{uploadError}</span>
            )}
            <span className={styles.hint}>
              Accepted formats: JPG, PNG, GIF (Max 5MB)
            </span>
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password">
              Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                disabled={submitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Requirements */}
            {password.length > 0 && (
              <div className={styles.requirements}>
                <div
                  className={
                    passwordRequirements.length
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }
                >
                  {passwordRequirements.length ? "✓" : "✗"} At least 8
                  characters
                </div>
                <div
                  className={
                    passwordRequirements.uppercase
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }
                >
                  {passwordRequirements.uppercase ? "✓" : "✗"} At least one
                  uppercase letter
                </div>
                <div
                  className={
                    passwordRequirements.lowercase
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }
                >
                  {passwordRequirements.lowercase ? "✓" : "✗"} At least one
                  lowercase letter
                </div>
                <div
                  className={
                    passwordRequirements.number
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }
                >
                  {passwordRequirements.number ? "✓" : "✗"} At least one number
                </div>
                <div
                  className={
                    passwordRequirements.special
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }
                >
                  {passwordRequirements.special ? "✓" : "✗"} At least one
                  special character
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              Confirm Password <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={styles.togglePassword}
                disabled={submitting}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{" "}
            <a href="/admin/login" className={styles.link}>
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <div>Loading...</div>
        </div>
      }
    >
      <SetupPasswordContent />
    </Suspense>
  );
}
