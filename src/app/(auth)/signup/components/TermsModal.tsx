// src/app/(auth)/signup/components/TermsModal.tsx
import React from "react";
import styles from "./SignUp.module.css";

interface TermsModalProps {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  show,
  onClose,
  onAccept,
}) => {
  if (!show) return null;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.termsModal} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={styles.termsModalClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className={styles.termsModalHeader}>
          <h2>Terms and Conditions</h2>
        </div>

        {/* Content */}
        <div className={styles.termsModalContent}>
          <p>
            <strong>
              By registering for this system, I agree to the following terms and
              conditions:
            </strong>
          </p>

          <div className={styles.termsModalSection}>
            <p>
              <strong>1. Data Usage</strong>
            </p>
            <p>
              I understand that the information I provide will be used solely
              for employment-related purposes, including job matching,
              referrals, and verification by authorized personnel.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>2. Data Privacy Consent</strong>
            </p>
            <p>
              I consent to the processing of my personal data in accordance with
              the Data Privacy Act of 2012 and the organization&apos;s data
              protection policies.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>3. Information Accuracy</strong>
            </p>
            <p>
              I acknowledge that all information provided is accurate and
              complete to the best of my knowledge.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>4. False Information</strong>
            </p>
            <p>
              I understand that false or misleading information may result in
              the rejection of my application or termination of my account.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>5. Communication Consent</strong>
            </p>
            <p>
              I agree to receive notifications and updates related to job
              opportunities and my application status.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>6. Data Security</strong>
            </p>
            <p>
              I understand that my personal data will be stored securely and
              will only be shared with potential employers with my consent.
            </p>
          </div>

          <div className={styles.termsModalSection}>
            <p>
              <strong>7. Data Rights</strong>
            </p>
            <p>
              I have the right to access, correct, or delete my personal data at
              any time by contacting the system administrator.
            </p>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className={styles.termsModalFooter}>
          <button onClick={onClose} className={styles.termsDeclineButton}>
            Close
          </button>
          <button onClick={handleAccept} className={styles.termsAcceptButton}>
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};
