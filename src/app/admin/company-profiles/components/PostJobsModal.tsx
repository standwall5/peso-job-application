import React, { useState } from "react";
import styles from "./PostJobsModal.module.css";
import Modal from "./Modal";
import { Exam as ExamType } from "./Exam";
import ExamList from "./ExamList";
import Button from "@/components/Button";

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
    exam_id?: number | null;
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
  exam_id?: number | null;
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
  refetchJobs?: () => void; // Add this
}

const PostJobsModal: React.FC<PostJobsModalProps> = ({
  company,
  job,
  onClose,
  exams,
  fetchExams,
  refetchJobs,
}) => {
  // Track which exam is selected for this job
  const [selectedExamId, setSelectedExamId] = useState<number | null>(
    job?.exam_id ?? null,
  );

  console.log("PostJobsModal - selectedExamId:", selectedExamId);
  console.log("PostJobsModal - job.exam_id:", job?.exam_id);
  console.log("PostJobsModal - full job:", job);

  const handleExamSelect = (examId: number) => {
    setSelectedExamId(examId);
    // You can also update the job object or make an API call here if needed
  };

  // ######################### Handle submit for job submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const jobData = {
      company_id: company.id,
      title: formData.get("title") as string,
      description: job.description, // Or add a field if you want to edit this
      place_of_assignment: formData.get("poa") as string,
      sex: formData.get("gender") as string,
      education: formData.get("education") as string,
      eligibility: formData.get("eligibility") as string,
      exam_id: selectedExamId,
    };

    try {
      let response;
      if (job && job.id) {
        // Edit existing job
        response = await fetch(`/api/jobs?id=${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      } else {
        // Create new job
        response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save job");
      }

      if (refetchJobs) refetchJobs();

      // Optionally, you can refresh jobs/exams here
      if (onClose) onClose();
    } catch (err) {
      // Handle error (show toast, etc.)
      console.error(err);
    }
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
          <form onSubmit={handleSubmit}>
            <label htmlFor="poa">Place of Assignment</label>
            <input
              id="poa"
              type="text"
              name="poa"
              defaultValue={job.place_of_assignment}
              required
            />

            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              name="title"
              defaultValue={job.title}
              required
            />

            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" defaultValue={job.sex} required>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Any">Any</option>
            </select>

            <label htmlFor="education">Education</label>
            <select
              id="education"
              name="education"
              defaultValue={job.education}
              required
            >
              <option value="Senior High School or Graduate">
                Senior High School or Graduate
              </option>
              <option value="College Graduate">College Graduate</option>
              <option value="Any">Any</option>
            </select>

            <label htmlFor="eligibility">Eligibility</label>
            <select
              id="eligibility"
              name="eligibility"
              defaultValue={job.eligibility}
              required
            >
              <option value="With or without experience">
                With or without experience
              </option>
              <option value="Experienced">Experienced</option>
            </select>

            <Button variant="success">Post Job</Button>
          </form>
        </div>
        <div className={styles.exam}>
          {/*Selected Exam Id is tied to a certain job*/}
          {/*Need a post request that puts the job and the changes*/}
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
