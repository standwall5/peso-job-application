// src/app/(auth)/signup/hooks/usePasswordValidation.ts
"use client";

import { useState, useCallback } from "react";
import { PasswordRequirements } from "../types/form.types";
import { ValidationService } from "../services/validation.service";

export function usePasswordValidation() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordRequirements, setPasswordRequirements] =
    useState<PasswordRequirements>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });

  const validatePassword = useCallback((passwordValue: string): boolean => {
    const validation = ValidationService.validatePassword(passwordValue);
    setPasswordRequirements(validation.requirements);
    return validation.isValid;
  }, []);

  const handlePasswordChange = useCallback(
    (value: string, clearError?: () => void) => {
      setPassword(value);
      validatePassword(value);
      if (value && value.trim() !== "" && clearError) {
        clearError();
      }
    },
    [validatePassword],
  );

  const handleConfirmPasswordChange = useCallback(
    (value: string, clearError?: () => void) => {
      setConfirmPassword(value);
      if (value && value.trim() !== "" && clearError) {
        clearError();
      }
    },
    [],
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirm = useCallback(() => {
    setShowConfirm((prev) => !prev);
  }, []);

  const validatePasswordMatch = useCallback((): string | null => {
    return ValidationService.validatePasswordMatch(password, confirmPassword);
  }, [password, confirmPassword]);

  const resetPassword = useCallback(() => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setPasswordRequirements({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });
  }, []);

  return {
    password,
    confirmPassword,
    showPassword,
    showConfirm,
    passwordRequirements,
    handlePasswordChange,
    handleConfirmPasswordChange,
    toggleShowPassword,
    toggleShowConfirm,
    validatePassword,
    validatePasswordMatch,
    resetPassword,
  };
}
