// src/hooks/useToast.ts
import { useState, useCallback } from "react";

export interface ToastConfig {
  show: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastConfig>({
    show: false,
    title: "",
    message: "",
    type: "success",
    duration: 3050,
  });

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "warning" | "info" = "success",
      duration: number = 3050
    ) => {
      setToast({
        show: true,
        title,
        message,
        type,
        duration,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, "error", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, "warning", duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, "info", duration);
    },
    [showToast]
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };
};
