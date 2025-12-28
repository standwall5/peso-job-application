// src/app/(auth)/signup/hooks/useBirthDate.ts
"use client";

import { useState, useCallback } from "react";
import { FormService } from "../services/form.service";
import { ValidationService } from "../services/validation.service";

const MIN_AGE = 15;
const MIN_YEAR = 1900;

export function useBirthDate() {
  const [birthDate, setBirthDate] = useState<string>("");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const calculateAge = useCallback((birthDateValue: string): number | null => {
    return FormService.calculateAge(birthDateValue);
  }, []);

  const handleBirthDateChange = useCallback(
    (newBirthDate: string, setError?: (error: string | null) => void) => {
      setBirthDate(newBirthDate);
      const today = new Date();
      const birth = new Date(newBirthDate);

      // No date entered
      if (!newBirthDate) {
        setCalculatedAge(null);
        if (setError) setError(null);
        return;
      }

      // Invalid date format
      if (isNaN(birth.getTime())) {
        if (setError) setError("Invalid date");
        setCalculatedAge(null);
        return;
      }

      // Future date
      if (birth > today) {
        if (setError) setError("Birth date cannot be in the future");
        setCalculatedAge(null);
        return;
      }

      // Date too old
      if (birth < new Date(`${MIN_YEAR}-01-01`)) {
        if (setError) setError(`Birth date cannot be before ${MIN_YEAR}`);
        setCalculatedAge(null);
        return;
      }

      // Calculate age
      const age = calculateAge(newBirthDate);
      setCalculatedAge(age);

      // Age validation
      if (age !== null && age < MIN_AGE) {
        if (setError)
          setError(`You must be at least ${MIN_AGE} years old to register`);
        return;
      }

      // All validations passed
      if (setError) setError(null);
    },
    [calculateAge],
  );

  const parseBirthDateString = useCallback((s: string): Date | null => {
    return FormService.parseBirthDateString(s);
  }, []);

  const formatDateYYYYMMDD = useCallback((d: Date): string => {
    return FormService.formatDateYYYYMMDD(d);
  }, []);

  const validateBirthDate = useCallback((): string | null => {
    return ValidationService.validateBirthDate(birthDate);
  }, [birthDate]);

  const resetBirthDate = useCallback(() => {
    setBirthDate("");
    setCalculatedAge(null);
  }, []);

  return {
    birthDate,
    calculatedAge,
    handleBirthDateChange,
    parseBirthDateString,
    formatDateYYYYMMDD,
    validateBirthDate,
    resetBirthDate,
    setBirthDate,
    calculateAge,
    MIN_AGE, // Export for UI hints
  };
}
