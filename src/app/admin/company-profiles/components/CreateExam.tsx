"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import styles from "./Exams.module.css";

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
  correct_text?: string; // For paragraph questions
}

// Choice Interface
export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
  is_correct?: boolean; // Mark if this choice is correct
}

interface CreateExamProps {
  onClose?: (saved?: boolean) => void;
  exam: Exam;
}

const CreateExam: React.FC<CreateExamProps> = ({ exam, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>(exam.questions || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [title, setTitle] = useState<string>(exam.title || "");
  const [description, setDescription] = useState<string>(
    exam.description || "",
  );

  if (!exam) return null;

  // Handler to add a new question/section
  const handleAddSection = () => {
    const newQuestion: Question = {
      id: Date.now(), // temp id
      exam_id: exam.id,
      question_text: "",
      question_type: "",
      position: questions.length + 1,
      choices: [],
    };
    setQuestions([...questions, newQuestion]);
    setHasUnsavedChanges(true);
  };

  // Handler for selecting question type
  const handleSelectType = (questionId: number, type: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              question_type: type,
              choices:
                type === "paragraph"
                  ? []
                  : q.choices.length > 0
                    ? q.choices
                    : [
                        {
                          id: Date.now(),
                          question_id: questionId,
                          choice_text: "",
                          position: 1,
                          is_correct: false,
                        },
                      ],
              correct_text: type === "paragraph" ? "" : undefined,
            }
          : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler for editing question text
  const handleQuestionTextChange = (questionId: number, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, question_text: text } : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler for editing choice text
  const handleChoiceTextChange = (
    questionId: number,
    choiceId: number,
    text: string,
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.map((c) =>
                c.id === choiceId ? { ...c, choice_text: text } : c,
              ),
            }
          : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler to mark/unmark a choice as correct
  const handleToggleCorrectChoice = (questionId: number, choiceId: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        // For multiple-choice, only one can be correct
        if (q.question_type === "multiple-choice") {
          return {
            ...q,
            choices: q.choices.map((c) => ({
              ...c,
              is_correct: c.id === choiceId,
            })),
          };
        }

        // For checkboxes, multiple can be correct
        if (q.question_type === "checkboxes") {
          return {
            ...q,
            choices: q.choices.map((c) =>
              c.id === choiceId ? { ...c, is_correct: !c.is_correct } : c,
            ),
          };
        }

        return q;
      }),
    );
    setHasUnsavedChanges(true);
  };

  // Handler for paragraph correct text
  const handleCorrectTextChange = (questionId: number, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correct_text: text } : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler to add a choice
  const handleAddChoice = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: [
                ...q.choices,
                {
                  id: Date.now(),
                  question_id: questionId,
                  choice_text: "",
                  position: q.choices.length + 1,
                  is_correct: false,
                },
              ],
            }
          : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler to remove a choice
  const handleRemoveChoice = (questionId: number, choiceId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.filter((c) => c.id !== choiceId),
            }
          : q,
      ),
    );
    setHasUnsavedChanges(true);
  };

  // Handler to upload exam
  const handleUploadExam = async () => {
    // Validate that each question has at least one correct answer
    for (const question of questions) {
      if (!question.question_text.trim()) {
        alert(`Question ${question.position} is missing text.`);
        return;
      }

      if (
        question.question_type === "multiple-choice" ||
        question.question_type === "checkboxes"
      ) {
        if (question.choices.length === 0) {
          alert(`Question ${question.position} needs at least one choice.`);
          return;
        }

        const hasCorrect = question.choices.some((c) => c.is_correct);
        if (!hasCorrect) {
          alert(
            `Question ${question.position} needs at least one correct answer marked.`,
          );
          return;
        }
      }

      if (question.question_type === "paragraph") {
        if (!question.correct_text?.trim()) {
          alert(`Question ${question.position} needs a correct text answer.`);
          return;
        }
      }
    }

    const examToUpload: Exam = {
      ...exam,
      title,
      description,
      questions,
    };

    const method = exam.id ? "PUT" : "POST";
    try {
      const response = await fetch("/api/exams", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examToUpload),
      });
      if (response.ok) {
        setHasUnsavedChanges(false);
        if (onClose) onClose(true); // <-- pass true for success
      } else {
        const error = await response.json();
        alert(`Failed to upload exam: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleRemoveSection = (questionId: number) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    setHasUnsavedChanges(true);
  };

  // Intercept modal close
  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmExit(true);
    } else {
      if (onClose) onClose();
    }
  };

  // Confirm exit without saving
  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    if (onClose) onClose(false); // <-- pass false for cancel/exit
  };

  // Cancel exit
  const handleCancelExit = () => {
    setShowConfirmExit(false);
  };

  return (
    <>
      <Modal onClose={handleRequestClose}>
        <div className={styles.header}>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Exam Title"
            className={styles.examTitleInput}
            style={{ fontSize: "1.5rem", fontWeight: "bold", width: "100%" }}
          />
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Exam Description"
            className={styles.examDescriptionInput}
            style={{ width: "100%", minHeight: "40px", marginTop: "0.5rem" }}
          />
        </div>
        <div className={styles.modalContent}>
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className={styles.questionBlock}>
                <div className={styles.questionHeader}>
                  <div className={styles.questionText}>
                    <h4>
                      <span>{question.position}. </span>
                      <textarea
                        value={question.question_text}
                        onChange={(e) =>
                          handleQuestionTextChange(question.id, e.target.value)
                        }
                        placeholder="Enter question text"
                        className={styles.questionInput}
                        rows={1}
                        cols={40}
                      />
                    </h4>
                  </div>

                  <button
                    onClick={() => handleRemoveSection(question.id)}
                    className={styles.removeSectionBtn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14"
                      />
                    </svg>
                  </button>
                </div>
                {/* Question type selection or input UI */}

                {!question.question_type ? (
                  <div className={styles.typeSelector}>
                    <span>Choose question type:</span>
                    <div className={styles.typeButtons}>
                      {["multiple-choice", "checkboxes", "paragraph"].map(
                        (type) => (
                          <button
                            key={type}
                            onClick={() => handleSelectType(question.id, type)}
                            className={styles.yellowBtn}
                          >
                            {type.charAt(0).toUpperCase() +
                              type.slice(1).replace("-", " ")}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <label
                        htmlFor={`type-select-${question.id}`}
                        style={{ fontWeight: "bold" }}
                      >
                        Type:
                      </label>
                      <select
                        id={`type-select-${question.id}`}
                        value={question.question_type}
                        onChange={(e) =>
                          handleSelectType(question.id, e.target.value)
                        }
                        className={styles.typeDropdown}
                        style={{}}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="checkboxes">Checkboxes</option>
                        <option value="paragraph">Paragraph</option>
                      </select>
                    </div>
                    {/* Render choices or textarea as before */}
                    {["multiple-choice", "checkboxes"].includes(
                      question.question_type,
                    ) && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#666",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {question.question_type === "multiple-choice"
                            ? "Click the star to mark the correct answer:"
                            : "Click the stars to mark all correct answers:"}
                        </p>
                        <ul>
                          {question.choices.map((choice, idx) => (
                            <li
                              key={choice.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {question.question_type === "multiple-choice" ? (
                                <input type="radio" disabled />
                              ) : (
                                <input type="checkbox" disabled />
                              )}
                              <input
                                type="text"
                                value={choice.choice_text}
                                onChange={(e) =>
                                  handleChoiceTextChange(
                                    question.id,
                                    choice.id,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Choice ${idx + 1}`}
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleCorrectChoice(
                                    question.id,
                                    choice.id,
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.5rem",
                                  padding: "0",
                                }}
                                title={
                                  choice.is_correct
                                    ? "Correct answer"
                                    : "Mark as correct"
                                }
                              >
                                {choice.is_correct ? "⭐" : "☆"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveChoice(question.id, choice.id)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#e86464",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                                disabled={question.choices.length === 1}
                                title={
                                  question.choices.length === 1
                                    ? "At least one choice required"
                                    : "Remove choice"
                                }
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => handleAddChoice(question.id)}
                          className={styles.yellowBtn}
                        >
                          + Add Choice
                        </button>
                      </div>
                    )}
                    {question.question_type === "paragraph" && (
                      <div>
                        <label
                          htmlFor={`correct-text-${question.id}`}
                          style={{
                            display: "block",
                            fontWeight: "bold",
                            marginTop: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Correct Answer:
                        </label>
                        <textarea
                          id={`correct-text-${question.id}`}
                          value={question.correct_text || ""}
                          onChange={(e) =>
                            handleCorrectTextChange(question.id, e.target.value)
                          }
                          placeholder="Enter the correct text answer here"
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            borderRadius: "0.5rem",
                            border: "1px solid #eda632",
                            padding: "0.5rem",
                            resize: "vertical",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginTop: "0.25rem",
                          }}
                        >
                          Note: Answer comparison is case-insensitive and
                          whitespace is trimmed.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noQuestions}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              No questions available
            </div>
          )}
          <div className={styles.addUploadBtn}>
            <button
              onClick={handleAddSection}
              className={`${styles.addSectionBtn} ${styles.greenBtn}`}
            >
              + Add Section/Question
            </button>
            <button onClick={handleUploadExam} className={styles.uploadBtn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>Upload Exam</span>
            </button>
          </div>
        </div>
      </Modal>
      {showConfirmExit && (
        <Modal onClose={handleCancelExit}>
          <div className={styles.confirmExitModal}>
            <h3>Exit without saving?</h3>
            <p>
              Exam progress will be lost. Are you sure you want to exit without
              saving?
            </p>
            <div className={styles.confirmExitButtons}>
              <button onClick={handleConfirmExit} className={styles.exitBtn}>
                Exit without saving
              </button>
              <button
                onClick={handleCancelExit}
                className={`${styles.cancelBtn} ${styles.yellowBtn}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CreateExam;
