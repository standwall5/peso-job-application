"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import styles from "./IDViewModal.module.css";
import {
  XMarkIcon,
  IdentificationIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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

const rejectionReasons = [
  "Blurry image",
  "Incomplete details",
  "Expired ID",
  "Mismatched information",
  "Other",
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
  const [customReason, setCustomReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [applicantId]);

  // reload image when view changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setImageKey((prev) => prev + 1);
  }, [currentView, selectedIdType]);

  // security stuff
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.imageContainer}`)) {
        e.preventDefault();
      }
    };

    const preventSaveAndPrint = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "p" || e.key === "S" || e.key === "P")
      ) {
        e.preventDefault();
        alert("Saving or printing is disabled for security reasons.");
        return;
      }

      if (e.key === "PrintScreen") {
        e.preventDefault();
        alert("Screenshots are disabled for security reasons.");
        return;
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventSaveAndPrint);
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventSaveAndPrint);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, [onClose]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(
        `/api/admin/applicant-verification-status?applicantId=${applicantId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.id_verified || false);
      }
    } catch (err) {
      console.error("Error fetching verification status:", err);
    }
  };

  const handleVerifyID = async () => {
    setVerifying(true);

    try {
      const response = await fetch("/api/admin/verify-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          applicationId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        alert(data.message || "ID verified successfully!");
        fetchVerificationStatus();
      } else {
        alert(data.error || "Failed to verify ID");
      }
    } catch (err) {
      console.error("Error verifying ID:", err);
      alert("An error occurred while verifying ID");
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestIDChange = async () => {
    const reason =
      rejectionReason === "Other" ? customReason.trim() : rejectionReason;

    if (!reason) {
      alert("Please provide a reason for ID update request");
      return;
    }

    setRejecting(true);

    try {
      const response = await fetch("/api/admin/request-id-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          reason: reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "ID update request sent to applicant");
        setShowRejectForm(false);
        setRejectionReason("");
        setCustomReason("");
        setIsVerified(false);
        fetchVerificationStatus();
      } else {
        alert(data.error || "Failed to send ID update request");
      }
    } catch (err) {
      console.error("Error requesting ID change:", err);
      alert("An error occurred while sending ID update request");
    } finally {
      setRejecting(false);
    }
  };

  const imageUrl = `/api/admin/view-id?applicantId=${applicantId}&imageType=${currentView}&idType=${encodeURIComponent(
    selectedIdType,
  )}${applicationId ? `&applicationId=${applicationId}` : ""}&t=${imageKey}`;

  const renderTabIcon = (type: "front" | "back" | "selfie") => {
    const iconProps = {
      className: "w-5 h-5",
      style: { color: "var(--accent)" },
    };

    switch (type) {
      case "front":
        return <IdentificationIcon {...iconProps} />;
      case "back":
        return <DocumentTextIcon {...iconProps} />;
      case "selfie":
        return <UserCircleIcon {...iconProps} />;
    }
  };

  const getTabLabel = (type: "front" | "back" | "selfie") => {
    if (type === "front") return "Front ID";
    if (type === "back") return "Back ID";
    return "Selfie with ID";
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className={styles.header}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <ShieldCheckIcon
              className="w-7 h-7"
              style={{ color: "white", flexShrink: 0 }}
            />
            <h2 style={{ margin: 0 }}>ID Verification</h2>
          </div>
          <p className={styles.applicantName}>{applicantName}</p>
          <p
            className={styles.warning}
            style={{ color: "white", fontSize: "0.875rem" }}
          >
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
              {renderTabIcon(type)}
              <span>{getTabLabel(type)}</span>
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
              <ExclamationTriangleIcon
                className="w-6 h-6"
                style={{ color: "var(--danger)" }}
              />
              <p>{error}</p>
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
        </div>

        <div className={styles.footer}>
          {showRejectForm ? (
            <div className={styles.rejectForm}>
              <h3>Request ID Update</h3>
              <div className={styles.reasonSelector}>
                <label
                  htmlFor="rejection-reason"
                  className={styles.reasonLabel}
                >
                  Select reason:
                </label>
                <select
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={styles.reasonDropdown}
                >
                  <option value="">-- Select a reason --</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {rejectionReason === "Other" && (
                <div className={styles.customReasonWrapper}>
                  <label htmlFor="custom-reason" className={styles.reasonLabel}>
                    Specify reason:
                  </label>
                  <textarea
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom reason for ID update request..."
                    className={styles.reasonTextarea}
                    rows={3}
                  />
                </div>
              )}

              <div className={styles.rejectActions}>
                <Button
                  variant="danger"
                  onClick={handleRequestIDChange}
                  disabled={
                    rejecting ||
                    !rejectionReason ||
                    (rejectionReason === "Other" && !customReason.trim())
                  }
                >
                  {rejecting ? "Sending..." : "Send Request"}
                </Button>
                <Button
                  variant="warning"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                    setCustomReason("");
                  }}
                  disabled={rejecting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.verificationControls}>
              {!isVerified ? (
                <>
                  <Button
                    variant="success"
                    onClick={handleVerifyID}
                    disabled={verifying}
                  >
                    <CheckCircleIcon
                      className="w-5 h-5"
                      style={{ display: "inline", marginRight: "0.5rem" }}
                    />
                    {verifying ? "Verifying..." : "Mark ID as Verified"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectForm(true)}
                    disabled={verifying}
                  >
                    <ExclamationTriangleIcon
                      className="w-5 h-5"
                      style={{ display: "inline", marginRight: "0.5rem" }}
                    />
                    Request ID Update
                  </Button>
                </>
              ) : (
                <div className={styles.verifiedBadge}>
                  <span
                    className={styles.verifiedStatus}
                    style={{ color: "var(--accent)" }}
                  >
                    <CheckCircleIcon
                      className="w-5 h-5"
                      style={{ display: "inline", marginRight: "0.5rem" }}
                    />
                    ID Verified
                  </span>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectForm(true)}
                  >
                    Request Update
                  </Button>
                </div>
              )}
            </div>
          )}
          <p
            className={styles.disclaimer}
            style={{ fontSize: "0.8rem", opacity: 0.7 }}
          >
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
