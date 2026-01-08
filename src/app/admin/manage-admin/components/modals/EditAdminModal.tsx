// src/app/admin/manage-admin/components/modals/EditAdminModal.tsx

import React, { useState } from "react";
import styles from "../../ManageAdmin.module.css";
import { AdminWithEmail, AdminStatus } from "../../types/admin.types";
import ActionButton from "@/components/ActionButton";

interface EditAdminModalProps {
  show: boolean;
  admin: AdminWithEmail | null;
  editName: string;
  setEditName: (name: string) => void;
  editEmail: string;
  setEditEmail: (email: string) => void;
  editStatus: AdminStatus;
  setEditStatus: (status: AdminStatus) => void;
  editIsSuperAdmin: boolean;
  setEditIsSuperAdmin: (isSuperAdmin: boolean) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  actionLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  show,
  admin,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editStatus,
  setEditStatus,
  editIsSuperAdmin,
  setEditIsSuperAdmin,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  actionLoading,
  onSave,
  onClose,
}) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  if (!show || !admin) return null;

  const handleClose = () => {
    setShowPasswordFields(false);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Admin</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
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
            <label>Name</label>
            <input
              type="text"
              className={styles.formInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter admin name"
            />
          </div>

          {/* Email Field */}
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              className={styles.formInput}
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Enter admin email"
            />
          </div>

          {/* Status Field */}
          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              className={styles.formSelect}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as AdminStatus)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          {/* Super Admin Checkbox */}
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isSuperAdmin"
                checked={editIsSuperAdmin}
                onChange={(e) => setEditIsSuperAdmin(e.target.checked)}
              />
              <label htmlFor="isSuperAdmin">Super Admin</label>
            </div>
          </div>

          {/* Password Section */}
          <div className={styles.formGroup}>
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  style={{
                    width: "1rem",
                    height: "1rem",
                    transform: showPasswordFields
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
                {showPasswordFields
                  ? "Hide Password Section"
                  : "Change Password"}
              </button>
            </div>
          </div>

          {/* Password Fields (Collapsible) */}
          {showPasswordFields && (
            <>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (leave blank to keep current)"
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
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <ActionButton
            variant="secondary"
            onClick={handleClose}
            disabled={actionLoading}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={onSave}
            isLoading={actionLoading}
          >
            Save Changes
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
