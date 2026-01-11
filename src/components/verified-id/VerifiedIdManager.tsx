"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./VerifiedIdManager.module.css";
import Button from "@/components/Button";
import {
  getMyID,
  uploadApplicantID,
  ApplicantIDData,
} from "@/lib/db/services/applicant-id.service";

interface VerifiedIdManagerProps {
  showSubmitButton?: boolean;
  onSubmitFinalApplication?: () => void;
  onIdUploaded?: () => void;
  readOnly?: boolean;
  applicationId?: number;
  jobId?: number;
  hasApplied?: boolean;
}

const ID_TYPES = [
  "PhilSys (National ID)",
  "ePhilSys (Digital ID)",
  "DRIVER'S LICENSE",
  "PASSPORT",
  "SSS ID",
  "UMID",
  "PhilHealth ID",
  "TIN ID",
  "POSTAL ID",
  "VOTER'S ID",
  "PRC ID",
  "PWD ID",
  "SENIOR CITIZEN ID",
];

const VerifiedIdManager: React.FC<VerifiedIdManagerProps> = ({
  showSubmitButton = false,
  onSubmitFinalApplication,
  onIdUploaded,
  readOnly = false,
  applicationId,
  jobId, // Reserved for future use (e.g., fetching job-specific ID requirements)
  hasApplied = false,
}) => {
  const [selectedIdType, setSelectedIdType] = useState<string>(
    "PhilSys (National ID)",
  );
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingId, setExistingId] = useState<ApplicantIDData | null>(null);

  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);
  const selfieInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadExistingId();
  }, []);

  useEffect(() => {
    // Load ID when dropdown changes
    loadIdForType(selectedIdType);
  }, [selectedIdType]);

  const loadExistingId = async () => {
    try {
      setLoading(true);
      const data = await getMyID();
      if (data) {
        setExistingId(data);
        setSelectedIdType(data.id_type);
        // Load existing images
        setFrontPreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.id_front_url)}`,
        );
        setBackPreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.id_back_url)}`,
        );
        setSelfiePreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.selfie_with_id_url)}`,
        );
      }
    } catch (error) {
      console.error("Error loading ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadIdForType = async (idType: string) => {
    try {
      const data = await getMyID(idType);
      if (data && data.id_type === idType) {
        setExistingId(data);
        // Load existing images
        setFrontPreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.id_front_url)}`,
        );
        setBackPreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.id_back_url)}`,
        );
        setSelfiePreview(
          `/api/verified-id/view?path=${encodeURIComponent(data.selfie_with_id_url)}`,
        );
      } else {
        // No ID of this type exists yet
        setExistingId(null);
        setFrontPreview(null);
        setBackPreview(null);
        setSelfiePreview(null);
        setFrontFile(null);
        setBackFile(null);
        setSelfieFile(null);
        if (frontInputRef.current) frontInputRef.current.value = "";
        if (backInputRef.current) backInputRef.current.value = "";
        if (selfieInputRef.current) selfieInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error loading ID for type:", error);
    }
  };

  const handleFileSelect = (
    type: "front" | "back" | "selfie",
    file: File | null,
  ) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === "front") {
        setFrontPreview(result);
        setFrontFile(file);
      } else if (type === "back") {
        setBackPreview(result);
        setBackFile(file);
      } else {
        setSelfiePreview(result);
        setSelfieFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (type: "front" | "back" | "selfie") => {
    if (type === "front") {
      setFrontPreview(null);
      setFrontFile(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else if (type === "back") {
      setBackPreview(null);
      setBackFile(null);
      if (backInputRef.current) backInputRef.current.value = "";
    } else {
      setSelfiePreview(null);
      setSelfieFile(null);
      if (selfieInputRef.current) selfieInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    // If no new files selected but have existing ID, no need to upload
    if (!frontFile && !backFile && !selfieFile && existingId) {
      if (onIdUploaded) onIdUploaded();
      return;
    }

    // Validate all files are present for new upload
    if (!frontFile || !backFile || !selfieFile) {
      alert(
        "Please upload all required images (Front, Back, and Selfie with ID)",
      );
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("idType", selectedIdType);
      formData.append("frontFile", frontFile);
      formData.append("backFile", backFile);
      formData.append("selfieFile", selfieFile);

      // Include applicationId if editing after submission
      if (applicationId) {
        formData.append("applicationId", applicationId.toString());
      }

      const result = await uploadApplicantID(formData);

      if (result.success) {
        setExistingId(result.data || null);
        // Clear file states but keep previews
        setFrontFile(null);
        setBackFile(null);
        setSelfieFile(null);

        // Show appropriate message
        if (hasApplied && result.changeLogged) {
          alert(
            "ID updated successfully. Admins have been notified to review your changes.",
          );
        } else if (onIdUploaded) {
          onIdUploaded();
        } else {
          alert("ID uploaded successfully!");
        }
      } else {
        alert(result.error || "Failed to upload ID");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  const renderUploadArea = (
    type: "front" | "back" | "selfie",
    preview: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    label: string,
  ) => {
    return (
      <div className={styles.uploadSection}>
        <label className={styles.uploadLabel}>{label}</label>
        <div className={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt={label} className={styles.previewImage} />
          ) : (
            <div
              className={styles.uploadPlaceholder}
              onClick={() => !readOnly && inputRef.current?.click()}
            >
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
              {type === "front" && (
                <div className={styles.placeholderIcon}>
                  <svg viewBox="0 0 100 60" className={styles.idCardIcon}>
                    <rect
                      x="10"
                      y="10"
                      width="80"
                      height="40"
                      rx="4"
                      fill="#e0e0e0"
                    />
                    <circle cx="30" cy="30" r="8" fill="#9e9e9e" />
                    <rect
                      x="45"
                      y="20"
                      width="35"
                      height="4"
                      rx="2"
                      fill="#9e9e9e"
                    />
                    <rect
                      x="45"
                      y="28"
                      width="25"
                      height="3"
                      rx="1.5"
                      fill="#9e9e9e"
                    />
                    <rect
                      x="45"
                      y="35"
                      width="30"
                      height="3"
                      rx="1.5"
                      fill="#9e9e9e"
                    />
                  </svg>
                </div>
              )}
              {type === "back" && (
                <div className={styles.placeholderIcon}>
                  <svg viewBox="0 0 100 60" className={styles.idCardIcon}>
                    <rect
                      x="10"
                      y="10"
                      width="80"
                      height="40"
                      rx="4"
                      fill="#e0e0e0"
                    />
                    <rect
                      x="15"
                      y="15"
                      width="70"
                      height="8"
                      rx="2"
                      fill="#9e9e9e"
                    />
                    <rect
                      x="15"
                      y="28"
                      width="70"
                      height="4"
                      rx="2"
                      fill="#9e9e9e"
                    />
                    <rect
                      x="15"
                      y="36"
                      width="70"
                      height="4"
                      rx="2"
                      fill="#9e9e9e"
                    />
                    <rect
                      x="15"
                      y="44"
                      width="50"
                      height="3"
                      rx="1.5"
                      fill="#9e9e9e"
                    />
                  </svg>
                </div>
              )}
              {type === "selfie" && (
                <div className={styles.placeholderIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={styles.selfieIcon}
                  >
                    <circle cx="12" cy="8" r="4" strokeWidth="2" />
                    <path
                      d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) =>
              handleFileSelect(type, e.target.files?.[0] || null)
            }
            className={styles.fileInput}
            disabled={readOnly}
          />
        </div>
        {preview && !readOnly && (
          <div className={styles.actionLinks} data-testid="action-links">
            <button
              type="button"
              className={styles.changeLink}
              onClick={() => inputRef.current?.click()}
              data-testid="change-button"
            >
              CHANGE
            </button>
            <button
              type="button"
              className={styles.removeLink}
              onClick={() => handleRemove(type)}
              data-testid="remove-button"
            >
              REMOVE
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.dropdownSection}>
        <label className={styles.label}>TYPE OF ID</label>
        <select
          className={styles.dropdown}
          value={selectedIdType}
          onChange={(e) => setSelectedIdType(e.target.value)}
          disabled={readOnly}
        >
          {ID_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.uploadGrid}>
        {renderUploadArea("front", frontPreview, frontInputRef, "FRONT SIDE")}
        {renderUploadArea("back", backPreview, backInputRef, "BACK SIDE")}
      </div>

      <div className={styles.uploadSingle}>
        {renderUploadArea(
          "selfie",
          selfiePreview,
          selfieInputRef,
          "UPLOAD SELFIE WITH ID",
        )}
      </div>

      {!readOnly && (
        <div className={styles.buttonContainer}>
          {showSubmitButton && onSubmitFinalApplication ? (
            <Button
              variant="success"
              onClick={onSubmitFinalApplication}
              disabled={
                uploading ||
                (!existingId && (!frontFile || !backFile || !selfieFile))
              }
              style={{ width: "100%" }}
            >
              {uploading ? "Uploading..." : "SUBMIT APPLICATION"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || (!frontFile && !backFile && !selfieFile)}
              style={{ width: "fit-content", marginLeft: "auto" }}
            >
              {uploading
                ? "Uploading..."
                : existingId
                  ? "UPDATE ID"
                  : "SAVE ID"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifiedIdManager;
