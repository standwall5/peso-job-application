import React, { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
  type?: "success" | "error" | "warning" | "info";
}

const Toast: React.FC<ToastProps> = ({
  show,
  onClose,
  title = "Success",
  message = "Your changes have been saved",
  duration = 3050,
  icon,
  type = "success",
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  const getDefaultIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "success":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#10b981" />
            <path
              d="M6 10.5L9 13.5L14 8.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#ef4444" />
            <path
              d="M7 7L13 13M7 13L13 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      case "warning":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#f59e0b" />
            <path
              d="M10 6V11M10 14H10.01"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      case "info":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#3b82f6" />
            <path
              d="M10 10V14M10 6H10.01"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#10b981" />
            <path
              d="M6 10.5L9 13.5L14 8.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${show ? styles.active : ""}`}
    >
      <div className={styles.toastContent}>
        <span className={styles.check}>{getDefaultIcon()}</span>
        <div className={styles.message}>
          <span className={`${styles.text} ${styles.text1}`}>{title}</span>
          <span className={styles.text}>{message}</span>
        </div>
      </div>
      <button
        className={styles.close}
        onClick={onClose}
        aria-label="Close"
        style={{
          background: "none",
          border: "none",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <div
        className={`${styles.progress} ${show ? styles.progressActive : ""}`}
      >
        <div className={styles.progressBar} />
      </div>
    </div>
  );
};

export default Toast;
