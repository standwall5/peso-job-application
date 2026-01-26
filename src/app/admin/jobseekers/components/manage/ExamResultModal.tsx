"use client";

import React from "react";
import Button from "@/components/Button";
import ExamResultView from "@/app/(user)/job-opportunities/[companyId]/components/exam/ExamResultView";
import BlocksWave from "@/components/BlocksWave";
import styles from "../ManageJobseeker.module.css";
import {
  Jobseeker,
  JobApplication,
  ExamAttemptData,
} from "../../types/jobseeker.types";

interface ExamResultModalProps {
  jobseeker: Jobseeker;
  application: JobApplication;
  examAttempt: ExamAttemptData | null;
  loadingAttempt: boolean;
  onClose: () => void;
  onGraded?: () => void; // Callback to refresh data after grading
}

interface ParagraphAnswer {
  answer_id?: number;
  question_id: number;
  text_answer?: string;
  is_correct?: boolean | null;
  questions?: {
    question_text: string;
    question_type?: string;
  };
}

export default function ExamResultModal({
  jobseeker,
  application,
  examAttempt,
  loadingAttempt,
  onClose,
  onGraded,
}: ExamResultModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button onClick={onClose} className={styles.closeBtn}>
          X
        </button>
        <h2 style={{ marginBottom: "1rem" }}>Pre-screening Results</h2>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: "0.5rem",
          }}
        >
          <div className={styles.examResultContent}>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Applicant:</strong> {jobseeker.applicant.name}
              </p>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Company:</strong> {application.company?.name || "N/A"}
              </p>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Position:</strong> {application.job?.title || "N/A"}
              </p>
            </div>

            {loadingAttempt ? (
              <BlocksWave />
            ) : examAttempt ? (
              <div style={{ marginTop: "1.5rem" }}>
                <ExamResultView
                  attempt={examAttempt.attempt}
                  answers={examAttempt.answers}
                  correctAnswers={examAttempt.correctAnswers}
                />
              </div>
            ) : (
              <p>No pre-screening questions submitted or assigned to job</p>
            )}
          </div>
        </div>

        <div
          className={styles.modalActions}
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
