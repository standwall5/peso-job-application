"use client";

import React from "react";
import styles from "./ActionButton.module.css";

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "success" | "danger" | "secondary" | "outline";
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
};

export default function ActionButton({
  children,
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  icon,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/*{icon && <span className={styles.icon}>{icon}</span>}*/}
      {isLoading ? "Loading..." : children}
    </button>
  );
}
