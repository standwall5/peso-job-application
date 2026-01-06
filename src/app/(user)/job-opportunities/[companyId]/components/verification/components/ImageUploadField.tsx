// Reusable image upload field component
import React from "react";
import { ImageType, IMAGE_LABELS } from "../constants";
import styles from "../VerifiedIdUpload.module.css";

interface ImageUploadFieldProps {
  type: ImageType;
  preview?: string;
  currentImageUrl?: string;
  onChange: (file: File) => void;
  required?: boolean;
  editMode?: boolean;
}

export function ImageUploadField({
  type,
  preview,
  currentImageUrl,
  onChange,
  required = true,
  editMode = false,
}: ImageUploadFieldProps) {
  const inputId = `${type}-upload`;
  const label = IMAGE_LABELS[type];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const renderUploadIcon = () => {
    if (type === "selfie") {
      return (
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
      );
    }

    return (
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
    );
  };

  const renderContent = () => {
    if (preview) {
      return (
        <div className={styles.previewContainer}>
          <img src={preview} alt={`${label} Preview`} className={styles.previewImage} />
          <div className={styles.changeOverlay}>
            <span>Click to change</span>
          </div>
        </div>
      );
    }

    if (editMode && currentImageUrl) {
      return (
        <div className={styles.previewContainer}>
          <img src={currentImageUrl} alt={`Current ${label}`} className={styles.previewImage} />
          <div className={styles.changeOverlay}>
            <span>Click to change</span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.uploadPlaceholder}>
        {renderUploadIcon()}
        <p className={styles.uploadText}>Click to upload {label.toLowerCase()}</p>
        <p className={styles.uploadHint}>
          {type === "selfie" ? "Hold your ID next to your face" : "PNG, JPG up to 10MB"}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        <span className={styles.labelText}>{label}</span>
        {required && !editMode && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.uploadArea}>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          required={required && !editMode}
          className={styles.fileInput}
          id={inputId}
        />
        <label htmlFor={inputId} className={styles.uploadLabel}>
          {renderContent()}
        </label>
      </div>
    </div>
  );
}
