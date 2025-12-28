// src/app/(auth)/signup/components/FormNotice.tsx
import React from "react";
import styles from "./SignUp.module.css";

interface FormNoticeProps {
  show: boolean;
}

export const FormNotice: React.FC<FormNoticeProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className={styles.formNotice}>
      Please fill in the highlighted required fields.
    </div>
  );
};
