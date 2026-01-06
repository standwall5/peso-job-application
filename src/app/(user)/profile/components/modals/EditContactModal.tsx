"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import styles from "./EditContactModal.module.css";
import {
  requestEmailChangeAction,
  updatePhoneAction,
  updateNameAction,
} from "../../../profile/actions/contact.actions";

interface EditContactModalProps {
  show: boolean;
  type: "email" | "phone" | "name";
  currentValue: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  show,
  type,
  currentValue,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"input" | "success">("input");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      setStep("input");
      setNewValue("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (type === "email") {
        // Validate email
        if (!newValue.includes("@")) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }

        // Request email change (sends link to current email)
        const result = await requestEmailChangeAction(newValue);

        if (!result.success) {
          throw new Error(result.error || "Failed to request email change");
        }

        // Show success message
        setStep("success");
      } else if (type === "phone") {
        // Validate phone
        if (newValue.length < 10) {
          setError("Please enter a valid phone number");
          setLoading(false);
          return;
        }

        // Update phone directly
        const result = await updatePhoneAction(newValue);

        if (!result.success) {
          throw new Error(result.error || "Failed to update phone");
        }

        // Success - close and refresh
        onSuccess();
        onClose();
      } else if (type === "name") {
        // Validate name
        if (!newValue.trim()) {
          setError("Name cannot be empty");
          setLoading(false);
          return;
        }

        // Update name directly
        const result = await updateNameAction(newValue);

        if (!result.success) {
          throw new Error(result.error || "Failed to update name");
        }

        // Success - close and refresh
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const getTitle = () => {
    if (step === "success") return "Check Your Email";
    if (type === "name") return "Edit Name";
    if (type === "email") return "Change Email";
    return "Change Phone";
  };

  const getPlaceholder = () => {
    if (type === "email") return "Enter new email address";
    if (type === "phone") return "Enter new phone number";
    return "Enter new name";
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{getTitle()}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.error}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          {step === "input" ? (
            <>
              <div className={styles.currentValue}>
                <label>Current {type}:</label>
                <span>{currentValue || "Not set"}</span>
              </div>

              <div className={styles.inputGroup}>
                <label>New {type}:</label>
                <input
                  type={
                    type === "email"
                      ? "email"
                      : type === "phone"
                        ? "tel"
                        : "text"
                  }
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={getPlaceholder()}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {type === "email" && (
                <div className={styles.infoBox}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <p>
                    We&apos;ll send a confirmation link to your{" "}
                    <strong>current email</strong> to verify this change.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h4>Confirmation Email Sent!</h4>
                <p>
                  We&apos;ve sent a confirmation link to your{" "}
                  <strong>current email address</strong> (
                  <strong>{currentValue}</strong>).
                </p>
                <div className={styles.instructionsList}>
                  <div className={styles.instructionStep}>
                    <span className={styles.stepNumber}>1</span>
                    <p>
                      Check your current email inbox for a message from PESO Job
                      Application
                    </p>
                  </div>
                  <div className={styles.instructionStep}>
                    <span className={styles.stepNumber}>2</span>
                    <p>Click the confirmation link in the email</p>
                  </div>
                  <div className={styles.instructionStep}>
                    <span className={styles.stepNumber}>3</span>
                    <p>
                      After confirming, check your <strong>new email</strong> (
                      {newValue}) for a final verification link from Supabase
                    </p>
                  </div>
                  <div className={styles.instructionStep}>
                    <span className={styles.stepNumber}>4</span>
                    <p>Click the Supabase link to complete the email change</p>
                  </div>
                </div>
                <div className={styles.noteBox}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p>
                    <strong>Note:</strong> Both confirmation links expire in 1
                    hour. If you don&apos;t see the emails, check your spam
                    folder.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step === "input" ? (
            <>
              <Button variant="warning" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={loading || !newValue}
              >
                {loading
                  ? "Processing..."
                  : type === "name"
                    ? "Save"
                    : type === "email"
                      ? "Send Confirmation"
                      : "Update Phone"}
              </Button>
            </>
          ) : (
            <Button variant="success" onClick={onClose}>
              Got It
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
