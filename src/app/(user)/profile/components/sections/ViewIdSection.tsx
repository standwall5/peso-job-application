// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "./ViewIdSection.module.css";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";

export const ViewIdSection: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const verificationResponse = await fetch("/api/user/verification-status");

      if (verificationResponse.ok) {
        const data = await verificationResponse.json();
        setIsVerified(data.id_verified || false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className={styles.container}>
      <VerifiedIdManager
        showSubmitButton={false}
        readOnly={false}
        isVerified={isVerified}
        onIdUploaded={fetchData}
        hideSummary={false}
      />
    </div>
  );
};
