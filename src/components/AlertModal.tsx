"use client";

import React from "react";
import styles from "./AlertModal.module.css";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertModalProps {
  show: boolean;
  type?: AlertType;
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function AlertModal({
  show,
  type = "info",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}: AlertModalProps) {
  if (!show) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
              fill="#4CAF50"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
              fill="#F44336"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
              fill="#FF9800"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
              fill="#2196F3"
            />
          </svg>
        );
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "info":
      default:
        return "Notice";
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={showCancel ? handleCancel : undefined}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
      >
        <div className={styles.content}>
          <div className={styles.iconContainer}>{getIcon()}</div>

          <h2 id="alert-title" className={styles.title}>
            {getTitle()}
          </h2>

          <p id="alert-message" className={styles.message}>
            {message}
          </p>

          <div className={styles.buttonContainer}>
            {showCancel && (
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
                type="button"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`${styles.confirmButton} ${styles[type]}`}
              type="button"
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
