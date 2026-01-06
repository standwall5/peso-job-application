// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "./ViewIdSection.module.css";
import Button from "@/components/Button";
import {
  getMyID,
  ApplicantIDData,
} from "@/lib/db/services/applicant-id.service";
import BlocksWave from "@/components/BlocksWave";
import { EditIdModal } from "../modals/EditIdModal";

export const ViewIdSection: React.FC = () => {
  const [idData, setIdData] = useState<ApplicantIDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    type: "front" | "back" | "selfie";
    url: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchIdData();
  }, []);

  const fetchIdData = async () => {
    try {
      setLoading(true);
      const data = await getMyID();
      setIdData(data);
    } catch (error) {
      console.error("Error fetching ID data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    return `/api/verified-id/view?path=${encodeURIComponent(path)}`;
  };

  const handleImageClick = (
    type: "front" | "back" | "selfie",
    path: string,
  ) => {
    setSelectedImage({ type, url: getImageUrl(path) });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleEditSuccess = () => {
    fetchIdData();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <BlocksWave />
      </div>
    );
  }

  if (!idData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.emptyIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
            />
          </svg>
          <h3>No ID Uploaded</h3>
          <p>
            You haven&apos;t uploaded a verified ID yet. Upload your ID when
            applying for jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h2>Verified Government ID</h2>
              <p className={styles.subtitle}>
                ID Type: <strong>{idData.id_type}</strong>
              </p>
              {idData.uploaded_at && (
                <p className={styles.uploadDate}>
                  Uploaded:{" "}
                  {new Date(idData.uploaded_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            <Button variant="primary" onClick={() => setShowEditModal(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  marginRight: "0.5rem",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Edit ID
            </Button>
          </div>
        </div>

        <div className={styles.imageGrid}>
          {/* Front of ID */}
          <div className={styles.imageCard}>
            <div className={styles.imageLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.labelIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                />
              </svg>
              Front of ID
            </div>
            <div
              className={styles.imageWrapper}
              onClick={() => handleImageClick("front", idData.id_front_url)}
            >
              <img
                src={getImageUrl(idData.id_front_url)}
                alt="Front of ID"
                className={styles.idImage}
              />
              <div className={styles.imageOverlay}>
                <span>Click to enlarge</span>
              </div>
            </div>
          </div>

          {/* Back of ID */}
          <div className={styles.imageCard}>
            <div className={styles.imageLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.labelIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                />
              </svg>
              Back of ID
            </div>
            <div
              className={styles.imageWrapper}
              onClick={() => handleImageClick("back", idData.id_back_url)}
            >
              <img
                src={getImageUrl(idData.id_back_url)}
                alt="Back of ID"
                className={styles.idImage}
              />
              <div className={styles.imageOverlay}>
                <span>Click to enlarge</span>
              </div>
            </div>
          </div>

          {/* Selfie with ID */}
          <div className={styles.imageCard}>
            <div className={styles.imageLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.labelIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Selfie with ID
            </div>
            <div
              className={styles.imageWrapper}
              onClick={() =>
                handleImageClick("selfie", idData.selfie_with_id_url)
              }
            >
              <img
                src={getImageUrl(idData.selfie_with_id_url)}
                alt="Selfie with ID"
                className={styles.idImage}
              />
              <div className={styles.imageOverlay}>
                <span>Click to enlarge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit ID Modal */}
      {showEditModal && (
        <EditIdModal
          currentIdType={idData.id_type}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={`${selectedImage.type} view`}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </>
  );
};
