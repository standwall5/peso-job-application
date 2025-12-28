// src/app/(auth)/signup/components/fields/PhoneNumberInput.tsx
import React from "react";
import Image from "next/image";
import styles from "../SignUp.module.css";
import { FieldError } from "./FieldError";

interface PhoneNumberInputProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  error,
  onChange,
  onKeyDown,
  onPaste,
}) => {
  return (
    <div>
      <label htmlFor="phoneNumber" className={styles.fieldLabel}>
        Contact Number <span className={styles.redAsterisk}>*</span>
      </label>
      <div className={styles.phoneInputGroup}>
        <div className={styles.countryPrefix}>
          <span className={styles.flagIcon}>
            <Image
              src="/assets/images/ph-flag.webp"
              alt="Philippine flag"
              width={20}
              height={14}
              priority={false}
            />
          </span>
          <span className={styles.countryCode}>+63</span>
        </div>
        <input
          id="phoneNumber"
          name="phoneNumber"
          placeholder="9XXXXXXXXX"
          type="tel"
          inputMode="numeric"
          pattern="\d*"
          value={value}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onChange={(e) => onChange(e.target.value)}
          maxLength={10}
          className={styles.phoneNumberInput}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
};
