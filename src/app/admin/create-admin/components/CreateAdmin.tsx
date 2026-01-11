// src/app/admin/create-admin/components/CreateAdmin.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../CreateAdmin.module.css";

const CreateAdmin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    is_superadmin: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      name: "",
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setSuccess(true);
      alert(
        `Invitation sent successfully to ${formData.email}!\n\nThe new admin will receive an email with a link to set up their account. The link expires in 48 hours.`,
      );

      // Reset form
      setFormData({
        email: "",
        name: "",
        is_superadmin: false,
      });

      // Redirect back to manage admins after a delay
      setTimeout(() => {
        router.push("/admin/manage-admin");
      }, 2000);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to send invitation",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2>Invitation Sent!</h2>
          <p>
            An email has been sent to <strong>{formData.email}</strong> with
            instructions to set up their admin account.
          </p>
          <p className={styles.successNote}>
            The invitation link will expire in 48 hours.
          </p>
          <button
            onClick={() => router.push("/admin/manage-admin")}
            className={styles.submitButton}
          >
            Back to Manage Admins
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Invite New Admin</h1>
        <p>Send an invitation email to create a new administrator account.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.infoBox}>
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
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <div>
            <strong>How it works:</strong>
            <ol>
              <li>Enter the admin&apos;s name and email address</li>
              <li>An invitation email will be sent automatically</li>
              <li>The new admin will set their own password</li>
              <li>Their name cannot be changed after account creation</li>
            </ol>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              Full Name *{" "}
              <span className={styles.labelNote}>
                (Cannot be changed later)
              </span>
            </label>
            <input
              type="text"
              id="name"
              className={errors.name ? styles.error : ""}
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
            <span className={styles.helpText}>
              This name will appear on all verified ID watermarks and cannot be
              modified.
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              className={errors.email ? styles.error : ""}
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="admin@peso.gov.ph"
              disabled={loading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
            <span className={styles.helpText}>
              An invitation link will be sent to this email address.
            </span>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="is_superadmin"
                checked={formData.is_superadmin}
                onChange={(e) => updateField("is_superadmin", e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="is_superadmin">Super Administrator</label>
            </div>
            <p className={styles.checkboxDescription}>
              Super admins can manage other admin accounts, invite new admins,
              and have full system access.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.push("/admin/manage-admin")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Sending Invitation..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
