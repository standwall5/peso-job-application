"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import styles from "./ProfilePictureUpload.module.css";

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUploadStart?: () => void;
  onFileSelected?: (file: File | null) => void;
  onUploadHandlerReady?: (
    handler: () => Promise<{ success: boolean; url?: string }>,
  ) => void;
  showSelectButton?: boolean;
  showUploadButton?: boolean;
  showRemoveButton?: boolean;
  showHint?: boolean;
  showPreview?: boolean;
  showSuccessAlerts?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPictureUrl,
  onUploadSuccess,
  onUploadStart,
  onFileSelected,
  onUploadHandlerReady,
  showSelectButton = true,
  showUploadButton = true,
  showRemoveButton = true,
  showHint = true,
  showPreview = true,
  showSuccessAlerts = true,
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentPictureUrl || null,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.95,
      );
    });
  };

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

    // Show cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setError("");
      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setPreview(croppedUrl);
      setShowCropper(false);

      // Convert blob to file for upload
      const croppedFile = new File(
        [croppedBlob],
        selectedFile?.name || "profile.jpg",
        { type: "image/jpeg" },
      );
      setSelectedFile(croppedFile);
      if (onFileSelected) {
        onFileSelected(croppedFile);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      setError("Failed to crop image");
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setSelectedFile(null);
    if (onFileSelected) {
      onFileSelected(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (): Promise<{
    success: boolean;
    url?: string;
  }> => {
    if (!selectedFile) {
      return { success: false };
    }

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload");
      }

      const data = await response.json();

      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      // Update preview with the server URL
      setPreview(data.url);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (showSuccessAlerts) {
        alert("Profile picture updated successfully!");
      }

      return { success: true, url: data.url };
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload");
      return { success: false };
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (onUploadHandlerReady) {
      onUploadHandlerReady(handleUpload);
    }
  }, [onUploadHandlerReady, handleUpload]);

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
      if (onFileSelected) {
        onFileSelected(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess("");
      }

      if (showSuccessAlerts) {
        alert("Profile picture removed successfully!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(currentPictureUrl || null);
    setSelectedFile(null);
    if (onFileSelected) {
      onFileSelected(null);
    }
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Image Cropper Modal */}
      {showCropper && imageSrc && (
        <div className={styles.cropperModal}>
          <div className={styles.cropperContainer}>
            <h3 className={styles.cropperTitle}>Crop Profile Picture</h3>
            <div className={styles.cropperWrapper}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.cropperControls}>
              <label className={styles.zoomLabel}>
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles.zoomSlider}
                />
              </label>
            </div>
            <div className={styles.cropperActions}>
              <button
                type="button"
                onClick={handleCropCancel}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Crop & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {showPreview && (
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
        )}

        <div className={styles.controls}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className={styles.fileInput}
            disabled={uploading}
          />

          {showSelectButton && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.button}
              disabled={uploading}
            >
              {preview ? "Change Picture" : "Choose Picture"}
            </button>
          )}

          {selectedFile && (
            <>
              {showUploadButton && (
                <button
                  type="button"
                  onClick={handleUpload}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}

              <button
                type="button"
                onClick={handleCancel}
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={uploading}
              >
                Cancel
              </button>
            </>
          )}

          {showRemoveButton && preview && !selectedFile && (
            <button
              type="button"
              onClick={handleRemove}
              className={`${styles.button} ${styles.buttonDanger}`}
              disabled={uploading}
            >
              Remove Picture
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showHint && (
          <p className={styles.hint}>
            Accepted formats: JPG, PNG, WebP. Max size: 5MB.
          </p>
        )}
      </div>
    </>
  );
};
