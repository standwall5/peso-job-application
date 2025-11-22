import React, { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({
  show,
  onClose,
  title = "Success",
  message = "Your changes have been saved",
  duration = 3050,
  icon,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  return (
    <div className={`${styles.toast} ${show ? styles.active : ""}`}>
      <div className={styles.toastContent}>
        {icon ? (
          <span className={styles.check}>{icon}</span>
        ) : (
          <span className={styles.check}>
            {/* SVG Checkmark */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#4070f4" />
              <path
                d="M6 10.5L9 13.5L14 8.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
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
