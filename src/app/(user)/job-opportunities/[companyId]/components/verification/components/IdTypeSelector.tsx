// ID type selector component
import React from "react";
import { ID_TYPES } from "../constants";
import styles from "../VerifiedIdUpload.module.css";

interface IdTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function IdTypeSelector({ value, onChange, required = true }: IdTypeSelectorProps) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        <span className={styles.labelText}>ID Type</span>
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={styles.select}
      >
        <option value="">Select your ID type</option>
        {ID_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
