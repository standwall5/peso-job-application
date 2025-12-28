// src/app/admin/manage-admin/components/modals/DeleteAdminModal.tsx

import React from "react";
import styles from "../../ManageAdmin.module.css";
import { AdminWithEmail } from "../../types/admin.types";

interface DeleteAdminModalProps {
  show: boolean;
  admin: AdminWithEmail | null;
  actionLoading: boolean;
  onDelete: () => void;
  onClose: () => void;
}

const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({
  show,
  admin,
  actionLoading,
  onDelete,
  onClose,
}) => {
  if (!show || !admin) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Delete Admin</h2>
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
          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
            Are you sure you want to delete <strong>{admin.name}</strong>?
          </p>
          <p style={{ color: "var(--text-secondary)" }}>
            This action cannot be undone. All data associated with this admin
            will be permanently deleted.
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.saveButton} ${styles.deleteButton}`}
            onClick={onDelete}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAdminModal;
