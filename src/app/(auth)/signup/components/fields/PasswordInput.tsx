// src/app/(auth)/signup/components/fields/PasswordInput.tsx
import React from "react";
import styles from "../SignUp.module.css";
import { FieldError } from "./FieldError";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  showPassword: boolean;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  showPassword,
  error,
  required = false,
  onChange,
  onToggleShow,
}) => {
  return (
    <div style={{ flex: 1 }}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label} {required && <span className={styles.redAsterisk}>*</span>}
      </label>
      <div className={styles.passwordContainer}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          className={error ? styles.errorInput : ""}
          onChange={(e) => onChange(e.target.value)}
          value={value}
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleShow();
          }}
          className={styles.iconButton}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.size6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.size6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
        </button>
      </div>
      <FieldError error={error} />
    </div>
  );
};
