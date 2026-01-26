// Refactored VerifiedIdUpload component
import React, { useState } from "react";
import BlocksWave from "@/components/BlocksWave";

import { useExistingId } from "./hooks/useExistingId";
import { useIdForm } from "./hooks/useIdForm";
import { IdViewMode } from "./components/IdViewMode";
import { IdEditMode } from "./components/IdEditMode";
import { Message, SelectedImage } from "./types";
import { getImageUrl } from "./utils";
import styles from "./VerifiedIdUpload.module.css";

interface VerifiedIdUploadProps {
  jobId: number;
  onSubmitted?: () => void;
  showSubmitButton?: boolean;
  onSubmitFinalApplication?: () => void;
}

export default function VerifiedIdUpload({
  jobId,
  onSubmitted,
  showSubmitButton = false,
  onSubmitFinalApplication,
}: VerifiedIdUploadProps) {
  // Existing ID state
  const { existingId, loading: loadingExisting, refetch } = useExistingId();
  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  // Form state
  const {
    idType,
    idFront,
    idBack,
    selfie,
    step,
    previews,
    setIdType,
    setStep,
    handleFileChange,
    resetForm,
    canProceedStep1,
    canSubmit,
  } = useIdForm(existingId?.id_type || "");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Initialize form with existing ID data when entering edit mode
  React.useEffect(() => {
    if (existingId && !editMode) {
      setIdType(existingId.id_type);
    }
  }, [existingId, editMode, setIdType]);

  const handleImageClick = (
    type: "front" | "back" | "selfie",
    path: string,
  ) => {
    setSelectedImage({ type, url: getImageUrl(path) });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit
      setEditMode(false);
      resetForm(true); // Keep ID type
      setMessage(null);
    } else {
      // Enter edit mode
      setEditMode(true);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editing and no changes, just exit
    if (
      editMode &&
      !idFront &&
      !idBack &&
      !selfie &&
      idType === existingId?.id_type
    ) {
      setEditMode(false);
      return;
    }

    // If editing and changing images, require all three
    if (
      editMode &&
      (idFront || idBack || selfie) &&
      !(idFront && idBack && selfie)
    ) {
      setMessage({
        text: "Please upload all three images (front, back, and selfie) to update your ID.",
        type: "error",
      });
      return;
    }

    if (!canSubmit(editMode)) return;

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jobId", String(jobId));
    formData.append("idType", idType);

    if (idFront && idBack && selfie) {
      formData.append("idFront", idFront);
      formData.append("idBack", idBack);
      formData.append("selfie", selfie);
    } else if (editMode && existingId) {
      // Just updating type, no new images
      formData.append("existingId", "true");
    }

    try {
      const res = await fetch("/api/verified-id/submit", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setSubmitting(false);

      if (result.success) {
        setMessage({
          text: result.message || "ID saved successfully!",
          type: "success",
        });

        if (editMode) {
          setEditMode(false);
        }

        resetForm(true); // Keep ID type
        setStep(1);

        // Refresh existing ID data
        await refetch();

        if (onSubmitted) {
          onSubmitted();
        }
      } else {
        setMessage({
          text: result.error || "Submission failed.",
          type: "error",
        });
      }
    } catch {
      setSubmitting(false);
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  if (loadingExisting) {
    return <BlocksWave />;
  }

  // VIEW MODE: Existing ID
  if (existingId && !editMode) {
    return (
      <IdViewMode
        existingId={existingId}
        message={message}
        selectedImage={selectedImage}
        showSubmitButton={showSubmitButton}
        onEdit={handleEditToggle}
        onImageClick={handleImageClick}
        onCloseModal={closeModal}
        onSubmitFinalApplication={onSubmitFinalApplication}
      />
    );
  }

  // EDIT/UPLOAD MODE
  return (
    <IdEditMode
      editMode={editMode}
      existingId={existingId}
      idType={idType}
      step={step}
      previews={previews}
      submitting={submitting}
      message={message}
      canProceedStep1={canProceedStep1(editMode)}
      canSubmit={canSubmit(editMode)}
      onIdTypeChange={setIdType}
      onFileChange={handleFileChange}
      onStepChange={setStep}
      onCancel={handleEditToggle}
      onSubmit={handleSubmit}
    />
  );
}
