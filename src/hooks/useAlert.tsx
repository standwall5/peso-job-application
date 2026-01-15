"use client";

import { useState, useCallback } from "react";
import { AlertType } from "@/components/AlertModal";

interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState extends AlertOptions {
  show: boolean;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  const showAlert = useCallback((options: AlertOptions | string) => {
    if (typeof options === "string") {
      // Simple usage: showAlert("message")
      setAlertState({
        show: true,
        type: "info",
        message: options,
      });
    } else {
      // Advanced usage: showAlert({ type: "error", message: "..." })
      setAlertState({
        show: true,
        type: options.type || "info",
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        showCancel: options.showCancel,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
    }
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, show: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    hideAlert();
  }, [alertState, hideAlert]);

  const handleCancel = useCallback(() => {
    if (alertState.onCancel) {
      alertState.onCancel();
    }
    hideAlert();
  }, [alertState, hideAlert]);

  // Convenience methods
  const showSuccess = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({ type: "success", message, onConfirm });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({ type: "error", message, onConfirm });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({ type: "warning", message, onConfirm });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({ type: "info", message, onConfirm });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      options?: Partial<AlertOptions>
    ) => {
      showAlert({
        type: "warning",
        message,
        showCancel: true,
        confirmText: "Confirm",
        cancelText: "Cancel",
        onConfirm,
        onCancel,
        ...options,
      });
    },
    [showAlert]
  );

  return {
    alertState,
    showAlert,
    hideAlert,
    handleConfirm,
    handleCancel,
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
}
