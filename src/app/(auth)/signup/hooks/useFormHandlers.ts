// src/app/(auth)/signup/hooks/useFormHandlers.ts
"use client";

import { useState, useCallback } from "react";
import { useFormValidation } from "./useFormValidation";

export function useFormHandlers() {
  const validationHook = useFormValidation();

  // Form state
  const [gender, setGender] = useState<string>("");
  const [genderOther, setGenderOther] = useState<string>("");
  const [residency, setResidency] = useState<string | null>(null);
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [barangay, setbarangay] = useState<string>("");
  const [preferredPlace, setPreferredPlace] = useState<string>("");
  const [extNameValue, setExtNameValue] = useState<string>("None");
  const [emailValue, setEmailValue] = useState<string>("");
  const [applicantType, setApplicantType] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handlers
  const handleGenderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setGender(val);
      if (val) {
        validationHook.clearError("gender");
      } else if (validationHook.isSubmitted) {
        validationHook.setError("gender", "Please select gender");
      }
    },
    [validationHook],
  );

  const handleSexOtherChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setGenderOther(v);
      if (v) {
        validationHook.clearError("genderOther");
      } else if (validationHook.isSubmitted) {
        validationHook.setError("genderOther", "Please specify");
      }
    },
    [validationHook],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setEmailValue(v);
      if (!v || v.trim() === "") {
        if (validationHook.isSubmitted) {
          validationHook.setError("email", "This field is required");
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(v)) {
          validationHook.setError(
            "email",
            "Please enter a valid email address",
          );
        } else {
          validationHook.clearError("email");
        }
      }
    },
    [validationHook],
  );

  const handleResidencyChange = useCallback(
    (value: "resident" | "nonresident") => {
      setResidency(value);
      validationHook.clearError("residency");

      // Reset location fields when changing residency
      setCity(value === "resident" ? "Parañaque" : "");
      setDistrict("");
      setbarangay("");
      setPreferredPlace("");

      if (validationHook.isSubmitted) {
        validationHook.clearErrors([
          "city",
          "district",
          "barangay",
          "preferredPlaceOfAssignment",
        ]);
      }
    },
    [validationHook],
  );

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setCity(v);

      // Reset dependent fields when city changes
      setDistrict("");
      setbarangay("");
      setPreferredPlace("");

      if (v) {
        validationHook.clearError("city");
      } else if (validationHook.isSubmitted) {
        validationHook.setError("city", "Please select city");
      }

      // Clear dependent field errors
      if (validationHook.isSubmitted) {
        validationHook.clearErrors([
          "district",
          "barangay",
          "preferredPlaceOfAssignment",
        ]);
      }
    },
    [validationHook],
  );

  const handlebarangayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setbarangay(v);
      if (v) {
        validationHook.clearError("barangay");
      } else {
        validationHook.setError("barangay", "Please select Barangay");
      }
    },
    [validationHook],
  );

  const handlePreferredPlaceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setPreferredPlace(v);
      if (v) {
        validationHook.clearError("preferredPlaceOfAssignment");
      } else if (validationHook.isSubmitted) {
        validationHook.setError(
          "preferredPlaceOfAssignment",
          "Please select preferred place",
        );
      }
    },
    [validationHook],
  );

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setDistrict(v);

      // Reset barangay when district changes
      setbarangay("");

      if (v) {
        validationHook.clearError("district");
      } else if (validationHook.isSubmitted) {
        validationHook.setError("district", "Please select District");
      }

      // Clear barangay error
      if (validationHook.isSubmitted) {
        validationHook.clearError("barangay");
      }
    },
    [validationHook],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const name = e.target.name;
      const value = (e.target as HTMLInputElement).value;
      if (value && value.trim() !== "") {
        validationHook.clearError(name);
      }
    },
    [validationHook],
  );

  const handleApplicantTypeChange = useCallback(
    (type: string, checked: boolean) => {
      let updated = [...applicantType];
      if (checked) {
        updated.push(type);
      } else {
        updated = updated.filter((t) => t !== type);
      }
      setApplicantType(updated);
      if (updated.length > 0) {
        validationHook.clearError("applicantType");
      }
    },
    [applicantType, validationHook],
  );

  const handleAcceptTermsChange = useCallback(
    (checked: boolean) => {
      setAcceptTerms(checked);
      if (checked) {
        validationHook.clearError("acceptTerms");
      } else if (validationHook.isSubmitted) {
        validationHook.setError("acceptTerms", "You must accept terms");
      }
    },
    [validationHook],
  );

  const resetFormState = useCallback(() => {
    setGender("");
    setGenderOther("");
    setResidency(null);
    setCity("");
    setDistrict("");
    setbarangay("");
    setPreferredPlace("");
    setExtNameValue("None");
    setEmailValue("");
    setApplicantType([]);
    setAcceptTerms(false);
  }, []);

  return {
    validationHook,
    // State
    gender,
    genderOther,
    residency,
    city,
    district,
    barangay,
    preferredPlace,
    extNameValue,
    emailValue,
    applicantType,
    acceptTerms,
    modal,
    error,
    success,
    // Setters
    setGender,
    setGenderOther,
    setResidency,
    setCity,
    setDistrict,
    setbarangay,
    setPreferredPlace,
    setExtNameValue,
    setEmailValue,
    setApplicantType,
    setAcceptTerms,
    setModal,
    setError,
    setSuccess,
    // Handlers
    handleGenderChange,
    handleSexOtherChange,
    handleEmailChange,
    handleResidencyChange,
    handleCityChange,
    handlebarangayChange,
    handlePreferredPlaceChange,
    handleDistrictChange,
    handleInputChange,
    handleApplicantTypeChange,
    handleAcceptTermsChange,
    resetFormState,
  };
}
