// src/app/(user)/job-opportunities/[companyId]/components/application/ResumePreviewTab.tsx
"use client";
import React, { useState } from "react";
import UserProfile from "@/app/(user)/profile/components/UserProfile";
import jobStyle from "../../JobsOfCompany.module.css";

interface ResumePreviewTabProps {
  hasApplied: boolean;
  onContinueToExam: () => void;
  onEditResume?: () => void;
}

const ResumePreviewTab: React.FC<ResumePreviewTabProps> = ({
  hasApplied,
  onContinueToExam,
  onEditResume,
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <>
      <div className={`${jobStyle.applicantDetail}`}>
        {/* Edit Icon - Top Right */}
        <button
          className={jobStyle.resumeEditIcon}
          onClick={onEditResume}
          title="Edit Resume"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "1.25rem", height: "1.25rem" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </button>

        {/* Resume Preview with Enlarge functionality */}
        <div
          className={jobStyle.applicantDetailResume}
          onClick={() => setIsEnlarged(true)}
          style={{ cursor: "pointer" }}
          title="Click to enlarge"
        >
          <UserProfile />
        </div>

        {/* Continue Button - Only show if not applied */}
        {!hasApplied && (
          <button
            className={jobStyle.continueArrowButton}
            onClick={onContinueToExam}
            title="Continue to Pre-Screening"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}

        {hasApplied && (
          <div className={jobStyle.applicationSubmittedBadge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "1.25rem", height: "1.25rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Application Submitted</span>
          </div>
        )}
      </div>

      {/* Enlarged Resume Modal */}
      {isEnlarged && (
        <div
          className={jobStyle.enlargedResumeOverlay}
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className={jobStyle.enlargedResumeContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={jobStyle.enlargedCloseButton}
              onClick={() => setIsEnlarged(false)}
              aria-label="Close enlarged view"
            >
              ✕
            </button>
            <button
              className={jobStyle.enlargedEditIcon}
              onClick={() => {
                setIsEnlarged(false);
                onEditResume?.();
              }}
              title="Edit Resume"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                style={{ width: "1.25rem", height: "1.25rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <div className={jobStyle.enlargedResumeWrapper}>
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumePreviewTab;
