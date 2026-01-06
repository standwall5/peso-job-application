// src/app/(user)/job-opportunities/[companyId]/components/application/VerifiedIdTab.tsx
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import VerifiedIdUpload from "../verification/VerifiedIdUpload";
import { ApplicationProgress } from "../../types/application.types";
import { ExamAttemptData } from "../../types/application.types";
import { getMyID } from "@/lib/db/services/applicant-id.service";
import BlocksWave from "@/components/BlocksWave";
import jobStyle from "../../JobsOfCompany.module.css";

interface VerifiedIdTabProps {
  jobId: number;
  hasApplied: boolean;
  examAttempt: ExamAttemptData | null;
  progress: ApplicationProgress | undefined;
  onIdUploaded: () => void;
  onSubmitFinalApplication: () => void;
  onGoToExam: () => void;
}

const VerifiedIdTab: React.FC<VerifiedIdTabProps> = ({
  jobId,
  hasApplied,
  examAttempt,
  progress,
  onIdUploaded,
  onSubmitFinalApplication,
  onGoToExam,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just a quick check, the component handles the rest
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={jobStyle.applicantDetail}>
        <BlocksWave />
      </div>
    );
  }

  // If application already submitted, show ID in view-only mode
  if (hasApplied) {
    return (
      <div className={jobStyle.applicantDetail}>
        <VerifiedIdUpload
          jobId={jobId}
          onSubmitted={onIdUploaded}
          showSubmitButton={false}
        />
      </div>
    );
  }

  // Exam not completed yet
  if (!examAttempt || !examAttempt.attempt) {
    return (
      <div className={jobStyle.applicantDetail}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            gap: "1rem",
          }}
        >
          <h2>⚠️ Exam Required</h2>
          <p>
            Please complete the exam first before uploading your Verified ID.
          </p>
          <Button variant="primary" onClick={onGoToExam}>
            Go to Exam
          </Button>
        </div>
      </div>
    );
  }

  // Exam completed - show ID upload/view/edit with submit button
  const canSubmit = progress?.exam_completed && progress?.resume_viewed;

  return (
    <div className={jobStyle.applicantDetail}>
      <VerifiedIdUpload
        jobId={jobId}
        onSubmitted={onIdUploaded}
        showSubmitButton={canSubmit}
        onSubmitFinalApplication={onSubmitFinalApplication}
      />
    </div>
  );
};

export default VerifiedIdTab;
