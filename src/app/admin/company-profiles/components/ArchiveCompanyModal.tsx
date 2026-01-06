"use client";
import React from "react";
import styles from "./ArchiveCompanyModal.module.css";
import Button from "@/components/Button";

interface ArchiveCompanyModalProps {
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ArchiveCompanyModal: React.FC<ArchiveCompanyModalProps> = ({
  companyName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Archive Company</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.warningIcon}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <p className={styles.message}>
            Are you sure you want to set <strong>{companyName}</strong> as
            inactive and archive it?
          </p>

          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>This will:</p>
            <ul className={styles.infoList}>
              <li>Mark the company profile as inactive</li>
              <li>Hide all current job postings from job seekers</li>
              <li>Move the company to the archived list</li>
              <li>The company can be restored later if needed</li>
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Archiving..." : "Archive Company"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveCompanyModal;
