// src/app/(user)/job-opportunities/[companyId]/components/application/VerifiedIdTab.tsx
"use client";
import React from "react";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";
import { ApplicationProgress } from "../../types/application.types";
import { ExamAttemptData } from "../../types/application.types";
import jobStyle from "../../JobsOfCompany.module.css";

interface VerifiedIdTabProps {
  hasApplied: boolean;
  examAttempt: ExamAttemptData | null;
  progress: ApplicationProgress | undefined;
  jobId: number;
  applicationId?: number | null;
  onIdUploaded: () => void;
  onSubmitFinalApplication: () => void;
}

const VerifiedIdTab: React.FC<VerifiedIdTabProps> = ({
  hasApplied,
  examAttempt,
  progress,
  jobId,
  applicationId,
  onIdUploaded,
  onSubmitFinalApplication,
}) => {
  // If application already submitted, still allow editing but hide submit button
  if (hasApplied) {
    return (
      <div className={jobStyle.applicantDetail}>
        {/* Warning message for submitted applications */}
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "0.5rem",
            padding: "1rem",
            margin: "1rem 1rem 1.5rem 1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#856404"
            style={{
              width: "1.5rem",
              height: "1.5rem",
              flexShrink: 0,
              marginTop: "0.125rem",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div style={{ flex: 1 }}>
            <strong
              style={{
                color: "#856404",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Application Already Submitted
            </strong>
            <p style={{ color: "#856404", margin: 0, fontSize: "0.875rem" }}>
              You can still view and update your ID if needed. Any changes will
              be logged and admins will be notified to review your application.
            </p>
          </div>
        </div>

        <VerifiedIdManager
          showSubmitButton={false}
          readOnly={false}
          hasApplied={hasApplied}
          jobId={jobId}
          applicationId={applicationId || undefined}
        />
      </div>
    );
  }

  // No exam requirement - user can submit after reviewing resume
  const canSubmit = Boolean(progress?.resume_viewed);

  return (
    <div className={jobStyle.applicantDetail}>
      {/* Always show ID manager, allow submit after resume viewed */}
      <VerifiedIdManager
        showSubmitButton={canSubmit}
        onSubmitFinalApplication={onSubmitFinalApplication}
        onIdUploaded={onIdUploaded}
        readOnly={false}
        hasApplied={false}
        jobId={jobId}
      />
    </div>
  );
};

export default VerifiedIdTab;
