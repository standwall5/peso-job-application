"use client";

import React, { useMemo } from "react";
import examStyles from "@/app/admin/company-profiles/components/exam/Exams.module.css";
import styles from "./ExamResultView.module.css";
import { ExamAnswer, CorrectAnswer } from "../../types/job.types";

interface ExamResultViewProps {
  attempt: {
    score: number;
    date_submitted: string;
  };
  answers: ExamAnswer[];
  correctAnswers: CorrectAnswer[];
}

const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  answers,
  correctAnswers,
}) => {
  // Group answers by question to handle checkboxes (multiple answers per question)
  const answersByQuestion: Record<number, ExamAnswer[]> = {};
  answers.forEach((ans) => {
    if (!answersByQuestion[ans.question_id]) {
      answersByQuestion[ans.question_id] = [];
    }
    answersByQuestion[ans.question_id].push(ans);
  });

  const totalQuestions = Object.keys(answersByQuestion).length;

  return (
    <div>
      {/* Score Header */}
      <div className={examStyles.header}>
        <div className={styles.scoreHeader}>
          <div className={styles.scoreInfo}>
            <h2 className={styles.scoreTitle}>Pre-Screening Results</h2>
            <p className={styles.scoreDate}>
              📅 {new Date(attempt.date_submitted).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className={styles.statsSummary}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalQuestions}</div>
            <div className={styles.statLabel}>Total Questions</div>
          </div>
        </div>
      </div>

      {/* Questions and Answers */}
      <div className={examStyles.modalContent}>
        {Object.entries(answersByQuestion).map(
          ([questionIdStr, userAnswers]) => {
            const questionId = parseInt(questionIdStr);
            const firstAnswer = userAnswers[0];
            const question = firstAnswer.questions;

            return (
              <div key={questionId} className={examStyles.questionBlock}>
                <div className={examStyles.questionHeader}>
                  <div className={examStyles.questionText}>
                    <h4>
                      <span style={{ color: "#f97316" }}>
                        {question?.position || questionId}.
                      </span>{" "}
                      {question?.question_text || "Question"}
                    </h4>
                  </div>
                </div>

                {/* Multiple Choice / Checkboxes */}
                {firstAnswer.choice_id !== undefined && question?.choices && (
                  <div className={styles.choicesContainer}>
                    {question.choices.map((choice) => {
                      const isUserAnswer = userAnswers.some(
                        (a) => a.choice_id === choice.id
                      );

                      return (
                        <div
                          key={choice.id}
                          className={`${styles.choiceItem} ${
                            isUserAnswer ? styles.choiceSelected : ""
                          }`}
                        >
                          <span
                            className={`${styles.choiceText} ${
                              isUserAnswer ? styles.choiceTextBold : ""
                            }`}
                          >
                            {choice.choice_text}
                          </span>
                          {isUserAnswer && (
                            <span className={styles.choiceLabel}>
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paragraph Answer */}
                {firstAnswer.text_answer !== undefined &&
                  firstAnswer.text_answer !== null &&
                  !firstAnswer.choice_id && (
                    <div className={styles.paragraphContainer}>
                      <div className={styles.userAnswerBox}>
                        <div className={styles.answerLabel}>📝 Answer:</div>
                        <p className={styles.answerText}>
                          {firstAnswer.text_answer || "(No answer provided)"}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default ExamResultView;
