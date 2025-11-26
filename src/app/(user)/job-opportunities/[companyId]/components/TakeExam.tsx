"use client";

import React, { useState, useMemo } from "react";
import examStyles from "@/app/admin/company-profiles/components/Exams.module.css";
import styles from "./TakeExam.module.css";
import Button from "@/components/Button";

// Answer type: can be a single choice ID, multiple choice IDs, or text
type ExamAnswer = number | number[] | string;

// Exam Interface
export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

// Question Interface
export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: Choice[];
}

// Choice Interface
export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
}

interface TakeExamProps {
  exam: Exam;
  onSubmit?: (answers: Record<number, ExamAnswer>) => void;
  onClose?: () => void;
}

const TakeExam: React.FC<TakeExamProps> = ({ exam, onSubmit, onClose }) => {
  const [answers, setAnswers] = useState<Record<number, ExamAnswer>>({});

  // Count answered questions
  const answeredCount = useMemo(() => {
    return Object.keys(answers).filter((key) => {
      const answer = answers[parseInt(key)];
      if (Array.isArray(answer)) return answer.length > 0;
      if (typeof answer === "string") return answer.trim().length > 0;
      return answer !== undefined && answer !== null;
    }).length;
  }, [answers]);

  const handleMultipleChoiceChange = (questionId: number, choiceId: number) => {
    setAnswers({ ...answers, [questionId]: choiceId });
  };

  const handleCheckboxChange = (questionId: number, choiceId: number) => {
    const currentAnswers = (answers[questionId] as number[]) || [];
    if (currentAnswers.includes(choiceId)) {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((id) => id !== choiceId),
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, choiceId],
      });
    }
  };

  const handleParagraphChange = (questionId: number, text: string) => {
    setAnswers({ ...answers, [questionId]: text });
  };

  const handleSubmitExam = () => {
    if (onSubmit) {
      onSubmit(answers);
    }
  };

  return (
    <div>
      <div className={examStyles.header}>
        <div className={styles.examHeader}>
          <h2 className={styles.examTitle}>{exam.title}</h2>
          <p className={styles.examDescription}>{exam.description}</p>
        </div>

        {/* Progress Indicator */}
        <div className={styles.questionProgress}>
          <span>📝</span>
          <span>
            Answered: <strong>{answeredCount}</strong> of{" "}
            <strong>{exam.questions.length}</strong> questions
          </span>
          <span className={styles.answerCount}>
            {Math.round((answeredCount / exam.questions.length) * 100)}%
          </span>
        </div>
      </div>

      <div className={examStyles.modalContent}>
        {exam.questions && exam.questions.length > 0 ? (
          exam.questions.map((question) => (
            <div key={question.id} className={examStyles.questionBlock}>
              <div className={examStyles.questionHeader}>
                <div className={examStyles.questionText}>
                  <h4>
                    <span style={{ color: "#f97316" }}>
                      {question.position}.{" "}
                    </span>
                    {question.question_text}
                  </h4>
                </div>
              </div>

              {/* Multiple Choice */}
              {question.question_type === "multiple-choice" && (
                <div className={styles.choicesContainer}>
                  {question.choices.map((choice) => {
                    const isSelected = answers[question.id] === choice.id;
                    return (
                      <label
                        key={choice.id}
                        className={`${styles.choiceLabel} ${
                          isSelected ? styles.choiceSelected : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={choice.id}
                          checked={isSelected}
                          onChange={() =>
                            handleMultipleChoiceChange(question.id, choice.id)
                          }
                          className={styles.choiceInput}
                        />
                        <span
                          className={`${styles.choiceText} ${
                            isSelected ? styles.choiceSelectedText : ""
                          }`}
                        >
                          {choice.choice_text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Checkboxes */}
              {question.question_type === "checkboxes" && (
                <div className={styles.choicesContainer}>
                  {question.choices.map((choice) => {
                    const isSelected = (
                      answers[question.id] as number[]
                    )?.includes(choice.id);
                    return (
                      <label
                        key={choice.id}
                        className={`${styles.choiceLabel} ${
                          isSelected ? styles.choiceSelected : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() =>
                            handleCheckboxChange(question.id, choice.id)
                          }
                          className={styles.choiceInput}
                        />
                        <span
                          className={`${styles.choiceText} ${
                            isSelected ? styles.choiceSelectedText : ""
                          }`}
                        >
                          {choice.choice_text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Paragraph */}
              {question.question_type === "paragraph" && (
                <div className={styles.paragraphContainer}>
                  <textarea
                    value={(answers[question.id] as string) || ""}
                    onChange={(e) =>
                      handleParagraphChange(question.id, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    rows={5}
                    className={styles.paragraphInput}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noQuestions}>
            <div className={styles.noQuestionsIcon}>📋</div>
            <p>No questions available for this exam.</p>
          </div>
        )}
      </div>

      <div className={styles.buttonContainer}>
        {onClose && (
          <Button variant="primary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button variant="success" onClick={handleSubmitExam}>
          Submit Exam ({answeredCount}/{exam.questions.length})
        </Button>
      </div>
    </div>
  );
};

export default TakeExam;
