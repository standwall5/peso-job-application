"use client";

import React, { useState } from "react";
import Button from "@/components/Button";
import ExamResultView from "@/app/(user)/job-opportunities/[companyId]/components/exam/ExamResultView";
import BlocksWave from "@/components/BlocksWave";
import styles from "../ManageJobseeker.module.css";
import {
  Jobseeker,
  JobApplication,
  ExamAttemptData,
} from "../../types/jobseeker.types";
import { gradeParagraphAnswer } from "@/lib/db/services/exam-grading.service";

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
  const [gradingAnswerId, setGradingAnswerId] = useState<number | null>(null);

  const handleGrade = async (answerId: number, isCorrect: boolean) => {
    if (!examAttempt) return;

    setGradingAnswerId(answerId);
    try {
      await gradeParagraphAnswer({
        answerId,
        isCorrect,
        attemptId: examAttempt.attempt.attempt_id,
      });

      // Refresh the exam attempt data
      if (onGraded) {
        onGraded();
      }
    } catch (error) {
      console.error("Failed to grade answer:", error);
      alert("Failed to grade answer. Please try again.");
    } finally {
      setGradingAnswerId(null);
    }
  };

  // Filter paragraph questions
  const paragraphAnswers: ParagraphAnswer[] =
    examAttempt?.answers.filter(
      (a): a is ParagraphAnswer => a.questions?.question_type === "paragraph",
    ) || [];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}
      >
        <button onClick={onClose} className={styles.closeBtn}>
          X
        </button>
        <h2>Exam Result</h2>
        <div className={styles.examResultContent}>
          <p>
            <strong>Applicant:</strong> {jobseeker.applicant.name}
          </p>
          <p>
            <strong>Company:</strong> {application.company.name}
          </p>
          <p>
            <strong>Position:</strong> {application.job.title}
          </p>

          {loadingAttempt ? (
            <div className={styles.scoreDisplay}>
              <BlocksWave />
            </div>
          ) : examAttempt ? (
            <>
              <div className={styles.scoreDisplay}>
                <ExamResultView
                  attempt={examAttempt.attempt}
                  answers={examAttempt.answers}
                  correctAnswers={examAttempt.correctAnswers}
                />
              </div>

              {/* Paragraph Questions Grading Section */}
              {paragraphAnswers.length > 0 && (
                <div className={styles.paragraphGradingSection}>
                  <h3>Paragraph Questions (Manual Grading)</h3>
                  {paragraphAnswers.map((answer, index) => {
                    if (!answer.answer_id) return null;

                    return (
                      <div
                        key={answer.answer_id}
                        className={styles.paragraphAnswer}
                      >
                        <p>
                          <strong>
                            Question {index + 1}:{" "}
                            {answer.questions?.question_text || "N/A"}
                          </strong>
                        </p>
                        <div className={styles.answerText}>
                          <p>
                            <em>Answer:</em>{" "}
                            {answer.text_answer || "No answer provided"}
                          </p>
                        </div>
                        <div className={styles.gradingButtons}>
                          {answer.is_correct === null ? (
                            <>
                              <Button
                                variant="success"
                                onClick={() =>
                                  handleGrade(answer.answer_id!, true)
                                }
                                disabled={gradingAnswerId === answer.answer_id}
                              >
                                {gradingAnswerId === answer.answer_id
                                  ? "Marking..."
                                  : "✓ Mark Correct"}
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleGrade(answer.answer_id!, false)
                                }
                                disabled={gradingAnswerId === answer.answer_id}
                              >
                                {gradingAnswerId === answer.answer_id
                                  ? "Marking..."
                                  : "✗ Mark Incorrect"}
                              </Button>
                            </>
                          ) : (
                            <div
                              className={
                                answer.is_correct
                                  ? styles.gradedCorrect
                                  : styles.gradedIncorrect
                              }
                            >
                              {answer.is_correct
                                ? "✓ Marked as Correct"
                                : "✗ Marked as Incorrect"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p>No exam submitted or no exam assigned to job</p>
          )}
        </div>
        <div className={styles.modalActions}>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
