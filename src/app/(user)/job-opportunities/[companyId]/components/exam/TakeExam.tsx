"use client";

import React, { useState, useMemo } from "react";
import examStyles from "@/app/admin/company-profiles/components/exam/Exams.module.css";
import styles from "./TakeExam.module.css";
import Button from "@/components/Button";
import { Exam, Question, Choice } from "../../types/job.types";

// Answer type: can be a single choice ID, multiple choice IDs, or text
type ExamAnswer = number | number[] | string;

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
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          {exam.title}
        </h2>
        {exam.description && (
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            {exam.description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {exam.questions && exam.questions.length > 0 ? (
          exam.questions.map((question, index) => (
            <div
              key={question.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    color: "#1e293b",
                    lineHeight: "1.6",
                  }}
                >
                  {index + 1}. <strong>{question.question_text}</strong>
                  {question.question_type === "paragraph" && (
                    <span style={{ color: "#94a3b8", fontWeight: "normal" }}>
                      {" "}
                      (Ano ang isang kahinaan na pinagtatrabahuhan mo at paano
                      mo ito pinapabuti?)
                    </span>
                  )}
                </h4>
              </div>

              {/* Multiple Choice */}
              {question.question_type === "multiple-choice" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {question.choices.map((choice) => {
                    const isSelected = answers[question.id] === choice.id;
                    return (
                      <label
                        key={choice.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem",
                          border: `2px solid ${isSelected ? "#7adaef" : "#e5e7eb"}`,
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#f0fdff" : "white",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={choice.id}
                          checked={isSelected}
                          onChange={() =>
                            handleMultipleChoiceChange(question.id, choice.id)
                          }
                          style={{ marginRight: "0.75rem" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: "#1e293b" }}>
                          {choice.choice_text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Checkboxes */}
              {question.question_type === "checkboxes" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {question.choices.map((choice) => {
                    const isSelected = (
                      answers[question.id] as number[]
                    )?.includes(choice.id);
                    return (
                      <label
                        key={choice.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem",
                          border: `2px solid ${isSelected ? "#7adaef" : "#e5e7eb"}`,
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#f0fdff" : "white",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() =>
                            handleCheckboxChange(question.id, choice.id)
                          }
                          style={{ marginRight: "0.75rem" }}
                        />
                        <span style={{ fontSize: "0.9rem", color: "#1e293b" }}>
                          {choice.choice_text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Paragraph */}
              {question.question_type === "paragraph" && (
                <textarea
                  value={(answers[question.id] as string) || ""}
                  onChange={(e) =>
                    handleParagraphChange(question.id, e.target.value)
                  }
                  placeholder="Type Here..."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#7adaef";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#64748b",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p>No questions available for this exam.</p>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {onClose && (
          <Button variant="primary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          variant="success"
          onClick={handleSubmitExam}
          disabled={answeredCount !== exam.questions.length}
        >
          Submit Answers ({answeredCount}/{exam.questions.length})
        </Button>
      </div>
    </div>
  );
};

export default TakeExam;
