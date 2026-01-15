// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "./ViewIdSection.module.css";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";

export const ViewIdSection: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/user/verification-status");
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.id_verified || false);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {!loading && isVerified && (
        <div className={styles.verificationBadge}>
          <div className={styles.verifiedIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="10" fill="#10b981" />
              <path
                d="M6 10l3 3 5-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={styles.verifiedText}>ID Verified</span>
        </div>
      )}
      <VerifiedIdManager
        showSubmitButton={false}
        readOnly={false}
        isVerified={isVerified}
      />
    </div>
  );
};
