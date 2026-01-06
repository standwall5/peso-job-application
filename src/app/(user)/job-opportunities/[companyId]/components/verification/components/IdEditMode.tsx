// Edit mode component - form for uploading/editing ID
import React from "react";
import Button from "@/components/Button";
import { ApplicantIDData } from "@/lib/db/services/applicant-id.service";
import { Message } from "../types";
import { getImageUrl } from "../utils";
import { MessageBanner } from "./MessageBanner";
import { StepIndicator } from "./StepIndicator";
import { IdTypeSelector } from "./IdTypeSelector";
import { ImageUploadField } from "./ImageUploadField";
import { Instructions } from "./Instructions";
import styles from "../VerifiedIdUpload.module.css";

interface IdEditModeProps {
  editMode: boolean;
  existingId: ApplicantIDData | null;
  idType: string;
  step: number;
  previews: {
    front?: string;
    back?: string;
    selfie?: string;
  };
  submitting: boolean;
  message: Message | null;
  canProceedStep1: boolean;
  canSubmit: boolean;
  onIdTypeChange: (type: string) => void;
  onFileChange: (file: File, type: "front" | "back" | "selfie") => void;
  onStepChange: (step: number) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function IdEditMode({
  editMode,
  existingId,
  idType,
  step,
  previews,
  submitting,
  message,
  canProceedStep1,
  canSubmit,
  onIdTypeChange,
  onFileChange,
  onStepChange,
  onCancel,
  onSubmit,
}: IdEditModeProps) {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            {editMode
              ? "Edit Your Government ID"
              : "Verified Government ID Submission"}
          </h2>
          <p className={styles.subtitle}>
            {editMode
              ? "Update your ID type or upload new images"
              : "Help us verify your identity by submitting your government-issued ID"}
          </p>
        </div>
        {editMode && (
          <Button
            type="button"
            variant="danger"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Message */}
      {message && <MessageBanner message={message} />}

      {/* Step Indicator - Only show for new uploads */}
      {!editMode && <StepIndicator currentStep={step} canSubmit={canSubmit} />}

      {/* Edit Note */}
      {editMode && (
        <div className={styles.editNote}>
          <p>
            <strong>Note:</strong> Upload new images only if you want to change
            your ID. You can also just update the ID type without changing images.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className={styles.form}>
        {(step === 1 || editMode) && (
          <div className={styles.stepContent}>
            {/* ID Type Selection */}
            <IdTypeSelector
              value={idType}
              onChange={onIdTypeChange}
              required={true}
            />

            {/* Front of ID */}
            <ImageUploadField
              type="front"
              preview={previews.front}
              currentImageUrl={
                editMode && existingId
                  ? getImageUrl(existingId.id_front_url)
                  : undefined
              }
              onChange={(file) => onFileChange(file, "front")}
              required={!editMode}
              editMode={editMode}
            />

            {/* Back of ID */}
            <ImageUploadField
              type="back"
              preview={previews.back}
              currentImageUrl={
                editMode && existingId
                  ? getImageUrl(existingId.id_back_url)
                  : undefined
              }
              onChange={(file) => onFileChange(file, "back")}
              required={!editMode}
              editMode={editMode}
            />

            {editMode ? (
              // In edit mode, show selfie on same page and save button
              <>
                <ImageUploadField
                  type="selfie"
                  preview={previews.selfie}
                  currentImageUrl={
                    existingId
                      ? getImageUrl(existingId.selfie_with_id_url)
                      : undefined
                  }
                  onChange={(file) => onFileChange(file, "selfie")}
                  required={false}
                  editMode={editMode}
                />

                <div className={styles.buttonGroup}>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={!canSubmit || submitting}
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            ) : (
              // New upload mode - show next button
              <div className={styles.buttonGroup}>
                <Button
                  type="button"
                  variant="primary"
                  disabled={!canProceedStep1}
                  onClick={() => onStepChange(2)}
                >
                  Next: Upload Selfie with ID →
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && !editMode && (
          <div className={styles.stepContent}>
            {/* Selfie */}
            <ImageUploadField
              type="selfie"
              preview={previews.selfie}
              onChange={(file) => onFileChange(file, "selfie")}
              required={true}
              editMode={false}
            />

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="primary"
                onClick={() => onStepChange(1)}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Instructions - Only show for new uploads */}
      {!editMode && <Instructions />}
    </div>
  );
}
