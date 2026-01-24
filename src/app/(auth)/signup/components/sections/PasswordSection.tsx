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
  const totalRequirements = 5;
  const satisfiedCount = [
    passwordRequirements.length,
    passwordRequirements.uppercase,
    passwordRequirements.lowercase,
    passwordRequirements.number,
    passwordRequirements.special,
  ].filter(Boolean).length;
  const strengthPercent =
    password.length === 0
      ? 0
      : Math.round((satisfiedCount / totalRequirements) * 100);
  const strengthLabel =
    password.length === 0
      ? "Password strength"
      : strengthPercent >= 80
        ? "Strong"
        : strengthPercent >= 60
          ? "Good"
          : strengthPercent >= 40
            ? "Fair"
            : "Weak";
  const strengthColor =
    password.length === 0
      ? "#9ca3af"
      : strengthPercent >= 80
        ? "#16a34a"
        : strengthPercent >= 60
          ? "#22c55e"
          : strengthPercent >= 40
            ? "#f59e0b"
            : "#ef4444";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h4 style={{ margin: 0, color: strengthColor }}>{strengthLabel}</h4>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {strengthPercent}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${strengthPercent}%`,
              height: "100%",
              background: strengthColor,
              transition: "width 0.2s ease, background 0.2s ease",
            }}
          />
        </div>
        <div style={{ marginTop: "8px" }}>
          <span
            className={`${styles.requirementItem} ${
              passwordRequirements.length ? styles["valid"] : styles["neutral"]
            }`}
          >
            At least 8 characters
          </span>
          {", "}
          <span
            className={`${styles.requirementItem} ${
              passwordRequirements.uppercase
                ? styles["valid"]
                : styles["neutral"]
            }`}
          >
            At least 1 uppercase letter
          </span>
          {", "}
          <span
            className={`${styles.requirementItem} ${
              passwordRequirements.lowercase
                ? styles["valid"]
                : styles["neutral"]
            }`}
          >
            At least 1 lowercase letter
          </span>
          {", "}
          <span
            className={`${styles.requirementItem} ${
              passwordRequirements.number ? styles["valid"] : styles["neutral"]
            }`}
          >
            At least 1 number
          </span>
          {", "}
          <span
            className={`${styles.requirementItem} ${
              passwordRequirements.special ? styles["valid"] : styles["neutral"]
            }`}
          >
            At least 1 special character (!@#$%&)
          </span>
        </div>
      </div>
    </>
  );
};
