// src/app/admin/company-profiles/components/ExamList.tsx

import React from "react";
import styles from "./Exams.module.css";
import { Exam } from "./Exam";

interface ExamListProps {
  exams: Exam[];
  selectedExamId?: number | null;
  onSelect: (exam: Exam) => void;
}

const ExamList: React.FC<ExamListProps> = ({
  exams,
  selectedExamId,
  onSelect,
}) => (
  <div className={styles.exams}>
    <div className={`${styles.examsCardContainer} ${styles.examList}`}>
      {exams.map((e) => (
        <div
          key={e.id}
          className={`${styles.examCard} ${selectedExamId === e.id ? styles.selectedExam : ""}`}
          style={{
            cursor: "pointer",
            border:
              selectedExamId === e.id ? "2px solid var(--accent)" : undefined,
            boxShadow:
              selectedExamId === e.id ? "0 0 0 2px var(--accent)" : undefined,
          }}
          onClick={() => onSelect(e)}
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
  </div>
);

export default ExamList;
