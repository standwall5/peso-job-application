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
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="var(--accent)"
            style={{ width: "1.75rem", height: "1.75rem" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
            />
          </svg>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Verification ID
          </h2>
        </div>
        <div
          style={{
            height: "3px",
            background: "var(--accent)",
            borderRadius: "2px",
            width: "100%",
          }}
        />
      </div>
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
