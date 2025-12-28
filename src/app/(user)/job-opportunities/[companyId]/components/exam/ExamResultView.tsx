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

  // Group correct answers by question
  const correctByQuestion: Record<number, CorrectAnswer[]> = {};
  correctAnswers.forEach((ca) => {
    if (!correctByQuestion[ca.question_id]) {
      correctByQuestion[ca.question_id] = [];
    }
    correctByQuestion[ca.question_id].push(ca);
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const checkIfCorrect = (questionId: number, userAnswers: ExamAnswer[]) => {
      const correct = correctByQuestion[questionId] || [];

      // For text/paragraph questions
      if (userAnswers[0]?.text_answer && correct[0]?.correct_text) {
        return (
          userAnswers[0].text_answer.trim().toLowerCase() ===
          correct[0].correct_text.trim().toLowerCase()
        );
      }

      // For choice-based questions (multiple choice or checkboxes)
      const userChoiceIds = userAnswers
        .map((a) => a.choice_id)
        .filter((id): id is number => id !== undefined)
        .sort();
      const correctChoiceIds = correct
        .map((c) => c.choice_id)
        .filter((id): id is number => id !== undefined)
        .sort();

      return (
        userChoiceIds.length === correctChoiceIds.length &&
        userChoiceIds.every((id, idx) => id === correctChoiceIds[idx])
      );
    };

    const totalQuestions = Object.keys(answersByQuestion).length;
    let correctCount = 0;

    Object.entries(answersByQuestion).forEach(
      ([questionIdStr, userAnswers]) => {
        const questionId = parseInt(questionIdStr);
        if (checkIfCorrect(questionId, userAnswers)) {
          correctCount++;
        }
      },
    );

    return {
      total: totalQuestions,
      correct: correctCount,
      incorrect: totalQuestions - correctCount,
      checkIfCorrect, // Export this function for use in the render
    };
  }, [answersByQuestion, correctByQuestion]);

  const isPassed = attempt.score >= 70;

  return (
    <div>
      {/* Score Header */}
      <div className={examStyles.header}>
        <div className={styles.scoreHeader}>
          <div className={styles.scoreInfo}>
            <h2 className={styles.scoreTitle}>Exam Results</h2>
            <p className={styles.scoreDate}>
              📅 {new Date(attempt.date_submitted).toLocaleString()}
            </p>
          </div>
          <div
            className={`${styles.scoreBadge} ${
              isPassed ? styles.scoreBadgePassed : styles.scoreBadgeFailed
            }`}
          >
            <div className={styles.scoreNumber}>{attempt.score}%</div>
            <div className={styles.scoreStatus}>
              {isPassed ? "✅ Passed" : "❌ Failed"}
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className={styles.statsSummary}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.correct}</div>
            <div className={styles.statLabel}>Correct</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.incorrect}</div>
            <div className={styles.statLabel}>Incorrect</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
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
            const correct = correctByQuestion[questionId] || [];
            const isCorrect = stats.checkIfCorrect(questionId, userAnswers);

            return (
              <div
                key={questionId}
                className={`${examStyles.questionBlock} ${
                  isCorrect
                    ? styles.questionBlockCorrect
                    : styles.questionBlockIncorrect
                }`}
              >
                <div className={examStyles.questionHeader}>
                  <div className={examStyles.questionText}>
                    <h4>
                      <span style={{ color: "#f97316" }}>
                        {question?.position || questionId}.
                      </span>{" "}
                      {question?.question_text || "Question"}
                      <span className={styles.resultIcon}>
                        {isCorrect ? "✅" : "❌"}
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Multiple Choice / Checkboxes */}
                {firstAnswer.choice_id !== undefined && question?.choices && (
                  <div className={styles.choicesContainer}>
                    {question.choices.map((choice) => {
                      const isUserAnswer = userAnswers.some(
                        (a) => a.choice_id === choice.id,
                      );
                      const isCorrectAnswer = correct.some(
                        (c) => c.choice_id === choice.id,
                      );

                      return (
                        <div
                          key={choice.id}
                          className={`${styles.choiceItem} ${
                            isCorrectAnswer
                              ? styles.choiceCorrect
                              : isUserAnswer
                                ? styles.choiceIncorrect
                                : ""
                          }`}
                        >
                          <span
                            className={`${styles.choiceText} ${
                              isUserAnswer ? styles.choiceTextBold : ""
                            }`}
                          >
                            {choice.choice_text}
                          </span>
                          {isUserAnswer && !isCorrectAnswer && (
                            <span
                              className={`${styles.choiceLabel} ${styles.choiceLabelIncorrect}`}
                            >
                              Your answer
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span
                              className={`${styles.choiceLabel} ${styles.choiceLabelCorrect}`}
                            >
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paragraph Answer - Only show for actual paragraph questions */}
                {firstAnswer.text_answer !== undefined &&
                  firstAnswer.text_answer !== null &&
                  firstAnswer.choice_id === undefined && (
                    <div className={styles.paragraphContainer}>
                      <div className={styles.userAnswerBox}>
                        <div className={styles.answerLabel}>
                          📝 Your Answer:
                        </div>
                        <p className={styles.answerText}>
                          {firstAnswer.text_answer || "(No answer provided)"}
                        </p>
                      </div>
                      {correct[0]?.correct_text && (
                        <div className={styles.correctAnswerBox}>
                          <div className={styles.answerLabel}>
                            ✅ Correct Answer:
                          </div>
                          <p className={styles.answerText}>
                            {correct[0].correct_text}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default ExamResultView;
