// src/app/admin/manage-admin/components/modals/EditAdminModal.tsx

import React from "react";
import styles from "../../ManageAdmin.module.css";
import { AdminWithEmail, AdminStatus } from "../../types/admin.types";

interface EditAdminModalProps {
  show: boolean;
  admin: AdminWithEmail | null;
  editName: string;
  setEditName: (name: string) => void;
  editStatus: AdminStatus;
  setEditStatus: (status: AdminStatus) => void;
  editIsSuperAdmin: boolean;
  setEditIsSuperAdmin: (isSuperAdmin: boolean) => void;
  actionLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  show,
  admin,
  editName,
  setEditName,
  editStatus,
  setEditStatus,
  editIsSuperAdmin,
  setEditIsSuperAdmin,
  actionLoading,
  onSave,
  onClose,
}) => {
  if (!show || !admin) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Admin</h2>
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
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              className={styles.formInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

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
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={onSave}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
