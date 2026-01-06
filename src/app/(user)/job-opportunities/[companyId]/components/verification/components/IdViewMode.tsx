// View mode component - displays existing ID
import React from "react";
import Button from "@/components/Button";
import { ApplicantIDData } from "@/lib/db/services/applicant-id.service";
import { Message, SelectedImage } from "../types";
import { getImageUrl, formatUploadDate } from "../utils";
import { MessageBanner } from "./MessageBanner";
import { ImageViewCard } from "./ImageViewCard";
import { ImageModal } from "./ImageModal";
import styles from "../VerifiedIdUpload.module.css";

interface IdViewModeProps {
  existingId: ApplicantIDData;
  message: Message | null;
  selectedImage: SelectedImage | null;
  showSubmitButton: boolean;
  onEdit: () => void;
  onImageClick: (type: "front" | "back" | "selfie", path: string) => void;
  onCloseModal: () => void;
  onSubmitFinalApplication?: () => void;
}

export function IdViewMode({
  existingId,
  message,
  selectedImage,
  showSubmitButton,
  onEdit,
  onImageClick,
  onCloseModal,
  onSubmitFinalApplication,
}: IdViewModeProps) {
  return (
    <>
      <div className={styles.container}>
        {/* Header with Edit Button */}
        <div className={styles.viewHeader}>
          <div>
            <h2 className={styles.title}>Your Verified Government ID</h2>
            <p className={styles.subtitle}>
              ID Type: <strong>{existingId.id_type}</strong>
            </p>
            {existingId.uploaded_at && (
              <p className={styles.uploadDate}>
                Uploaded: {formatUploadDate(existingId.uploaded_at)}
              </p>
            )}
          </div>
          <Button type="button" variant="primary" onClick={onEdit}>
            Edit ID
          </Button>
        </div>

        {/* Message */}
        {message && <MessageBanner message={message} />}

        {/* Image Grid - View Mode */}
        <div className={styles.viewGrid}>
          <ImageViewCard
            type="front"
            imageUrl={getImageUrl(existingId.id_front_url)}
            onClick={() => onImageClick("front", existingId.id_front_url)}
          />
          <ImageViewCard
            type="back"
            imageUrl={getImageUrl(existingId.id_back_url)}
            onClick={() => onImageClick("back", existingId.id_back_url)}
          />
          <ImageViewCard
            type="selfie"
            imageUrl={getImageUrl(existingId.selfie_with_id_url)}
            onClick={() => onImageClick("selfie", existingId.selfie_with_id_url)}
          />
        </div>

        {/* Submit Application Button */}
        {showSubmitButton && onSubmitFinalApplication && (
          <div className={styles.submitSection}>
            <div className={styles.submitInfo}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.checkIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3>Ready to Submit!</h3>
                <p>Your ID is verified and ready for this application.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="success"
              onClick={onSubmitFinalApplication}
            >
              Submit Final Application
            </Button>
          </div>
        )}
      </div>

      {/* Image Enlarge Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={onCloseModal} />
      )}
    </>
  );
}
