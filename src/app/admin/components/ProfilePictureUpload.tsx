"use client";

import React, { useState, useRef } from "react";
import styles from "./ProfilePictureUpload.module.css";

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUploadStart?: () => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPictureUrl,
  onUploadSuccess,
  onUploadStart,
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentPictureUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      setSelectedFile(null);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setError("");
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    if (onUploadStart) {
      onUploadStart();
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/profile-picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload");
      }

      setPreview(data.url);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      alert("Profile picture updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/profile-picture", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove picture");
      }

      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess("");
      }

      alert("Profile picture removed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(currentPictureUrl || null);
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className={styles.previewImage}
          />
        ) : (
          <div className={styles.placeholder}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.placeholderIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className={styles.fileInput}
          disabled={uploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.button}
          disabled={uploading}
        >
          {preview ? "Change Picture" : "Upload Picture"}
        </button>

        {selectedFile && (
          <>
            <button
              onClick={handleUpload}
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>

            <button
              onClick={handleCancel}
              className={`${styles.button} ${styles.buttonSecondary}`}
              disabled={uploading}
            >
              Cancel
            </button>
          </>
        )}

        {preview && !selectedFile && (
          <button
            onClick={handleRemove}
            className={`${styles.button} ${styles.buttonDanger}`}
            disabled={uploading}
          >
            Remove
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        Accepted formats: JPG, PNG, WebP. Max size: 5MB.
      </p>
    </div>
  );
};
