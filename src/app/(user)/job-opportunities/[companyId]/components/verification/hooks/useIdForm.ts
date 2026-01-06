// Custom hook for managing ID form state
import { useState } from "react";
import { IdFormState } from "../types";
import { createFilePreview } from "../utils";

export function useIdForm(initialIdType: string = "") {
  const [formState, setFormState] = useState<IdFormState>({
    idType: initialIdType,
    idFront: null,
    idBack: null,
    selfie: null,
    step: 1,
    previews: {},
  });

  const setIdType = (idType: string) => {
    setFormState((prev) => ({ ...prev, idType }));
  };

  const setStep = (step: number) => {
    setFormState((prev) => ({ ...prev, step }));
  };

  const handleFileChange = async (file: File, type: "front" | "back" | "selfie") => {
    try {
      const preview = await createFilePreview(file);

      // Update the appropriate file state
      const fileKey = type === "front" ? "idFront" : type === "back" ? "idBack" : "selfie";

      setFormState((prev) => ({
        ...prev,
        [fileKey]: file,
        previews: { ...prev.previews, [type]: preview },
      }));
    } catch (error) {
      console.error("Error creating preview:", error);
    }
  };

  const resetForm = (keepIdType: boolean = false) => {
    setFormState({
      idType: keepIdType ? formState.idType : "",
      idFront: null,
      idBack: null,
      selfie: null,
      step: 1,
      previews: {},
    });
  };

  const canProceedStep1 = (editMode: boolean) => {
    return editMode
      ? !!formState.idType
      : !!formState.idFront && !!formState.idBack && !!formState.idType;
  };

  const canSubmit = (editMode: boolean) => {
    return editMode
      ? !!formState.idType
      : !!formState.idFront && !!formState.idBack && !!formState.selfie && !!formState.idType;
  };

  return {
    ...formState,
    setIdType,
    setStep,
    handleFileChange,
    resetForm,
    canProceedStep1,
    canSubmit,
  };
}
