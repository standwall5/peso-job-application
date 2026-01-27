// src/app/(auth)/signup/components/SignUpForm.tsx
"use client";

import React, { useCallback } from "react";
import styles from "./SignUp.module.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import Button from "@/components/Button";

// Import custom hooks
import {
  usePasswordValidation,
  usePhoneNumber,
  useBirthDate,
  useFormHandlers,
  useFormSubmission,
} from "../hooks";

// Import UI components
import { FormNotice } from "./FormNotice";
import { WarningModal } from "./WarningModal";

// Import section components
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ApplicantTypeSection } from "./sections/ApplicantTypeSection";
import { AddressSection } from "./sections/AddressSection";
import { ContactSection } from "./sections/ContactSection";
import { PasswordSection } from "./sections/PasswordSection";
import { TermsSection } from "./sections/TermsSection";

const SignUpForm = () => {
  // ✅ FIX: Remove null from type - form will always be mounted
  const formRef = React.useRef<HTMLFormElement>(null!);

  // Initialize hooks
  const passwordHook = usePasswordValidation();
  const phoneHook = usePhoneNumber();
  const birthDateHook = useBirthDate();
  const formHandlers = useFormHandlers();

  // Submission hook
  const { handleSubmit } = useFormSubmission({
    validationHook: formHandlers.validationHook,
    passwordHook,
    phoneHook,
    birthDateHook,
    gender: formHandlers.gender,
    genderOther: formHandlers.genderOther,
    emailValue: formHandlers.emailValue,
    residency: formHandlers.residency,
    city: formHandlers.city,
    barangay: formHandlers.barangay,
    preferredPlace: formHandlers.preferredPlace,
    district: formHandlers.district,
    applicantType: formHandlers.applicantType,
    extNameValue: formHandlers.extNameValue,
    formRef,
    setError: formHandlers.setError,
    setSuccess: formHandlers.setSuccess,
    setModal: formHandlers.setModal,
  });

  const handleReset = useCallback(() => {
    passwordHook.resetPassword();
    birthDateHook.resetBirthDate();
    phoneHook.resetPhone();
    formHandlers.resetFormState();
    formHandlers.validationHook.resetValidation();

    const form = formRef.current;
    if (form) form.reset();
  }, [passwordHook, birthDateHook, phoneHook, formHandlers]);

  return (
    <div className={styles.signUpContainer}>
      <WarningModal
        show={formHandlers.modal}
        success={formHandlers.success}
        error={formHandlers.error}
        onClose={() => formHandlers.setModal(false)}
      />

      <div className={styles.signUpContent}>
        <h2>REGISTER</h2>
        <form
          className={styles.signUpForm}
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
        >
          <FormNotice show={formHandlers.validationHook.showFormNotice} />

          <PersonalInfoSection
            onInputChange={formHandlers.handleInputChange}
            extNameValue={formHandlers.extNameValue}
            onExtNameChange={formHandlers.setExtNameValue}
            birthDate={birthDateHook.birthDate}
            calculatedAge={birthDateHook.calculatedAge}
            onBirthDateChange={birthDateHook.handleBirthDateChange}
            parseBirthDateString={birthDateHook.parseBirthDateString}
            formatDateYYYYMMDD={birthDateHook.formatDateYYYYMMDD}
            gender={formHandlers.gender}
            genderOther={formHandlers.genderOther}
            onGenderChange={formHandlers.handleGenderChange}
            onGenderOtherChange={formHandlers.handleSexOtherChange}
            errors={formHandlers.validationHook.errors}
            onSetError={formHandlers.validationHook.setError}
            onClearError={formHandlers.validationHook.clearError}
          />

          <ApplicantTypeSection
            applicantType={formHandlers.applicantType}
            onApplicantTypeChange={formHandlers.handleApplicantTypeChange}
            onInputChange={formHandlers.handleInputChange}
            errors={formHandlers.validationHook.errors}
          />

          <AddressSection
            residency={formHandlers.residency}
            city={formHandlers.city}
            district={formHandlers.district}
            barangay={formHandlers.barangay}
            preferredPlace={formHandlers.preferredPlace}
            onResidencyChange={formHandlers.handleResidencyChange}
            onCityChange={formHandlers.handleCityChange}
            onDistrictChange={formHandlers.handleDistrictChange}
            onBarangayChange={formHandlers.handlebarangayChange}
            onPreferredPlaceChange={formHandlers.handlePreferredPlaceChange}
            onInputChange={formHandlers.handleInputChange}
            errors={formHandlers.validationHook.errors}
          />

          <ContactSection
            emailValue={formHandlers.emailValue}
            phoneNumber={phoneHook.phoneNumber}
            onEmailChange={formHandlers.handleEmailChange}
            onPhoneChange={(value) =>
              phoneHook.handlePhoneChange(value, (error) => {
                if (error) {
                  formHandlers.validationHook.setError("phoneNumber", error);
                } else {
                  formHandlers.validationHook.clearError("phoneNumber");
                }
              })
            }
            onPhoneKeyDown={phoneHook.handlePhoneKeyDown}
            onPhonePaste={(e) =>
              phoneHook.handlePhonePaste(e, (error) => {
                if (error) {
                  formHandlers.validationHook.setError("phoneNumber", error);
                } else {
                  formHandlers.validationHook.clearError("phoneNumber");
                }
              })
            }
            errors={formHandlers.validationHook.errors}
          />

          <PasswordSection
            password={passwordHook.password}
            confirmPassword={passwordHook.confirmPassword}
            showPassword={passwordHook.showPassword}
            showConfirm={passwordHook.showConfirm}
            passwordRequirements={passwordHook.passwordRequirements}
            onPasswordChange={(value) =>
              passwordHook.handlePasswordChange(value, () =>
                formHandlers.validationHook.clearError("password"),
              )
            }
            onConfirmPasswordChange={(value) =>
              passwordHook.handleConfirmPasswordChange(value, () =>
                formHandlers.validationHook.clearError("confirmPassword"),
              )
            }
            onToggleShowPassword={passwordHook.toggleShowPassword}
            onToggleShowConfirm={passwordHook.toggleShowConfirm}
            errors={formHandlers.validationHook.errors}
          />

          <TermsSection
            acceptTerms={formHandlers.acceptTerms}
            onAcceptTermsChange={formHandlers.handleAcceptTermsChange}
            error={formHandlers.validationHook.errors["acceptTerms"]}
          />

          <div className={styles.signUpButtonContainer}>
            <Button
              type="button"
              className={styles.redButton}
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
            <Button className={styles.greenButton}>Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
