// src/app/(auth)/signup/components/sections/PersonalInfoSection.tsx
import React from "react";
import { DatePickerInput } from "@mantine/dates";
import styles from "../SignUp.module.css";
import { FieldError } from "../fields";
import {
  GENDER_OPTIONS,
  EXT_NAME_OPTIONS,
} from "../../constants/form.constants";

interface PersonalInfoSectionProps {
  // Name fields
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;

  // Extension name
  extNameValue: string;
  onExtNameChange: (value: string) => void;

  // Birth date
  birthDate: string;
  calculatedAge: number | null;
  onBirthDateChange: (
    date: string,
    setError?: (error: string | null) => void,
  ) => void;
  parseBirthDateString: (s: string) => Date | null;
  formatDateYYYYMMDD: (d: Date) => string;

  // Gender
  gender: string;
  genderOther: string;
  onGenderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGenderOtherChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Errors
  errors: Record<string, string>;
  onSetError: (field: string, message: string) => void;
  onClearError: (field: string) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  onInputChange,
  extNameValue,
  onExtNameChange,
  birthDate,
  calculatedAge,
  onBirthDateChange,
  parseBirthDateString,
  formatDateYYYYMMDD,
  gender,
  genderOther,
  onGenderChange,
  onGenderOtherChange,
  errors,
  onSetError,
  onClearError,
}) => {
  return (
    <>
      {/* First row */}
      <div className={styles.field}>
        <label htmlFor="firstName" className={styles.fieldLabel}>
          First Name <span className={styles.redAsterisk}>*</span>
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          onChange={onInputChange}
          className={errors["firstName"] ? styles.errorInput : ""}
        />
        <FieldError error={errors["firstName"]} />
      </div>

      <div className={styles.field}>
        <label htmlFor="lastName" className={styles.fieldLabel}>
          Last Name <span className={styles.redAsterisk}>*</span>
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          onChange={onInputChange}
          className={errors["lastName"] ? styles.errorInput : ""}
        />
        <FieldError error={errors["lastName"]} />
      </div>

      <div className={styles.field}>
        <label htmlFor="middleName" className={styles.fieldLabel}>
          Middle Name (Optional)
        </label>
        <input id="middleName" name="middleName" type="text" />
      </div>

      {/* EXT NAME as select */}
      <div className={styles.field}>
        <label htmlFor="extName" className={styles.fieldLabel}>
          Ext. Name (Optional)
        </label>
        <select
          id="extName"
          name="extName"
          value={extNameValue}
          onChange={(e) => {
            onExtNameChange(e.target.value);
            onClearError("extName");
          }}
          className={errors["extName"] ? styles.errorInput : ""}
        >
          <option value="">None</option>
          {EXT_NAME_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <FieldError error={errors["extName"]} />
      </div>

      {/* birth / age / sex row */}
      <div className={styles.fullRow}>
        <div style={{ flex: 1 }}>
          <DatePickerInput
            label={
              <>
                Pick a birthdate <span className={styles.redAsterisk}>*</span>
              </>
            }
            placeholder="Pick date"
            value={parseBirthDateString(birthDate)}
            onChange={(d: string | null) => {
              const newDate =
                d == null
                  ? ""
                  : typeof d === "string"
                    ? d
                    : formatDateYYYYMMDD(d);
              onBirthDateChange(newDate, (error) => {
                if (error) {
                  onSetError("birthDate", error);
                } else {
                  onClearError("birthDate");
                }
              });
            }}
            valueFormat="YYYY-MM-DD"
            className={`${styles.mantineDateInput} ${
              errors["birthDate"] ? styles.errorInput : ""
            }`}
            size="md"
            radius={3}
          />
          <FieldError error={errors["birthDate"]} />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="age" className={styles.fieldLabel}>
            Age <span className={styles.redAsterisk}>*</span>
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={calculatedAge !== null ? calculatedAge : ""}
            readOnly
            className={errors["age"] ? styles.errorInput : ""}
          />
          <FieldError error={errors["age"]} />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="gender" className={styles.fieldLabel}>
            Gender <span className={styles.redAsterisk}>*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={gender}
            onChange={onGenderChange}
            className={errors["gender"] ? styles.errorInput : ""}
          >
            <option value="" disabled>
              Select Gender
            </option>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {gender === "Others" && (
            <>
              <input
                id="genderOther"
                name="genderOther"
                type="text"
                placeholder="Please specify"
                value={genderOther}
                onChange={onGenderOtherChange}
                className={errors["genderOther"] ? styles.errorInput : ""}
                style={{ marginTop: 8 }}
              />
              <FieldError error={errors["genderOther"]} />
            </>
          )}
          <FieldError error={errors["gender"]} />
        </div>
      </div>
    </>
  );
};
