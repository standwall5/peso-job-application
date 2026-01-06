// src/app/(user)/job-opportunities/[companyId]/hooks/useToast.ts
import { useState } from "react";
import { ToastState } from "../types/application.types";

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: "",
    message: "",
  });

  const showToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};
