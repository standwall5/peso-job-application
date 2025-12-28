// src/app/(auth)/signup/hooks/useFormValidation.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { FormErrors } from "../types/form.types";

export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFormNotice, setShowFormNotice] = useState(false);

  useEffect(() => {
    setShowFormNotice(isSubmitted && Object.keys(errors).length > 0);
  }, [errors, isSubmitted]);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback((fields: string[]) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      fields.forEach((field) => delete newErrors[field]);
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const scrollToFirstError = useCallback(
    (formRef: React.RefObject<HTMLFormElement>) => {
      const form = formRef.current;
      if (!form) return;
      const firstKey = Object.keys(errors).find((k) => errors[k]);
      if (!firstKey) return;
      const el = form.elements.namedItem(firstKey) as HTMLElement | null;
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
    },
    [errors],
  );

  const resetValidation = useCallback(() => {
    setErrors({});
    setIsSubmitted(false);
    setShowFormNotice(false);
  }, []);

  return {
    errors,
    isSubmitted,
    showFormNotice,
    setError,
    clearError,
    clearErrors,
    clearAllErrors,
    hasErrors,
    setIsSubmitted,
    scrollToFirstError,
    resetValidation,
    setErrors,
  };
}
