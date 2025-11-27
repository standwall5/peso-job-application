"use client";

import React, { useState } from "react";
import styles from "./Exams.module.css";
import CreateExam from "./CreateExam";
import Toast from "@/components/toast/Toast";
import Button from "@/components/Button";

export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: Choice[];
}

export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
}

interface ExamProps {
  exam: Exam[];
  fetchExams: () => void;
}

const Exam: React.FC<ExamProps> = ({ exam, fetchExams }) => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <div className={styles.exams}>
      <div className={styles.examsCardContainer}>
        {exam &&
          exam.map((e) => (
            <div
              key={e.id}
              className={styles.examCard}
              onClick={() => {
                setSelectedExam(e);
                setShowModal(true);
              }}
            >
              <div className={styles.examGraphic}>
                <div></div>
                <div></div>
              </div>
              <div className={styles.examDetails}>
                <span className={styles.examTitle}>{e.title}</span>
                <span>{e.description}</span>
              </div>
            </div>
          ))}
      </div>
      <Button
        variant="primary"
        style={{ marginTop: "1rem" }}
        onClick={() => {
          setSelectedExam({
            id: Date.now(),
            title: "",
            description: "",
            questions: [],
          });
          setShowModal(true);
        }}
      >
        + Create New Exam
      </Button>

      {selectedExam && showModal && (
        <CreateExam
          exam={selectedExam}
          onClose={(saved) => {
            setShowModal(false);
            if (saved) {
              fetchExams();
              setShowToast(true);
            }
          }}
        />
      )}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        title="Success"
        message="Exam saved successfully!"
      />
    </div>
  );
};

export default Exam;
