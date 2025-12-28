// src/app/(auth)/signup/components/sections/TermsSection.tsx
import React, { useState } from "react";
import styles from "../SignUp.module.css";
import { FieldError } from "../fields";
import { TermsModal } from "../TermsModal";

interface TermsSectionProps {
  acceptTerms: boolean;
  onAcceptTermsChange: (checked: boolean) => void;
  error?: string;
}

export const TermsSection: React.FC<TermsSectionProps> = ({
  acceptTerms,
  onAcceptTermsChange,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAcceptFromModal = () => {
    onAcceptTermsChange(true);
  };

  return (
    <>
      <TermsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleAcceptFromModal}
      />

      <div className={styles.termsSection}>
        <div className={styles.termsSectionHeader}>
          <h3>Terms and Conditions</h3>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={styles.expandTermsButton}
            title="View in fullscreen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
        <div className={styles.termsText}>
          <p>
            <strong>
              By registering for this system, I agree to the following terms and
              conditions:
            </strong>
          </p>
          <p>
            <strong>1.</strong> I understand that the information I provide will
            be used solely for employment-related purposes, including job
            matching, referrals, and verification by authorized personnel.
          </p>
          <p>
            <strong>2.</strong> I consent to the processing of my personal data
            in accordance with the Data Privacy Act of 2012 and the
            organization&apos;s data protection policies.
          </p>
          <p>
            <strong>3.</strong> I acknowledge that all information provided is
            accurate and complete to the best of my knowledge.
          </p>
          <p>
            <strong>4.</strong> I understand that false or misleading
            information may result in the rejection of my application or
            termination of my account.
          </p>
          <p>
            <strong>5.</strong> I agree to receive notifications and updates
            related to job opportunities and my application status.
          </p>
          <p>
            <strong>6.</strong> I understand that my personal data will be
            stored securely and will only be shared with potential employers
            with my consent.
          </p>
          <p>
            <strong>7.</strong> I have the right to access, correct, or delete
            my personal data at any time by contacting the system administrator.
          </p>
        </div>
        <label className={styles.termsCheckbox}>
          <input
            type="checkbox"
            name="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => onAcceptTermsChange(e.target.checked)}
            required
            className={error ? styles.errorInput : ""}
          />
          <span>Accept Terms and Conditions</span>
        </label>
        <FieldError error={error} />
      </div>
    </>
  );
};
