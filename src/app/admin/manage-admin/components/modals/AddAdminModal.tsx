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
          <h2>Invite New Admin</h2>
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
          {/* Info Box */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#0ea5e9"
              style={{ width: "24px", height: "24px", flexShrink: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div>
              <p
                style={{
                  margin: "0 0 0.5rem 0",
                  fontWeight: 600,
                  color: "#0c4a6e",
                }}
              >
                How it works:
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  color: "#0c4a6e",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
              >
                <li>Enter the admin&apos;s name and email address</li>
                <li>An invitation email will be sent automatically</li>
                <li>
                  The new admin will upload a profile picture and set their
                  password
                </li>
                <li>The invitation link expires in 48 hours</li>
              </ul>
            </div>
          </div>

          {/* Name Field */}
          <div className={styles.formGroup}>
            <label>
              Full Name *{" "}
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  fontWeight: "normal",
                }}
              >
                (Cannot be changed later)
              </span>
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter admin name"
              disabled={actionLoading}
            />
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}
            >
              This name will appear on all verified ID watermarks and cannot be
              modified.
            </p>
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
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}
            >
              An invitation link will be sent to this email address.
            </p>
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
              Super admins can manage other admin accounts, invite new admins,
              and have full system access.
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
            Send Invitation
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;
