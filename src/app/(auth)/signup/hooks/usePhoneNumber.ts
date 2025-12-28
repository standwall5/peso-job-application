// src/app/(auth)/signup/hooks/usePhoneNumber.ts
"use client";

import { useState, useCallback } from "react";
import { ValidationService } from "../services/validation.service";
import { FormService } from "../services/form.service";

export function usePhoneNumber() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneChange = useCallback(
    (value: string, setError?: (error: string | null) => void) => {
      const digits = FormService.sanitizePhoneNumber(value);
      setPhoneNumber(digits);

      if (!setError) return;

      const error = ValidationService.validatePhoneNumber(digits);
      setError(error);
    },
    [],
  );

  const handlePhoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed =
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === "Tab" ||
        e.ctrlKey ||
        e.metaKey;

      if (allowed) return;

      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }

      const target = e.currentTarget;
      const selectionLength = target.selectionEnd! - target.selectionStart!;

      if (!allowed && /^\d$/.test(e.key)) {
        if (phoneNumber.length - selectionLength >= 10) {
          e.preventDefault();
        }
      }
    },
    [phoneNumber],
  );

  const handlePhonePaste = useCallback(
    (
      e: React.ClipboardEvent<HTMLInputElement>,
      setError?: (error: string | null) => void,
    ) => {
      const pasted = e.clipboardData.getData("Text");
      const digits = pasted.replace(/\D/g, "");

      if (!digits) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal =
        phoneNumber.slice(0, start) +
        digits.slice(0, 10 - phoneNumber.length) +
        phoneNumber.slice(end);
      const final = newVal.slice(0, 10);
      setPhoneNumber(final);

      if (!setError) return;

      const error = ValidationService.validatePhoneNumber(final);
      setError(error);
    },
    [phoneNumber],
  );

  const validatePhone = useCallback((): string | null => {
    return ValidationService.validatePhoneNumber(phoneNumber);
  }, [phoneNumber]);

  const getFormattedPhone = useCallback((): string => {
    return FormService.formatPhoneNumber(phoneNumber);
  }, [phoneNumber]);

  const resetPhone = useCallback(() => {
    setPhoneNumber("");
  }, []);

  return {
    phoneNumber,
    handlePhoneChange,
    handlePhoneKeyDown,
    handlePhonePaste,
    validatePhone,
    getFormattedPhone,
    resetPhone,
    setPhoneNumber,
  };
}
