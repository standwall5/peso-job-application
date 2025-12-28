// src/app/admin/create-admin/hooks/useCreateAdmin.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminAction } from "@/app/admin/actions/admin.actions";
import { CreateAdminFormData } from "../types/create-admin.types";

export const useCreateAdmin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateAdminFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_superadmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateAdminFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAdminFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await createAdminAction(
        formData.email,
        formData.password,
        formData.name,
        formData.is_superadmin,
      );

      alert("Admin created successfully!");
      router.push("/admin/manage-admin");
    } catch (error) {
      console.error("Error creating admin:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create admin. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof CreateAdminFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return { formData, errors, loading, handleSubmit, updateField };
};
