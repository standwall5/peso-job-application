// src/app/(user)/profile/components/modals/ProfilePictureModal.tsx
import React from "react";
import Cropper from "react-easy-crop";
import Button from "@/components/Button";
import { PixelCrop } from "../../types/profile.types";

interface ProfilePictureModalProps {
  show: boolean;
  selectedFile: File | null;
  currentProfilePicUrl: string | null;
  dateNow: number;
  crop: { x: number; y: number };
  zoom: number;
  uploading: boolean;
  isDragActive: boolean;
  onClose: () => void;
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  onCropComplete: (croppedArea: unknown, croppedAreaPixels: PixelCrop) => void;
  handleCropAndUpload: () => void;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  onCancel: () => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  show,
  selectedFile,
  currentProfilePicUrl,
  dateNow,
  crop,
  zoom,
  uploading,
  isDragActive,
  onClose,
  setCrop,
  setZoom,
  onCropComplete,
  handleCropAndUpload,
  getRootProps,
  getInputProps,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 10,
          minWidth: 340,
        }}
      >
        <h3 style={{ textAlign: "center" }}>Edit Profile Picture</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!selectedFile && (
            <>
              <img
                src={
                  currentProfilePicUrl
                    ? currentProfilePicUrl + "?t=" + dateNow
                    : "/assets/images/default_profile.png"
                }
                alt="Profile"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  marginBottom: 16,
                }}
              />
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #aaa",
                  borderRadius: 8,
                  padding: 24,
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDragActive ? "#f0f0f0" : "#fafafa",
                  marginBottom: 16,
                }}
              >
                <input {...getInputProps()} />
                {isDragActive
                  ? "Drop the image here ..."
                  : "Drag & drop a new image here, or click to select"}
              </div>
            </>
          )}

          {selectedFile && (
            <>
              <div
                style={{
                  position: "relative",
                  width: 300,
                  height: 300,
                  marginBottom: 16,
                }}
              >
                <Cropper
                  image={URL.createObjectURL(selectedFile)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                  variant="primary"
                >
                  {uploading ? "Uploading..." : "Crop & Upload"}
                </Button>
                <Button
                  onClick={onCancel}
                  disabled={uploading}
                  variant="warning"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
          <Button
            style={{ marginTop: 24 }}
            onClick={onClose}
            disabled={uploading}
            variant="warning"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
