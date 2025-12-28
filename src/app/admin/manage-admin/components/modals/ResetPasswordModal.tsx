// src/app/admin/manage-admin/components/modals/ResetPasswordModal.tsx

import React from "react";
import styles from "../../ManageAdmin.module.css";
import { AdminWithEmail } from "../../types/admin.types";

interface ResetPasswordModalProps {
  show: boolean;
  admin: AdminWithEmail | null;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  actionLoading: boolean;
  onReset: () => void;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  show,
  admin,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  actionLoading,
  onReset,
  onClose,
}) => {
  if (!show || !admin) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Reset Password</h2>
          <button className={styles.closeButton} onClick={onClose}>
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
          <p
            style={{
              marginBottom: "1.5rem",
              color: "var(--text-secondary)",
            }}
          >
            Reset password for <strong>{admin.name}</strong> ({admin.email})
          </p>

          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              className={styles.formInput}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              className={styles.formInput}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={onReset}
            disabled={actionLoading}
          >
            {actionLoading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
