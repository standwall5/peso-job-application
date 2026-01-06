// src/app/admin/create-admin/components/CreateAdmin.tsx
// TODO: Remove create super admin
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../CreateAdmin.module.css";
import { useCreateAdmin } from "../hooks/useCreateAdmin";

const CreateAdmin = () => {
  const router = useRouter();
  const { formData, errors, loading, handleSubmit, updateField } =
    useCreateAdmin();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create Admin Account</h1>
        <p>Add a new administrator to the PESO system.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              className={errors.name ? styles.error : ""}
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter full name"
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
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
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              className={errors.password ? styles.error : ""}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Minimum 8 characters"
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              className={errors.confirmPassword ? styles.error : ""}
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="is_superadmin"
                checked={formData.is_superadmin}
                onChange={(e) => updateField("is_superadmin", e.target.checked)}
              />
              <label htmlFor="is_superadmin">Super Administrator</label>
            </div>
            <p className={styles.checkboxDescription}>
              Super admins can manage other admin accounts and have full system
              access.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.push("/admin/manage-admin")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
