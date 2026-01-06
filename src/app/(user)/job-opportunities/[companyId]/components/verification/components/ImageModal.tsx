// Image modal component
import React from "react";
import { SelectedImage } from "../types";
import styles from "../VerifiedIdUpload.module.css";

interface ImageModalProps {
  image: SelectedImage;
  onClose: () => void;
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <img
          src={image.url}
          alt={`${image.type} view`}
          className={styles.modalImage}
        />
      </div>
    </div>
  );
}
