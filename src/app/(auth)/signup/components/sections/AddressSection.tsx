// src/app/(auth)/signup/components/sections/AddressSection.tsx
import React, { useState, useEffect } from "react";
import styles from "../SignUp.module.css";
import { FieldError } from "../fields";
import {
  CITIES,
  DISTRICTS,
  BARANGAYS,
  getDistrictsForCity,
  getBarangaysForCityAndDistrict,
  cityHasDistricts,
  type City,
} from "@/constants/locationData";

interface AddressSectionProps {
  residency: string | null;
  city: string;
  district: string;
  barangay: string;
  preferredPlace: string;
  onResidencyChange: (value: "resident" | "nonresident") => void;
  onCityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
  city,
  district,
  barangay,
  preferredPlace,
  onResidencyChange,
  onCityChange,
  onDistrictChange,
  onBarangayChange,
  onPreferredPlaceChange,
  onInputChange,
  errors,
}) => {
  // Local state for preferred place district filter (Parañaque only, not submitted)
  const [preferredDistrictFilter, setPreferredDistrictFilter] =
    useState<string>("");

  const selectedCity = city as City;
  const availableDistricts = selectedCity
    ? getDistrictsForCity(selectedCity)
    : [];
  const hasCityDistricts = selectedCity
    ? cityHasDistricts(selectedCity)
    : false;

  // Get barangays: for cities with districts, filter by district; for cities without, get all
  const availableBarangays = selectedCity
    ? hasCityDistricts
      ? district
        ? getBarangaysForCityAndDistrict(selectedCity, district)
        : []
      : Object.values(BARANGAYS[selectedCity] || {}).flat()
    : [];

  // For Preferred Place of Assignment: Always use Parañaque barangays
  const paranaqueDistricts = getDistrictsForCity("Parañaque");
  const preferredPlaceBarangays = preferredDistrictFilter
    ? getBarangaysForCityAndDistrict("Parañaque", preferredDistrictFilter)
    : Object.values(BARANGAYS["Parañaque"] || {}).flat();

  // Filter out Parañaque from city options for non-residents
  const nonResidentCities = CITIES.filter((c) => c !== "Parañaque");

  // Reset preferred district filter when residency changes
  useEffect(() => {
    setPreferredDistrictFilter("");
  }, [residency]);

  return (
    <div className={styles.addressSection}>
      <h3 className={styles.fieldLabelTitle}>
        Address Information
        <span className={styles.redAsterisk}>*</span>
      </h3>

      {/* Residency Radio Buttons */}
      <div className={styles.fullRow}>
        <div style={{ flex: 1 }}>
          <label className={styles.fieldLabel}>
            Residency <span className={styles.redAsterisk}>*</span>
          </label>
          <div className={styles.residencyOptions}>
            <label>
              <input
                type="radio"
                name="residency"
                value="resident"
                checked={residency === "resident"}
                onChange={() => onResidencyChange("resident")}
              />
              <span className={styles.residencyLabelText}>
                Parañaque Resident
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="residency"
                value="nonresident"
                checked={residency === "nonresident"}
                onChange={() => onResidencyChange("nonresident")}
              />
              <span className={styles.residencyLabelText}>Non-Resident</span>
            </label>
          </div>
          <FieldError error={errors["residency"]} />
        </div>
      </div>

      {/* Address Field */}
      <div className={styles.fullRow}>
        <div style={{ flex: 1 }}>
          <label htmlFor="address" className={styles.fieldLabel}>
            (House No./Street/Subdivision){" "}
            <span className={styles.redAsterisk}>*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            onChange={onInputChange}
            className={errors["address"] ? styles.errorInput : ""}
            style={{
              backgroundColor: "#fefffe",
              boxShadow:
                "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
              padding: "0 0.8rem",
              height: "2.6rem",
              borderRadius: "3px",
              border: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <FieldError error={errors["address"]} />
        </div>
      </div>

      {/* City Selection - Only show for non-residents */}
      {residency === "nonresident" && (
        <div className={styles.fullRow}>
          <div style={{ flex: 1 }}>
            <label htmlFor="city" className={styles.fieldLabel}>
              City <span className={styles.redAsterisk}>*</span>
            </label>
            <select
              id="city"
              name="city"
              value={city}
              onChange={onCityChange}
              className={errors["city"] ? styles.errorInput : ""}
            >
              <option value="" disabled>
                Select City
              </option>
              {nonResidentCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError error={errors["city"]} />
          </div>
        </div>
      )}

      {/* Conditional fields based on residency and city selection */}
      {residency && (residency === "resident" || city) && (
        <>
          {/* District and Barangay Row */}
          {hasCityDistricts ? (
            <div className={styles.geographicalRow}>
              {/* District */}
              <div className={styles.leftColumn}>
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
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                <FieldError error={errors["district"]} />
              </div>

              {/* Barangay */}
              <div className={styles.rightColumn}>
                <label htmlFor="barangay" className={styles.fieldLabel}>
                  Barangay <span className={styles.redAsterisk}>*</span>
                </label>
                <select
                  id="barangay"
                  name="barangay"
                  value={barangay}
                  onChange={onBarangayChange}
                  className={errors["barangay"] ? styles.errorInput : ""}
                  disabled={!district}
                >
                  <option value="" disabled>
                    Select Barangay
                  </option>
                  {availableBarangays.map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}
                </select>
                <FieldError error={errors["barangay"]} />
              </div>
            </div>
          ) : (
            /* Barangay Full Width when no districts */
            <div className={styles.fullRow}>
              <div style={{ flex: 1 }}>
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
                  {availableBarangays.map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}
                </select>
                <FieldError error={errors["barangay"]} />
              </div>
            </div>
          )}

          {/* Preferred Place of Assignment - Parañaque Only with District Filter */}
          <div className={styles.geographicalRow}>
            {/* District Filter (not submitted, just for filtering) */}
            <div className={styles.leftColumn}>
              <label
                htmlFor="preferredDistrictFilter"
                className={styles.fieldLabel}
              >
                Preferred District (Filter)
              </label>
              <select
                id="preferredDistrictFilter"
                value={preferredDistrictFilter}
                onChange={(e) => {
                  setPreferredDistrictFilter(e.target.value);
                  // Clear preferred place when district filter changes
                  onPreferredPlaceChange({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLSelectElement>);
                }}
                className={styles.selectInput}
              >
                <option value="">All Parañaque Barangays</option>
                {paranaqueDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Place of Assignment */}
            <div className={styles.rightColumn}>
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
                {preferredPlaceBarangays.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
              <FieldError error={errors["preferredPlaceOfAssignment"]} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
