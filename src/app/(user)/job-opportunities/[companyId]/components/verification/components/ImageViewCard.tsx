// Image view card component
import React from "react";
import { ImageType, IMAGE_LABELS } from "../constants";
import styles from "../VerifiedIdUpload.module.css";

interface ImageViewCardProps {
  type: ImageType;
  imageUrl: string;
  onClick: () => void;
}

export function ImageViewCard({ type, imageUrl, onClick }: ImageViewCardProps) {
  const label = IMAGE_LABELS[type];

  return (
    <div className={styles.viewCard}>
      <div className={styles.viewLabel}>{label}</div>
      <div className={styles.viewImageWrapper} onClick={onClick}>
        <img src={imageUrl} alt={label} className={styles.viewImage} />
        <div className={styles.viewOverlay}>
          <span>Click to enlarge</span>
        </div>
      </div>
    </div>
  );
}
