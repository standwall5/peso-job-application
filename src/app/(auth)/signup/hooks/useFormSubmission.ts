// src/app/(auth)/signup/hooks/useFormSubmission.ts
"use client";

import { useCallback, useMemo } from "react";
import { signup } from "@/lib/auth-actions";
import { REQUIRED_FIELDS } from "../constants/form.constants";
import { useFormValidation } from "./useFormValidation";
import { usePasswordValidation } from "./usePasswordValidation";
import { usePhoneNumber } from "./usePhoneNumber";
import { useBirthDate } from "./useBirthDate";

// ============================================
// 🧪 TESTING CONFIGURATION
// ============================================
const TEST_MODE = {
  MOCK: "mock", // Test UI/validation only (no DB)
  REAL: "real", // Actual signup
} as const;

// 🔥 CHANGE THIS TO SWITCH BETWEEN TEST AND PRODUCTION
const CURRENT_MODE = TEST_MODE.MOCK; // Set to TEST_MODE.REAL for production

// Mock scenarios - change to test different responses
const MOCK_SCENARIO = {
  SUCCESS: "success",
  EMAIL_EXISTS: "emailExists",
  SERVER_ERROR: "serverError",
} as const;

const ACTIVE_SCENARIO = MOCK_SCENARIO.SUCCESS; // Change to test different scenarios

// ============================================
// 🎭 MOCK SIGNUP FUNCTION
// ============================================
const mockSignup = async (
  formData: FormData,
): Promise<{ success?: string; error?: string }> => {
  console.group("🧪 MOCK MODE - Form Submission Test");
  console.log("⚠️  No data will be saved to database");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Convert FormData to object for easier viewing
  const dataObject: Record<string, string | File> = {};
  formData.forEach((value, key) => {
    dataObject[key] = value instanceof File ? value : String(value);
  });

  console.log("\n📊 Form Data Summary:");
  console.table(
    Object.fromEntries(
      Object.entries(dataObject).map(([key, value]) => [
        key,
        value instanceof File ? `[File: ${value.name}]` : value,
      ]),
    ),
  );

  console.log("\n📋 Detailed Data Structure:");
  console.log("Personal Information:", {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    middleName: formData.get("middleName"),
    extName: formData.get("extName"),
    gender: formData.get("gender"),
    birthDate: formData.get("birthDate"),
    age: formData.get("age"),
  });

  console.log("Contact Information:", {
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"), // Should be +639XXXXXXXXX
  });

  console.log("Address Information:", {
    residency: formData.get("residency"),
    address: formData.get("address"),
    district: formData.get("district"),
    barangay: formData.get("Barangay"),
    preferredPlace: formData.get("preferredPlaceOfAssignment"),
  });

  console.log("Applicant Information:", {
    applicantType: formData.get("applicantType"),
    disabilityType: formData.get("disabilityType"),
    pwdNumber: formData.get("pwdNumber"),
    studentId: formData.get("studentId"),
    ofwNumber: formData.get("ofwNumber"),
    seniorCitizenNumber: formData.get("seniorCitizenNumber"),
    soloParentNumber: formData.get("soloParentNumber"),
    othersSpecify: formData.get("othersSpecify"),
  });

  console.log("Security:", {
    password: formData.get("password") ? "[HIDDEN]" : "Not set",
    confirmPassword: formData.get("confirmPassword") ? "[HIDDEN]" : "Not set",
    acceptTerms: formData.get("acceptTerms"),
  });

  console.log("\n🔍 Data Validation Check:");
  console.log("✅ Phone format:", formData.get("phoneNumber"));
  console.log("✅ Date format:", formData.get("birthDate"));
  console.log("✅ Applicant types:", formData.get("applicantType"));

  console.log("\n⏳ Simulating network delay (1 second)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.groupEnd();

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return different scenarios based on configuration
  const scenarios: Record<string, { success?: string; error?: string }> = {
    [MOCK_SCENARIO.SUCCESS]: {
      success: "✅ Registration successful! (Mock Mode - No data saved)",
    },
    [MOCK_SCENARIO.EMAIL_EXISTS]: {
      error: "❌ Email already exists (Mock Error)",
    },
    [MOCK_SCENARIO.SERVER_ERROR]: {
      error: "❌ Server error occurred (Mock Error)",
    },
  };

  return scenarios[ACTIVE_SCENARIO];
};

// ============================================
// 🎯 HOOK INTERFACE
// ============================================
interface UseFormSubmissionProps {
  validationHook: ReturnType<typeof useFormValidation>;
  passwordHook: ReturnType<typeof usePasswordValidation>;
  phoneHook: ReturnType<typeof usePhoneNumber>;
  birthDateHook: ReturnType<typeof useBirthDate>;
  gender: string;
  genderOther: string;
  emailValue: string;
  residency: string | null;
  barangay: string;
  preferredPlace: string;
  district: string;
  applicantType: string[];
  extNameValue: string;
  formRef: React.RefObject<HTMLFormElement>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setModal: (show: boolean) => void;
}

// ============================================
// 🪝 MAIN HOOK
// ============================================
export function useFormSubmission({
  validationHook,
  passwordHook,
  phoneHook,
  birthDateHook,
  gender,
  genderOther,
  emailValue,
  residency,
  barangay,
  preferredPlace,
  district,
  applicantType,
  extNameValue,
  formRef,
  setError,
  setSuccess,
  setModal,
}: UseFormSubmissionProps) {
  const requiredFields = useMemo(() => REQUIRED_FIELDS, []);

  // ============================================
  // 📝 FORM VALIDATION
  // ============================================
  const validateForm = useCallback(
    (formEl: HTMLFormElement): Record<string, string> => {
      const newErrors: Record<string, string> = {};

      // Validate required text fields
      for (const name of requiredFields) {
        const element = formEl.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLSelectElement
          | null;
        if (!element) continue;

        if (element instanceof HTMLInputElement && element.type === "file") {
          if (!element.files || element.files.length === 0) {
            newErrors[name] = "This file is required";
          }
          continue;
        }

        if (
          element instanceof HTMLInputElement &&
          element.type === "checkbox"
        ) {
          if (!element.checked) {
            newErrors[name] = "You must accept terms";
          }
          continue;
        }

        const value = (element as HTMLInputElement | HTMLSelectElement).value;
        if (!value || value.trim() === "") {
          newErrors[name] = "This field is required";
        }
      }

      // Gender validations
      if (!gender) {
        newErrors.gender = "Gender is required";
      } else if (gender === "Others") {
        if (!genderOther || genderOther.trim() === "") {
          newErrors.genderOther = "Please specify gender";
        }
      }

      // Phone validation
      const phoneError = phoneHook.validatePhone();
      if (phoneError) {
        newErrors.phoneNumber = phoneError;
      }

      // Email validation
      if (!emailValue || emailValue.trim() === "") {
        newErrors.email = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
          newErrors.email = "Please enter a valid email address";
        }
      }

      // Residence validation
      if (!residency) {
        newErrors.residency = "Residence is required";
      }

      // Barangay validation (if resident)
      if (residency === "resident") {
        if (!barangay || barangay.trim() === "") {
          newErrors.barangay = "Barangay is required";
        }
        if (!preferredPlace || preferredPlace.trim() === "") {
          newErrors.preferredPlaceOfAssignment =
            "Preferred place of assignment is required";
        }
        if (!district || district.trim() === "") {
          newErrors.district = "District is required";
        }
      }

      // Birthdate validation
      const birthDateError = birthDateHook.validateBirthDate();
      if (birthDateError) {
        newErrors.birthDate = birthDateError;
      }

      // Password validation
      const passwordError = passwordHook.validatePasswordMatch();
      if (passwordError) {
        newErrors.password = passwordError;
        newErrors.confirmPassword = passwordError;
      }

      // Applicant type validation
      if (!applicantType || applicantType.length === 0) {
        newErrors.applicantType = "Please select at least one applicant type";
      }

      // PWD specific validation
      if (applicantType.includes("Person with Disability (PWD)")) {
        const disability = (
          formEl.elements.namedItem(
            "disabilityType",
          ) as HTMLSelectElement | null
        )?.value;
        if (!disability || disability.trim() === "") {
          newErrors.disabilityType = "Please select disability type";
        }
      }

      // Others applicant type validation
      if (applicantType.includes("Others")) {
        const othersValue = (
          formEl.elements.namedItem("othersSpecify") as HTMLInputElement | null
        )?.value;
        if (!othersValue || othersValue.trim() === "") {
          newErrors.othersSpecify = "Please specify applicant type";
        }
      }

      return newErrors;
    },
    [
      requiredFields,
      gender,
      genderOther,
      phoneHook,
      emailValue,
      residency,
      barangay,
      preferredPlace,
      district,
      birthDateHook,
      passwordHook,
      applicantType,
    ],
  );

  // ============================================
  // 🚀 FORM SUBMISSION
  // ============================================
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      validationHook.setIsSubmitted(true);

      const formEl = e.currentTarget;
      const formErrors = validateForm(formEl);

      // If validation errors exist, show them and stop
      if (Object.keys(formErrors).length > 0) {
        validationHook.setErrors(formErrors);
        setTimeout(() => validationHook.scrollToFirstError(formRef), 50);
        return;
      }

      // Validation passed - prepare form data
      validationHook.clearAllErrors();
      validationHook.setIsSubmitted(false);

      const formData = new FormData(formEl);

      // Set custom field values
      formData.set(
        "gender",
        gender === "Others" ? genderOther || "Others" : gender,
      );
      formData.set("phoneNumber", phoneHook.getFormattedPhone());
      formData.set("birthDate", birthDateHook.birthDate);
      formData.set("email", emailValue);
      formData.set("residency", residency || "");
      formData.set("Barangay", barangay);
      formData.set("district", district);
      formData.set("preferredPlaceOfAssignment", preferredPlace);
      formData.set("extName", extNameValue);
      formData.set("applicantType", applicantType.join(", "));

      // Get optional fields
      const disabilityType =
        (
          formEl.elements.namedItem(
            "disabilityType",
          ) as HTMLSelectElement | null
        )?.value || "";
      const pwdNumber =
        (formEl.elements.namedItem("pwdNumber") as HTMLInputElement | null)
          ?.value || "";

      formData.set("disabilityType", disabilityType);
      if (pwdNumber) {
        formData.set("pwdNumber", pwdNumber);
      }

      // ============================================
      // 🎯 SUBMIT BASED ON MODE
      // ============================================
      let result: { success?: string; error?: string } | undefined;

      if (CURRENT_MODE === TEST_MODE.MOCK) {
        // 🧪 Mock Mode - Test without saving to database
        console.log("🧪 Running in MOCK MODE");
        result = await mockSignup(formData);
      } else {
        // 🚀 Real Mode - Actual database submission
        console.log("🚀 Running in REAL MODE - Submitting to database");
        result = await signup(formData);
      }

      // Handle response
      if (result?.error) {
        setError(result.error);
        setModal(true);
      } else if (result?.success) {
        setSuccess(result.success);
        setModal(true);
      }
    },
    [
      validationHook,
      validateForm,
      gender,
      genderOther,
      phoneHook,
      birthDateHook,
      emailValue,
      residency,
      barangay,
      district,
      preferredPlace,
      extNameValue,
      applicantType,
      formRef,
      setError,
      setSuccess,
      setModal,
    ],
  );

  return {
    handleSubmit,
    validateForm,
  };
}
