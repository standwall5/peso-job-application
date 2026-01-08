// src/app/admin/manage-admin/components/modals/AddAdminModal.tsx

import React from "react";
import styles from "../../ManageAdmin.module.css";
import ActionButton from "@/components/ActionButton";

interface AddAdminModalProps {
  show: boolean;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (isSuperAdmin: boolean) => void;
  actionLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  show,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isSuperAdmin,
  setIsSuperAdmin,
  actionLoading,
  onSave,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Admin</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={actionLoading}
          >
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label>Full Name *</label>
            <input
              type="text"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter admin name"
              disabled={actionLoading}
            />
          </div>

          {/* Email Field */}
          <div className={styles.formGroup}>
            <label>Email Address *</label>
            <input
              type="email"
              className={styles.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@peso.gov.ph"
              disabled={actionLoading}
            />
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label>Password *</label>
            <input
              type="password"
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={actionLoading}
            />
          </div>

          {/* Confirm Password Field */}
          <div className={styles.formGroup}>
            <label>Confirm Password *</label>
            <input
              type="password"
              className={styles.formInput}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={actionLoading}
            />
          </div>

          {/* Super Admin Checkbox */}
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="addIsSuperAdmin"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                disabled={actionLoading}
              />
              <label htmlFor="addIsSuperAdmin">Super Administrator</label>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
                marginLeft: "1.5rem",
              }}
            >
              Super admins can manage other admin accounts and have full system
              access.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <ActionButton
            variant="secondary"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={onSave}
            isLoading={actionLoading}
          >
            Create Admin
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
