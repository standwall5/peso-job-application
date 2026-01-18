"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import styles from "./IDViewModal.module.css";
import { createIdChangeNotification } from "@/lib/db/services/notification.service";

interface IDViewModalProps {
  applicantId: number;
  applicantName: string;
  applicationId?: number;
  onClose: () => void;
}

const ID_TYPES = [
  "NATIONAL ID",
  "POSTAL ID",
  "DRIVER'S LICENSE",
  "PASSPORT",
  "SSS ID",
  "UMID",
  "PhilHealth ID",
  "TIN ID",
  "VOTER'S ID",
  "PRC ID",
  "PWD ID",
  "SENIOR CITIZEN ID",
];

export default function IDViewModal({
  applicantId,
  applicantName,
  applicationId,
  onClose,
}: IDViewModalProps) {
  const [selectedIdType, setSelectedIdType] = useState<string>("NATIONAL ID");
  const [currentView, setCurrentView] = useState<"front" | "back" | "selfie">(
    "front",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [applicantId]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(
        `/api/admin/applicant-verification-status?applicantId=${applicantId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.id_verified || false);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  };

  const handleVerifyID = async () => {
    try {
      setVerifying(true);
      const response = await fetch("/api/admin/verify-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          applicationId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsVerified(true);
        alert(data.message || "ID verified successfully!");
        await fetchVerificationStatus();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to verify ID");
      }
    } catch (error) {
      console.error("Error verifying ID:", error);
      alert("An error occurred while verifying ID");
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestIDChange = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for ID update request");
      return;
    }

    try {
      setRejecting(true);
      const response = await fetch("/api/admin/request-id-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          reason: rejectionReason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "ID update request sent to applicant");
        setShowRejectForm(false);
        setRejectionReason("");
        setIsVerified(false);
        await fetchVerificationStatus();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send ID update request");
      }
    } catch (error) {
      console.error("Error requesting ID change:", error);
      alert("An error occurred while sending ID update request");
    } finally {
      setRejecting(false);
    }
  };

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

  // Reset loading state when switching tabs or ID type
  useEffect(() => {
    setLoading(true);
    setError(null);
    setImageKey((prev) => prev + 1);
  }, [currentView, selectedIdType]);

  const imageUrl = `/api/admin/view-id?applicantId=${applicantId}&imageType=${currentView}&idType=${encodeURIComponent(
    selectedIdType,
  )}${applicationId ? `&applicationId=${applicationId}` : ""}&t=${imageKey}`;

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
          <div className={styles.idTypeSelector}>
            <label htmlFor="idTypeSelect">ID Type:</label>
            <select
              id="idTypeSelect"
              value={selectedIdType}
              onChange={(e) => setSelectedIdType(e.target.value)}
              className={styles.idTypeDropdown}
            >
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tabs}>
          {(["front", "back", "selfie"] as const).map((type) => (
            <button
              key={type}
              className={`${styles.tab} ${
                currentView === type ? styles.activeTab : ""
              }`}
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
          {showRejectForm ? (
            <div className={styles.rejectForm}>
              <h3>Request ID Update</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for ID update request (e.g., 'Photo is blurry', 'ID appears expired', etc.)..."
                className={styles.reasonTextarea}
                rows={4}
              />
              <div className={styles.rejectActions}>
                <Button
                  variant="danger"
                  onClick={handleRequestIDChange}
                  disabled={rejecting || !rejectionReason.trim()}
                >
                  {rejecting ? "Sending..." : "Send Request"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  disabled={rejecting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.verificationControls}>
              {!isVerified && (
                <>
                  <Button
                    variant="success"
                    onClick={handleVerifyID}
                    disabled={verifying}
                  >
                    {verifying ? "Verifying..." : "✓ Mark ID as Verified"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectForm(true)}
                    disabled={verifying}
                  >
                    ⚠️ Request ID Update
                  </Button>
                </>
              )}
              {isVerified && (
                <div className={styles.verifiedBadge}>
                  <span className={styles.verifiedStatus}>✓ ID Verified</span>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectForm(true)}
                    size="small"
                  >
                    Request Update
                  </Button>
                </div>
              )}
            </div>
          )}
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
