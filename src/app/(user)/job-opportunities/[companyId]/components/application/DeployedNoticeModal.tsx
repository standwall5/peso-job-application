"use client";

import React from "react";
import styles from "./DeployedNoticeModal.module.css";
import Button from "@/components/Button";

interface DeployedNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatWithAdmin: () => void;
}

const DeployedNoticeModal: React.FC<DeployedNoticeModalProps> = ({
  isOpen,
  onClose,
  onChatWithAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className={styles.title}>Access Restricted</h2>
        <p className={styles.message}>
          You don&apos;t have access to apply for jobs as you are currently
          deployed.
        </p>
        <p className={styles.submessage}>
          If you wish to re-apply, please contact the admin for assistance.
        </p>
        <div className={styles.actions}>
          <Button onClick={onChatWithAdmin} variant="success">
            Chat with Admin
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default DeployedNoticeModal;
