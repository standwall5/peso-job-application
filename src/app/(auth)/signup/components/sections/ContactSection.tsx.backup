// src/app/(auth)/signup/components/sections/ContactSection.tsx
import React from "react";
import styles from "../SignUp.module.css";
import { FieldError, PhoneNumberInput } from "../fields";

interface ContactSectionProps {
  emailValue: string;
  phoneNumber: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string) => void;
  onPhoneKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPhonePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  emailValue,
  phoneNumber,
  onEmailChange,
  onPhoneChange,
  onPhoneKeyDown,
  onPhonePaste,
  errors,
}) => {
  return (
    <div className={styles.fullRow}>
      <div>
        <label htmlFor="email" className={styles.fieldLabel}>
          Email <span className={styles.redAsterisk}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="@gmail.com"
          value={emailValue}
          onChange={onEmailChange}
          className={errors["email"] ? styles.errorInput : ""}
        />
        <FieldError error={errors["email"]} />
      </div>

      <PhoneNumberInput
        value={phoneNumber}
        error={errors["phoneNumber"]}
        onChange={onPhoneChange}
        onKeyDown={onPhoneKeyDown}
        onPaste={onPhonePaste}
      />
    </div>
  );
};
