// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "./ViewIdSection.module.css";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";
import {
  getMyAllIDs,
  ApplicantIDData,
} from "@/lib/db/services/applicant-id.service";

export const ViewIdSection: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allIds, setAllIds] = useState<ApplicantIDData[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [verificationResponse, idsData] = await Promise.all([
        fetch("/api/user/verification-status"),
        getMyAllIDs(),
      ]);

      if (verificationResponse.ok) {
        const data = await verificationResponse.json();
        setIsVerified(data.id_verified || false);
      }

      setAllIds(idsData);
      const verified = idsData.filter((id) => id.is_verified).length;
      setVerifiedCount(verified);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {!loading && (
        <div className={styles.verificationSummary}>
          <div className={styles.summaryHeader}>
            <h3 className={styles.summaryTitle}>ID Verification Status</h3>
            <div className={styles.verificationCounter}>
              <span className={styles.counterText}>
                {verifiedCount} / {allIds.length}
              </span>
              <span className={styles.counterLabel}>Verified</span>
            </div>
          </div>

          {allIds.length > 0 ? (
            <div className={styles.idList}>
              {allIds.map((id, index) => (
                <div
                  key={index}
                  className={`${styles.idItem} ${id.is_verified ? styles.verified : styles.pending}`}
                >
                  <div className={styles.idInfo}>
                    <span className={styles.idType}>{id.id_type}</span>
                    {id.verified_at && (
                      <span className={styles.verifiedDate}>
                        Verified on{" "}
                        {new Date(id.verified_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className={styles.idStatus}>
                    {id.is_verified ? (
                      <>
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
                        <span className={styles.statusText}>Verified</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="10" cy="10" r="10" fill="#fbbf24" />
                          <path
                            d="M10 6v4M10 14h.01"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={styles.statusText}>
                          Pending Review
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noIdsMessage}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p>
                No IDs uploaded yet. Upload your valid IDs below to get
                verified.
              </p>
            </div>
          )}
        </div>
      )}

      <VerifiedIdManager
        showSubmitButton={false}
        readOnly={false}
        isVerified={isVerified}
        onIdUploaded={fetchData}
      />
    </div>
  );
};
