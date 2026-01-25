// src/components/LoadingSpinner.tsx
"use client";

import React from "react";
import BlocksWave from "./BlocksWave";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullscreen = false,
  size = "medium",
}) => {
  const sizeMap = {
    small: 32,
    medium: 64,
    large: 96,
  };

  const content = (
    <div className={styles.spinnerContent}>
      <BlocksWave width={sizeMap[size]} height={sizeMap[size]} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className={styles.fullscreenContainer}>{content}</div>;
  }

  return <div className={styles.container}>{content}</div>;
};

export default LoadingSpinner;
