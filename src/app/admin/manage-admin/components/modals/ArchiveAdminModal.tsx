// src/app/admin/manage-admin/components/modals/ArchiveAdminModal.tsx

import React from "react";
import styles from "../../ManageAdmin.module.css";
import { AdminWithEmail } from "../../types/admin.types";

interface ArchiveAdminModalProps {
  show: boolean;
  admin: AdminWithEmail | null;
  actionLoading: boolean;
  onArchive: () => void;
  onClose: () => void;
}

const ArchiveAdminModal: React.FC<ArchiveAdminModalProps> = ({
  show,
  admin,
  actionLoading,
  onArchive,
  onClose,
}) => {
  if (!show || !admin) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Archive Admin</h2>
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
          <div className={styles.formGroup}>
            <p>
              Are you sure you want to archive{" "}
              <strong>{admin.name}</strong> ({admin.email})?
            </p>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>
              Archived admins will no longer have access to the system but can
              be restored later from the Archived Admins page.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={onArchive}
            disabled={actionLoading}
          >
            {actionLoading ? "Archiving..." : "Archive Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAdminModal;
