import React, { useState } from "react";
import styles from "./PostJobsModal.module.css";
import Modal from "./Modal";
import { Exam as ExamType } from "./Exam";
import ExamList from "./ExamList";

interface Companies {
  id: number;
  name: string;
  location: string;
  industry: string;
  website: string;
  logo: string;
  contact_email: string;
  description: string;
  totalManpower: number;
  jobs: {
    id: number;
    company_id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  }[];
  totalJobsPosted: number;
  totalJobsAllCompanies: number;
}

interface Jobs {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface PostJobsModalProps {
  company: Companies;
  job: Jobs;
  exams: ExamType[];
  fetchExams: () => void;
  onClose?: () => void;
}

const PostJobsModal: React.FC<PostJobsModalProps> = ({
  company,
  job,
  onClose,
  exams,
  fetchExams,
}) => {
  // Track which exam is selected for this job
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const handleExamSelect = (examId: number) => {
    setSelectedExamId(examId);
    // You can also update the job object or make an API call here if needed
  };

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <span>
          <img src={company.logo} alt={company.name} />
          <h2>{company.name}</h2>
        </span>
        <span>Edit Job</span>
      </div>
      <div className={styles.modalContent}>
        <div className={styles.jobContainer}>
          <form>
            <label htmlFor="poa">Place of Assignment</label>
            <input
              id="poa"
              type="text"
              defaultValue={job.place_of_assignment}
            />

            <label htmlFor="title">Job Title</label>
            <input id="title" type="text" defaultValue={job.title} />

            <label htmlFor="gender">Gender</label>
            <select id="gender" defaultValue={job.sex}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Any">Any</option>
            </select>

            <label htmlFor="education">Education</label>
            <select id="education" defaultValue={job.education}>
              <option value="Senior High School or Graduate">
                Senior High School or Graduate
              </option>
              <option value="College Graduate">College Graduate</option>
              <option value="Any">Any</option>
            </select>

            <label htmlFor="eligibility">Eligibility</label>
            <select id="eligibility" defaultValue={job.eligibility}>
              <option value="With or without experience">
                With or without experience
              </option>
              <option value="Experienced">Experienced</option>
            </select>

            <button type="submit">Post Job</button>
          </form>
        </div>
        <div className={styles.exam}>
          <h3>Exams</h3>
          <ExamList
            exams={exams}
            selectedExamId={selectedExamId}
            onSelect={(exam) => setSelectedExamId(exam.id)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PostJobsModal;
