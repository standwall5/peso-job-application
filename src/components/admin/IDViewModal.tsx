"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import styles from "./IDViewModal.module.css";

interface IDViewModalProps {
  applicantId: number;
  applicantName: string;
  applicationId?: number;
  onClose: () => void;
}

export default function IDViewModal({
  applicantId,
  applicantName,
  applicationId,
  onClose,
}: IDViewModalProps) {
  const [currentView, setCurrentView] = useState<"front" | "back" | "selfie">(
    "front",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);

  // Prevent right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.imageContainer}`)) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+P, PrintScreen, etc.
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "p" || e.key === "S" || e.key === "P")
      ) {
        e.preventDefault();
        alert("Saving or printing is disabled for security reasons.");
        return false;
      }
      // Prevent PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        alert("Screenshots are disabled for security reasons.");
        return false;
      }
    };

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent Escape key from closing (optional - remove if you want ESC to close)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [onClose]);

  // Reset loading state when switching tabs
  useEffect(() => {
    setLoading(true);
    setError(null);
    setImageKey((prev) => prev + 1);
  }, [currentView]);

  const imageUrl = `/api/admin/view-id?applicantId=${applicantId}&imageType=${currentView}${applicationId ? `&applicationId=${applicationId}` : ""}&t=${imageKey}`;

  const getTabLabel = (type: "front" | "back" | "selfie") => {
    switch (type) {
      case "front":
        return "📄 Front ID";
      case "back":
        return "📄 Back ID";
      case "selfie":
        return "🤳 Selfie with ID";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className={styles.header}>
          <h2>ID Verification - {applicantName}</h2>
          <p className={styles.warning}>
            This document is confidential and watermarked. Unauthorized
            distribution is prohibited.
          </p>
        </div>

        <div className={styles.tabs}>
          {(["front", "back", "selfie"] as const).map((type) => (
            <button
              key={type}
              className={`${styles.tab} ${currentView === type ? styles.activeTab : ""}`}
              onClick={() => setCurrentView(type)}
              aria-label={`View ${type} ID`}
            >
              {getTabLabel(type)}
            </button>
          ))}
        </div>

        <div className={styles.imageContainer}>
          {loading && (
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
              <p>Loading image securely...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              <p>❌ {error}</p>
            </div>
          )}
          <img
            key={imageKey}
            src={imageUrl}
            alt={`${currentView} ID`}
            className={styles.idImage}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError("Failed to load image. Please try again.");
            }}
            draggable={false}
            style={{
              userSelect: "none",
              pointerEvents: "none",
              display: loading || error ? "none" : "block",
            }}
          />
          {!loading && !error && (
            <div className={styles.watermarkOverlay}>CONFIDENTIAL</div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            This view is logged for security and audit purposes. Access
            timestamp and administrator details are recorded.
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
