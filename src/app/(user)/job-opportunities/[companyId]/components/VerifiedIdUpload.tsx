// peso-job-application/src/app/(user)/job-opportunities/[companyId]/components/VerifiedIdUpload.tsx
import React, { useState } from "react";
import Button from "@/components/Button";
import styles from "./VerifiedIdUpload.module.css";

const idTypes = [
  "PhilHealth",
  "UMID",
  "Driver's License",
  "Passport",
  "Voter's ID",
  "PRC ID",
  "SSS",
  "TIN",
  "Postal ID",
  "Other",
];

export default function VerifiedIdUpload({
  jobId,
  onSubmitted,
}: {
  jobId: number;
  onSubmitted?: () => void;
}) {
  const [idType, setIdType] = useState("");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{
    front?: string;
    back?: string;
    selfie?: string;
  }>({});
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Preview images
  const handleFileChange = (file: File, type: "front" | "back" | "selfie") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview((prev) => ({ ...prev, [type]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
    if (type === "front") setIdFront(file);
    if (type === "back") setIdBack(file);
    if (type === "selfie") setSelfie(file);
  };

  const canProceedStep1 = !!idFront && !!idBack && !!idType;
  const canSubmit = !!idFront && !!idBack && !!selfie && !!idType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jobId", String(jobId));
    formData.append("idType", idType);
    formData.append("idFront", idFront!);
    formData.append("idBack", idBack!);
    formData.append("selfie", selfie!);

    try {
      const res = await fetch("/api/verified-id/submit", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setSubmitting(false);
      if (result.success) {
        setMessage({
          text: "ID submitted successfully! Pending review.",
          type: "success",
        });
        if (onSubmitted) onSubmitted();
      } else {
        setMessage({
          text: result.error || "Submission failed.",
          type: "error",
        });
      }
    } catch (error) {
      setSubmitting(false);
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Verified Government ID Submission</h2>
        <p className={styles.subtitle}>
          Help us verify your identity by submitting your government-issued ID
        </p>
      </div>

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <div
          className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ""}`}
        >
          <div className={styles.stepCircle}>{step > 1 ? "✓" : "1"}</div>
          <span className={styles.stepLabel}>Upload ID</span>
        </div>
        <div className={styles.stepLine}></div>
        <div
          className={`${styles.stepItem} ${step >= 2 ? styles.stepActive : ""}`}
        >
          <div className={styles.stepCircle}>{canSubmit ? "✓" : "2"}</div>
          <span className={styles.stepLabel}>Selfie with ID</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {step === 1 && (
          <div className={styles.stepContent}>
            {/* ID Type Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>ID Type</span>
                <span className={styles.required}>*</span>
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                required
                className={styles.select}
              >
                <option value="">Select your ID type</option>
                {idTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Front of ID */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Front of ID</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileChange(e.target.files[0], "front")
                  }
                  required
                  className={styles.fileInput}
                  id="front-upload"
                />
                <label htmlFor="front-upload" className={styles.uploadLabel}>
                  {preview.front ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={preview.front}
                        alt="Front Preview"
                        className={styles.previewImage}
                      />
                      <div className={styles.changeOverlay}>
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg
                        className={styles.uploadIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className={styles.uploadText}>
                        Click to upload front of ID
                      </p>
                      <p className={styles.uploadHint}>PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Back of ID */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Back of ID</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileChange(e.target.files[0], "back")
                  }
                  required
                  className={styles.fileInput}
                  id="back-upload"
                />
                <label htmlFor="back-upload" className={styles.uploadLabel}>
                  {preview.back ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={preview.back}
                        alt="Back Preview"
                        className={styles.previewImage}
                      />
                      <div className={styles.changeOverlay}>
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg
                        className={styles.uploadIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className={styles.uploadText}>
                        Click to upload back of ID
                      </p>
                      <p className={styles.uploadHint}>PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="primary"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Next: Upload Selfie with ID →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            {/* Selfie */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Selfie with ID</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileChange(e.target.files[0], "selfie")
                  }
                  required
                  className={styles.fileInput}
                  id="selfie-upload"
                />
                <label htmlFor="selfie-upload" className={styles.uploadLabel}>
                  {preview.selfie ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={preview.selfie}
                        alt="Selfie Preview"
                        className={styles.previewImage}
                      />
                      <div className={styles.changeOverlay}>
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg
                        className={styles.uploadIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <p className={styles.uploadText}>
                        Click to upload selfie
                      </p>
                      <p className={styles.uploadHint}>
                        Hold your ID next to your face
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(1)}
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

      {/* Message */}
      {message && (
        <div
          className={`${styles.message} ${message.type === "success" ? styles.messageSuccess : styles.messageError}`}
        >
          <div className={styles.messageIcon}>
            {message.type === "success" ? "✓" : "!"}
          </div>
          <p className={styles.messageText}>{message.text}</p>
        </div>
      )}

      {/* Instructions */}
      <div className={styles.instructions}>
        <h3 className={styles.instructionsTitle}>📋 Important Instructions</h3>
        <ul className={styles.instructionsList}>
          <li>
            Upload clear, high-quality images of the front and back of your
            valid government-issued ID
          </li>
          <li>
            Take a selfie holding the same ID next to your face with both your
            face and the ID clearly visible
          </li>
          <li>Ensure all text on your ID is readable and not blurred</li>
          <li>
            Only image files (PNG, JPG, JPEG) are accepted, up to 10MB each
          </li>
          <li>
            Your information will be kept secure and used only for verification
            purposes
          </li>
        </ul>
      </div>
    </div>
  );
}
