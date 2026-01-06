"use client";
import React from "react";
import Button from "@/components/Button";
import styles from "./WithdrawConfirmModal.module.css";

interface WithdrawConfirmModalProps {
  jobTitle: string;
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WithdrawConfirmModal: React.FC<WithdrawConfirmModalProps> = ({
  jobTitle,
  companyName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Withdraw Application?</h2>
        </div>

        <div className={styles.content}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.warningIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>

          <p>
            Are you sure you want to withdraw your application for{" "}
            <strong>{jobTitle}</strong> at <strong>{companyName}</strong>?
          </p>
          <p className={styles.warning}>
            This action cannot be undone. You will need to reapply if you change
            your mind.
          </p>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Withdrawing..." : "Withdraw Application"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawConfirmModal;
