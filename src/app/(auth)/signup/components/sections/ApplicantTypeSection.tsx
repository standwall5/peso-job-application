// src/app/(auth)/signup/components/sections/ApplicantTypeSection.tsx
import React from "react";
import styles from "../SignUp.module.css";
import { FieldError } from "../fields";
import {
  APPLICANT_TYPES,
  DISABILITY_TYPES,
} from "../../constants/form.constants";
import { DropdownChecklist } from "@/components/DropdownChecklist";

interface ApplicantTypeSectionProps {
  applicantType: string[];
  onApplicantTypeChange: (type: string, checked: boolean) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  errors: Record<string, string>;
}

export const ApplicantTypeSection: React.FC<ApplicantTypeSectionProps> = ({
  applicantType,
  onApplicantTypeChange,
  onInputChange,
  errors,
}) => {
  return (
    <>
      <div className={styles.fullRow}>
        <div className={styles.applicantTypeContainer}>
          <DropdownChecklist
            options={APPLICANT_TYPES}
            selectedValues={applicantType}
            onChange={onApplicantTypeChange}
            placeholder="Select Applicant Type(s)"
            label="Applicant Type"
            required={true}
            error={errors["applicantType"]}
          />
        </div>
      </div>
      {/* CONDITIONAL TEXT FIELDS */}
      <div className={styles.fullRow}>
        <div className={styles.fullWidthBox}>
          {applicantType.includes("Student") && (
            <div className={styles.conditionalField}>
              <label className={styles.fieldLabel}>Student ID (Optional)</label>
              <input type="text" name="studentId" onChange={onInputChange} />
            </div>
          )}

          {applicantType.includes("Person with Disability (PWD)") && (
            <>
              <div style={{ flex: 1 }}>
                <label htmlFor="disabilityType" className={styles.fieldLabel}>
                  Disability Type <span className={styles.redAsterisk}>*</span>
                </label>
                <select
                  id="disabilityType"
                  name="disabilityType"
                  defaultValue=""
                  className={errors["disabilityType"] ? styles.errorInput : ""}
                  onChange={onInputChange}
                >
                  <option value="" disabled>
                    Disability Type
                  </option>
                  {DISABILITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FieldError error={errors["disabilityType"]} />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="pwdNumber" className={styles.fieldLabel}>
                  PWD ID Number (Optional)
                </label>
                <input
                  id="pwdNumber"
                  name="pwdNumber"
                  type="text"
                  onChange={onInputChange}
                  className={errors["pwdNumber"] ? styles.errorInput : ""}
                />
                <FieldError error={errors["pwdNumber"]} />
              </div>
            </>
          )}

          {applicantType.includes(
            "Returning Overseas Filipino Worker (OFW)",
          ) && (
            <div className={styles.conditionalField}>
              <label className={styles.fieldLabel}>
                OFW ID Number (Optional)
              </label>
              <input id="ofwNumber" name="ofwNumber" type="text" />
            </div>
          )}

          {applicantType.includes("Senior Citizen") && (
            <div className={styles.conditionalField}>
              <label className={styles.fieldLabel}>
                Senior Citizen ID (Optional)
              </label>
              <input
                id="seniorCitizenNumber"
                name="seniorCitizenNumber"
                type="text"
              />
            </div>
          )}

          {applicantType.includes("Solo Parent/Single Parent") && (
            <div className={styles.conditionalField}>
              <label className={styles.fieldLabel}>
                Solo Parent ID (Optional)
              </label>
              <input
                id="soloParentNumber"
                name="soloParentNumber"
                type="text"
              />
            </div>
          )}

          {applicantType.includes("Others") && (
            <div className={styles.conditionalField}>
              <label className={styles.fieldLabel}>Please Specify</label>
              <input
                id="othersSpecify"
                name="othersSpecify"
                type="text"
                onChange={onInputChange}
              />
              <FieldError error={errors["othersSpecify"]} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
