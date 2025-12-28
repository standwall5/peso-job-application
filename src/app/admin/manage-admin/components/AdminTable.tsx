// src/app/admin/manage-admin/components/AdminTable.tsx

import React from "react";
import styles from "../ManageAdmin.module.css";
import { AdminWithEmail } from "../types/admin.types";

interface AdminTableProps {
  admins: AdminWithEmail[];
  onEdit: (admin: AdminWithEmail) => void;
  onUnlock: (adminId: number) => void;
  onResetPassword: (admin: AdminWithEmail) => void;
  onDelete: (admin: AdminWithEmail) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({
  admins,
  onEdit,
  onUnlock,
  onResetPassword,
  onDelete,
}) => {
  const getStatusBadge = (admin: AdminWithEmail) => {
    if (admin.account_locked) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusLocked}`}>
          Locked
        </span>
      );
    }

    const status = admin.status || "active";
    const statusClass = {
      active: styles.statusActive,
      suspended: styles.statusSuspended,
      deactivated: styles.statusDeactivated,
    }[status];

    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
    );
  };

  if (admins.length === 0) {
    return (
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div>Name</div>
          <div>Email</div>
          <div>Status</div>
          <div>Role</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        <div className={styles.emptyState}>
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
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <h3>No admins found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
        <div>Role</div>
        <div>Created</div>
        <div>Actions</div>
      </div>

      {admins.map((admin) => (
        <div key={admin.id} className={styles.tableRow}>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>{admin.name}</span>
            {admin.is_superadmin && (
              <span className={styles.adminRole}>Super Admin</span>
            )}
          </div>

          <div className={styles.adminEmail}>{admin.email}</div>

          <div>{getStatusBadge(admin)}</div>

          <div className={styles.adminDate}>
            {admin.is_superadmin ? "Super Admin" : "Admin"}
          </div>

          <div className={styles.adminDate}>
            {admin.created_at
              ? new Date(admin.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </div>

          <div className={styles.actions}>
            {/* Edit Button */}
            <button
              className={styles.actionButton}
              onClick={() => onEdit(admin)}
              title="Edit Admin"
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>

            {/* Unlock Button (if locked) */}
            {admin.account_locked && (
              <button
                className={styles.actionButton}
                onClick={() => onUnlock(admin.id)}
                title="Unlock Account"
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
                    d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </button>
            )}

            {/* Reset Password Button */}
            <button
              className={styles.actionButton}
              onClick={() => onResetPassword(admin)}
              title="Reset Password"
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
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              onClick={() => onDelete(admin)}
              title="Delete Admin"
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminTable;
