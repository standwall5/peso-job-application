// Step indicator component
import React from "react";
import styles from "../VerifiedIdUpload.module.css";

interface StepIndicatorProps {
  currentStep: number;
  canSubmit: boolean;
}

export function StepIndicator({ currentStep, canSubmit }: StepIndicatorProps) {
  return (
    <div className={styles.stepIndicator}>
      <div
        className={`${styles.stepItem} ${currentStep >= 1 ? styles.stepActive : ""}`}
      >
        <div className={styles.stepCircle}>{currentStep > 1 ? "✓" : "1"}</div>
        <span className={styles.stepLabel}>Upload ID</span>
      </div>
      <div className={styles.stepLine}></div>
      <div
        className={`${styles.stepItem} ${currentStep >= 2 ? styles.stepActive : ""}`}
      >
        <div className={styles.stepCircle}>{canSubmit ? "✓" : "2"}</div>
        <span className={styles.stepLabel}>Selfie with ID</span>
      </div>
    </div>
  );
}
