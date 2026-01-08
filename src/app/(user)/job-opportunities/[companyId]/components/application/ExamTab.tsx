// src/app/(user)/job-opportunities/[companyId]/components/application/ExamTab.tsx
"use client";
import React from "react";
import BlocksWave from "@/components/BlocksWave";
import TakeExam from "../exam/TakeExam";
import ExamResultView from "../exam/ExamResultView";
import { Exam } from "../../types/job.types";
import { ExamAttemptData } from "../../types/application.types";
import jobStyle from "../../JobsOfCompany.module.css";

interface ExamTabProps {
  loadingAttempt: boolean;
  loadingExam: boolean;
  examAttempt: ExamAttemptData | null;
  examData: Exam | null;
  hasApplied: boolean;
  onExamSubmit: (
    answers: Record<number, number | number[] | string>,
  ) => Promise<void>;
}

const ExamTab: React.FC<ExamTabProps> = ({
  loadingAttempt,
  loadingExam,
  examAttempt,
  examData,
  hasApplied,
  onExamSubmit,
}) => {
  if (loadingAttempt || loadingExam) {
    return (
      <div className={jobStyle.applicantDetail}>
        <BlocksWave />
      </div>
    );
  }

  // User has taken exam - show results
  if (examAttempt && examAttempt.attempt) {
    return (
      <div className={jobStyle.applicantDetail}>
        <ExamResultView
          attempt={examAttempt.attempt}
          answers={examAttempt.answers}
          correctAnswers={examAttempt.correctAnswers}
        />
      </div>
    );
  }

  // User hasn't taken exam and hasn't submitted final app - show exam form
  if (examData && !hasApplied) {
    return (
      <div className={jobStyle.applicantDetail}>
        <TakeExam exam={examData} onSubmit={onExamSubmit} />
      </div>
    );
  }

  // Final application submitted
  if (hasApplied) {
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
          <h2>✅ Application Submitted</h2>
          <p>Your application has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  // No exam available
  return (
    <div className={jobStyle.applicantDetail}>
      <div className={jobStyle.noExam}>
        <p>No pre-screening questions available for this job.</p>
      </div>
    </div>
  );
};

export default ExamTab;
