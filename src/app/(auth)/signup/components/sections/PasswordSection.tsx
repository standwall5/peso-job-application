// src/app/(auth)/signup/components/sections/PasswordSection.tsx
import React from "react";
import styles from "../SignUp.module.css";
import { PasswordInput } from "../fields";
import { PasswordRequirements } from "../../types/form.types";

interface PasswordSectionProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirm: boolean;
  passwordRequirements: PasswordRequirements;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirm: () => void;
  errors: Record<string, string>;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({
  password,
  confirmPassword,
  showPassword,
  showConfirm,
  passwordRequirements,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onToggleShowConfirm,
  errors,
}) => {
  return (
    <>
      <div className={styles.fullRow}>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={password}
          showPassword={showPassword}
          error={errors["password"]}
          required
          onChange={onPasswordChange}
          onToggleShow={onToggleShowPassword}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          showPassword={showConfirm}
          error={errors["confirmPassword"]}
          required
          onChange={onConfirmPasswordChange}
          onToggleShow={onToggleShowConfirm}
        />
      </div>

      <div className={styles.passwordRequirements}>
        <h4>Your password should contain:</h4>
        <div
          className={`${styles.requirementItem} ${
            password.length === 0
              ? styles["neutral"]
              : passwordRequirements.length
                ? styles["valid"]
                : styles["invalid"]
          }`}
        >
          {password.length === 0
            ? "○"
            : passwordRequirements.length
              ? "✓"
              : "✗"}{" "}
          At least 8 characters
        </div>
        <div
          className={`${styles.requirementItem} ${
            password.length === 0
              ? styles["neutral"]
              : passwordRequirements.uppercase
                ? styles["valid"]
                : styles["invalid"]
          }`}
        >
          {password.length === 0
            ? "○"
            : passwordRequirements.uppercase
              ? "✓"
              : "✗"}{" "}
          At least 1 uppercase letter
        </div>
        <div
          className={`${styles.requirementItem} ${
            password.length === 0
              ? styles["neutral"]
              : passwordRequirements.lowercase
                ? styles["valid"]
                : styles["invalid"]
          }`}
        >
          {password.length === 0
            ? "○"
            : passwordRequirements.lowercase
              ? "✓"
              : "✗"}{" "}
          At least 1 lowercase letter
        </div>
        <div
          className={`${styles.requirementItem} ${
            password.length === 0
              ? styles["neutral"]
              : passwordRequirements.number
                ? styles["valid"]
                : styles["invalid"]
          }`}
        >
          {password.length === 0
            ? "○"
            : passwordRequirements.number
              ? "✓"
              : "✗"}{" "}
          At least 1 number
        </div>
        <div
          className={`${styles.requirementItem} ${
            password.length === 0
              ? styles["neutral"]
              : passwordRequirements.special
                ? styles["valid"]
                : styles["invalid"]
          }`}
        >
          {password.length === 0
            ? "○"
            : passwordRequirements.special
              ? "✓"
              : "✗"}{" "}
          At least 1 special character (!@#$%&)
        </div>
      </div>
    </>
  );
};
