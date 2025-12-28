// src/app/(auth)/signup/components/fields/FieldError.tsx
import React from "react";
import styles from "../SignUp.module.css";

interface FieldErrorProps {
  error?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;
  return <div className={styles.fieldError}>{error}</div>;
};
