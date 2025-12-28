// src/app/(auth)/signup/components/WarningModal.tsx
import React from "react";
import Link from "next/link";
import styles from "./SignUp.module.css";

interface WarningModalProps {
  show: boolean;
  success?: string | null;
  error?: string | null;
  onClose: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  show,
  success,
  error,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            fontWeight: "bold",
            right: 20,
            top: 20,
            position: "absolute",
          }}
        >
          X
        </button>
        <div className={styles.warningContainer}>
          <h2>{success || error}</h2>
          <div className={styles.warningContent}>
            {success ? (
              <Link href="/login" className={styles.blueButton}>
                Back to login
              </Link>
            ) : (
              <button onClick={onClose} className={styles.redButton}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
