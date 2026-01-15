"use client";

import React from "react";
import Link from "next/link";
import styles from "./WelcomeResumeModal.module.css";

interface WelcomeResumeModalProps {
  show: boolean;
  onSkip: () => void;
}

export default function WelcomeResumeModal({
  show,
  onSkip,
}: WelcomeResumeModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onSkip}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H11.01L13 7V13Z"
                fill="#80E7B1"
              />
            </svg>
          </div>

          <h2 className={styles.title}>Welcome! 🎉</h2>
          <p className={styles.message}>
            Your account is ready.
            <br />
            Would you like to create your resume now?
          </p>

          <div className={styles.buttonContainer}>
            <Link href="/profile" className={styles.createButton}>
              CREATE RESUME
            </Link>
            <button onClick={onSkip} className={styles.skipButton}>
              SKIP FOR NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
