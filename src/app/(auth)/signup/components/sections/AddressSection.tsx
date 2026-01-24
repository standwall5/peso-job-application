// src/app/(auth)/signup/components/sections/AddressSection.tsx
import React from "react";
import styles from "../SignUp.module.css";
import { FieldError } from "../fields";
import {
  DISTRICTS,
  BARANGAYS,
  PREFERRED_PLACES,
} from "../../constants/form.constants";

interface AddressSectionProps {
  residency: string | null;
  district: string;
  barangay: string;
  preferredPlace: string;
  onResidencyChange: (value: "resident" | "nonresident") => void;
  onDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBarangayChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPreferredPlaceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  errors: Record<string, string>;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  residency,
  district,
  barangay,
  preferredPlace,
  onResidencyChange,
  onDistrictChange,
  onBarangayChange,
  onPreferredPlaceChange,
  onInputChange,
  errors,
}) => {
  return (
    <div className={styles.addressSection}>
      <h3 className={styles.fieldLabelTitle}>
        Address Information
        <span className={styles.redAsterisk}>*</span>
      </h3>

      {/* Residency Radio Buttons */}
      {/*<div
        className={
          errors["residency"]
            ? `${styles.residencyOptions} ${styles.radioError}`
            : styles.residencyOptions
        }
      >
        <label>
          <input
            type="radio"
            name="residency"
            value="resident"
            checked={residency === "resident"}
            onChange={() => onResidencyChange("resident")}
          />
          Resident of Parañaque
        </label>

        <label>
          <input
            type="radio"
            name="residency"
            value="nonresident"
            checked={residency === "nonresident"}
            onChange={() => onResidencyChange("nonresident")}
          />
          Non-Resident of Parañaque
        </label>
      </div>*/}

      <FieldError error={errors["residency"]} />

      {/* Address Field */}
      <div className={styles.fullRow}>
        <div style={{ flex: 1 }}>
          <label htmlFor="address" className={styles.fieldLabel}>
            (House No./Street/Subdivision/City/Province){" "}
            <span className={styles.redAsterisk}>*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            onChange={onInputChange}
            className={errors["address"] ? styles.errorInput : ""}
          />
          <FieldError error={errors["address"]} />
        </div>
      </div>

      {/* Conditional fields for residents */}
      {residency === "resident" && (
        <div className={styles.geographicalRow}>
          <div className={styles.leftColumn}>
            {/* District */}
            <div>
              <label htmlFor="district" className={styles.fieldLabel}>
                District <span className={styles.redAsterisk}>*</span>
              </label>
              <select
                id="district"
                name="district"
                value={district}
                onChange={onDistrictChange}
                className={errors["district"] ? styles.errorInput : ""}
              >
                <option value="" disabled>
                  Select District
                </option>
                {DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              <FieldError error={errors["district"]} />
            </div>

            {/* Preferred Place of Assignment */}
            <div>
              <label
                htmlFor="preferredPlaceOfAssignment"
                className={styles.fieldLabel}
              >
                Preferred Place of Assignment{" "}
                <span className={styles.redAsterisk}>*</span>
              </label>
              <select
                id="preferredPlaceOfAssignment"
                name="preferredPlaceOfAssignment"
                value={preferredPlace}
                onChange={onPreferredPlaceChange}
                className={
                  errors["preferredPlaceOfAssignment"] ? styles.errorInput : ""
                }
              >
                <option value="" disabled>
                  Select Preferred Place of Assignment
                </option>
                {PREFERRED_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
              <FieldError error={errors["preferredPlaceOfAssignment"]} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            {/* Barangay */}
            <div>
              <label htmlFor="barangay" className={styles.fieldLabel}>
                Barangay <span className={styles.redAsterisk}>*</span>
              </label>
              <select
                id="barangay"
                name="barangay"
                value={barangay}
                onChange={onBarangayChange}
                className={errors["barangay"] ? styles.errorInput : ""}
              >
                <option value="" disabled>
                  Select Barangay
                </option>

                {district === "District 1" &&
                  BARANGAYS["District 1"].map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}

                {district === "District 2" &&
                  BARANGAYS["District 2"].map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}
              </select>
              <FieldError error={errors["barangay"]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
