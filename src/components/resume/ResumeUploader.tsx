"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import styles from "./ResumeUploader.module.css";
import {
  extractTextFromFile,
  parseResumeText,
  validateParsedResume,
  ParsedResumeData,
} from "@/lib/utils/resume-parser";

interface ResumeUploaderProps {
  onParsedData: (data: ParsedResumeData) => void;
  onUploadComplete?: (resumeUrl: string) => void;
  onClose: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onParsedData,
  onUploadComplete,
  onClose,
}) => {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [parsingStatus, setParsingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent body scroll when modal is open and ensure component is mounted
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setError(null);
    setSuccess(null);
    setWarnings([]);
    setOcrProgress(0);
    setParsing(true);

    try {
      // Check if file is an image
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        setParsingStatus("Extracting text from image using OCR...");
      } else {
        setParsingStatus("Extracting text from document...");
      }

      // Extract and parse text from file
      const text = await extractTextFromFile(file);

      setParsingStatus("Analyzing resume structure...");
      const parsed = parseResumeText(text);

      // Validate parsed data
      const validation = validateParsedResume(parsed);

      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        setParsing(false);
        return;
      }

      if (validation.warnings.length > 0) {
        setWarnings(validation.warnings);
      }

      setParsedData(parsed);
      setParsing(false);
      setSuccess(
        "Resume parsed successfully! Review the extracted data below.",
      );
    } catch (err) {
      console.error("Error parsing resume:", err);
      setError(err instanceof Error ? err.message : "Failed to parse resume");
      setParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleConfirmAndUpload = async () => {
    if (!parsedData || !uploadedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Upload file to Supabase Storage
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload resume");
      }

      const uploadData = await uploadResponse.json();

      // Pass parsed data to parent
      onParsedData(parsedData);

      // Call upload complete callback if provided
      if (onUploadComplete) {
        onUploadComplete(uploadData.resumeUrl);
      }

      setSuccess("Resume uploaded and data extracted successfully!");

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setParsedData(null);
    setUploadedFile(null);
    setError(null);
    setSuccess(null);
    setWarnings([]);
  };

  // Don't render until mounted (client-side only)
  if (!mounted) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.uploaderContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.uploaderHeader}>
          <h2>Upload Resume</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.uploaderBody}>
          {!parsedData ? (
            <>
              <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${parsing ? styles.dropzoneDisabled : ""}`}
              >
                <input {...getInputProps()} disabled={parsing} />

                {parsing ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>{parsingStatus || "Processing resume..."}</p>
                    {ocrProgress > 0 && ocrProgress < 100 && (
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
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
                    <h3>
                      {isDragActive
                        ? "Drop your resume here"
                        : "Drag & drop your resume"}
                    </h3>
                    <p>or click to browse</p>
                    <span className={styles.fileTypes}>
                      PDF, DOCX, JPG, PNG (Max 10MB)
                    </span>
                  </>
                )}
              </div>

              <div className={styles.infoBox}>
                <h4>📄 Supported Formats</h4>
                <ul>
                  <li>
                    <strong>PDF</strong> - Recommended for best results
                  </li>
                  <li>
                    <strong>DOCX</strong> - Microsoft Word documents
                  </li>
                  <li>
                    <strong>Images</strong> - JPG, PNG (OCR processing)
                  </li>
                </ul>
                <p className={styles.tip}>
                  <strong>💡 Tip:</strong> For best results, use a
                  well-formatted resume with clear section headings (Education,
                  Work Experience, Skills, etc.)
                </p>
              </div>
            </>
          ) : (
            <div className={styles.parsedDataPreview}>
              <h3>✓ Resume Parsed Successfully</h3>
              <p className={styles.reviewText}>
                Review the extracted information below. You can edit all fields
                after confirmation.
              </p>

              <div className={styles.previewGrid}>
                {parsedData.name && (
                  <div className={styles.previewField}>
                    <label>Name:</label>
                    <span>{parsedData.name}</span>
                  </div>
                )}

                {parsedData.email && (
                  <div className={styles.previewField}>
                    <label>Email:</label>
                    <span>{parsedData.email}</span>
                  </div>
                )}

                {parsedData.phone && (
                  <div className={styles.previewField}>
                    <label>Phone:</label>
                    <span>{parsedData.phone}</span>
                  </div>
                )}

                {parsedData.education && (
                  <div className={styles.previewField}>
                    <label>Education:</label>
                    <span>
                      {parsedData.education.degree &&
                        `${parsedData.education.degree} - `}
                      {parsedData.education.school}
                    </span>
                  </div>
                )}

                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div className={styles.previewField}>
                    <label>Skills ({parsedData.skills.length}):</label>
                    <span className={styles.skillsList}>
                      {parsedData.skills.slice(0, 5).join(", ")}
                      {parsedData.skills.length > 5 &&
                        ` +${parsedData.skills.length - 5} more`}
                    </span>
                  </div>
                )}

                {parsedData.work_experiences &&
                  parsedData.work_experiences.length > 0 && (
                    <div className={styles.previewField}>
                      <label>Work Experience:</label>
                      <span>
                        {parsedData.work_experiences.length} position(s) found
                      </span>
                    </div>
                  )}
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={uploading}
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleConfirmAndUpload}
                  className={styles.confirmButton}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Uploading...
                    </>
                  ) : (
                    "Confirm & Apply Data"
                  )}
                </button>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className={styles.warningBox}>
              <h4>⚠️ Warnings</h4>
              <ul>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              <strong>Success:</strong> {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using portal at document body level
  return createPortal(modalContent, document.body);
};
