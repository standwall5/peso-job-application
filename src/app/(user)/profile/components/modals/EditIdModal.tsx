"use client";
import React, { useState } from "react";
import styles from "./EditIdModal.module.css";
import Button from "@/components/Button";
import { uploadApplicantID } from "@/lib/db/services/applicant-id.service";

interface EditIdModalProps {
  currentIdType: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ID_TYPES = [
  "National ID (PhilSys)",
  "Driver's License",
  "Passport",
  "SSS ID",
  "UMID",
  "PRC ID",
  "Postal ID",
  "Voter's ID",
  "Senior Citizen ID",
  "PWD ID",
];

export const EditIdModal: React.FC<EditIdModalProps> = ({
  currentIdType,
  onClose,
  onSuccess,
}) => {
  const [idType, setIdType] = useState(currentIdType);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "selfie",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG or PNG)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "front") {
        setFrontFile(file);
        setFrontPreview(result);
      } else if (type === "back") {
        setBackFile(file);
        setBackPreview(result);
      } else {
        setSelfieFile(file);
        setSelfiePreview(result);
      }
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all files are uploaded
    if (!frontFile || !backFile || !selfieFile) {
      setError("Please upload all required images");
      return;
    }

    if (!idType) {
      setError("Please select an ID type");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("idType", idType);
      formData.append("frontFile", frontFile);
      formData.append("backFile", backFile);
      formData.append("selfieFile", selfieFile);

      const result = await uploadApplicantID(formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to update ID. Please try again.");
      }
    } catch (err) {
      console.error("Error updating ID:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (type: "front" | "back" | "selfie") => {
    if (type === "front") {
      setFrontFile(null);
      setFrontPreview(null);
    } else if (type === "back") {
      setBackFile(null);
      setBackPreview(null);
    } else {
      setSelfieFile(null);
      setSelfiePreview(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Update Verified ID</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBanner}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* ID Type Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="idType">
              ID Type <span className={styles.required}>*</span>
            </label>
            <select
              id="idType"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select ID Type</option>
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* File Uploads */}
          <div className={styles.uploadsGrid}>
            {/* Front of ID */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                Front of ID <span className={styles.required}>*</span>
              </label>
              {frontPreview ? (
                <div className={styles.previewContainer}>
                  <img
                    src={frontPreview}
                    alt="Front of ID preview"
                    className={styles.preview}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeFile("front")}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, "front")}
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadContent}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.uploadIcon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className={styles.uploadText}>Upload Front</span>
                    <span className={styles.uploadHint}>
                      JPG or PNG, max 5MB
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Back of ID */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                Back of ID <span className={styles.required}>*</span>
              </label>
              {backPreview ? (
                <div className={styles.previewContainer}>
                  <img
                    src={backPreview}
                    alt="Back of ID preview"
                    className={styles.preview}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeFile("back")}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, "back")}
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadContent}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.uploadIcon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className={styles.uploadText}>Upload Back</span>
                    <span className={styles.uploadHint}>
                      JPG or PNG, max 5MB
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Selfie with ID */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                Selfie with ID <span className={styles.required}>*</span>
              </label>
              {selfiePreview ? (
                <div className={styles.previewContainer}>
                  <img
                    src={selfiePreview}
                    alt="Selfie with ID preview"
                    className={styles.preview}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeFile("selfie")}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, "selfie")}
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadContent}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.uploadIcon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className={styles.uploadText}>Upload Selfie</span>
                    <span className={styles.uploadHint}>
                      JPG or PNG, max 5MB
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.infoIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div>
              <strong>Important:</strong> Make sure your ID images are clear and
              readable. The selfie should show your face clearly along with the
              ID.
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="warning"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={uploading}>
              {uploading ? "Updating..." : "Update ID"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
