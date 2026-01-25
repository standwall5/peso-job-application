// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./ViewIdSection.module.css";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";
import LoadingSpinner from "@/components/LoadingSpinner";

export const ViewIdSection: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async () => {
    // Prevent redundant fetches if already fetched successfully
    if (hasFetched && !loading) {
      return;
    }

    setLoading(true);
    try {
      const verificationResponse = await fetch("/api/user/verification-status");

      if (verificationResponse.ok) {
        const data = await verificationResponse.json();
        setIsVerified(data.id_verified || false);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [hasFetched, loading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !hasFetched) {
    return (
      <div className={styles.container}>
        <LoadingSpinner message="Loading verification status..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <VerifiedIdManager
        showSubmitButton={false}
        readOnly={false}
        isVerified={isVerified}
        onIdUploaded={() => {
          setHasFetched(false);
          fetchData();
        }}
        hideSummary={false}
      />
    </div>
  );
};
