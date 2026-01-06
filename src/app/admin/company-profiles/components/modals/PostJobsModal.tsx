import React, { useState, useEffect, useRef } from "react";
import styles from "./PostJobsModal.module.css";
import Modal from "./Modal";
import ConfirmCloseModal from "./ConfirmCloseModal";
import { Exam as ExamType } from "../exam/Exam";
import ExamList from "../exam/ExamList";
import Button from "@/components/Button";
import SkillsInput from "@/components/SkillsInput"; // NEW: Import SkillsInput
import { CompanyWithStats } from "../../types/company.types";

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
  skills?: string[]; // NEW: Add skills field
  companies: {
    name: string;
    logo: string | null;
  };
}

interface PostJobsModalProps {
  company: CompanyWithStats;
  job: Jobs;
  exams: ExamType[];
  fetchExams: () => void;
  onClose?: () => void;
  refetchJobs?: () => void;
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

  // NEW: Track skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    job?.skills || [],
  );

  // Track form changes
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Store initial values
  const initialValuesRef = useRef({
    title: job.title,
    poa: job.place_of_assignment,
    sex: job.sex,
    education: job.education,
    eligibility: job.eligibility,
    examId: job.exam_id ?? null,
    skills: job.skills || [], // NEW: Store initial skills
  });

  console.log("PostJobsModal - selectedExamId:", selectedExamId);
  console.log("PostJobsModal - job.exam_id:", job?.exam_id);
  console.log("PostJobsModal - full job:", job);

  // Check if form has changes
  const checkForChanges = (formData?: FormData) => {
    if (formData) {
      const currentTitle = formData.get("title") as string;
      const currentPoa = formData.get("poa") as string;
      const currentSex = formData.get("gender") as string;
      const currentEducation = formData.get("education") as string;
      const currentEligibility = formData.get("eligibility") as string;

      const hasFormChanges =
        currentTitle !== initialValuesRef.current.title ||
        currentPoa !== initialValuesRef.current.poa ||
        currentSex !== initialValuesRef.current.sex ||
        currentEducation !== initialValuesRef.current.education ||
        currentEligibility !== initialValuesRef.current.eligibility;

      const hasExamChange = selectedExamId !== initialValuesRef.current.examId;

      // NEW: Check for skills changes
      const hasSkillsChange =
        JSON.stringify(selectedSkills.sort()) !==
        JSON.stringify(initialValuesRef.current.skills.sort());

      return hasFormChanges || hasExamChange || hasSkillsChange;
    }

    // Check if exam selection or skills changed
    const hasExamChange = selectedExamId !== initialValuesRef.current.examId;
    const hasSkillsChange =
      JSON.stringify(selectedSkills.sort()) !==
      JSON.stringify(initialValuesRef.current.skills.sort());
    return hasExamChange || hasSkillsChange;
  };

  // Update hasChanges when inputs change
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    const handleInput = () => {
      const formData = new FormData(form);
      setHasChanges(checkForChanges(formData));
    };

    // Add event listeners to all form inputs
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleInput);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleInput);
      });
    };
  }, [selectedExamId, selectedSkills]); // NEW: Add selectedSkills to dependencies

  const handleExamSelect = (examId: number) => {
    setSelectedExamId(examId);
    // Check if this creates a change
    setHasChanges(examId !== initialValuesRef.current.examId);
  };

  // NEW: Handle skills change
  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    const hasSkillsChange =
      JSON.stringify(skills.sort()) !==
      JSON.stringify(initialValuesRef.current.skills.sort());
    setHasChanges(hasSkillsChange);
  };

  // Handle close with confirmation
  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      if (onClose) onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    if (onClose) onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
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
      skills: selectedSkills, // NEW: Include skills
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

      // Reset hasChanges since we successfully saved
      setHasChanges(false);

      // Close modal without confirmation
      if (onClose) onClose();
    } catch (err) {
      // Handle error (show toast, etc.)
      console.error(err);
    }
  };

  return (
    <>
      <Modal onClose={handleCloseAttempt}>
        <div className={styles.header}>
          <span>
            <img
              src={company.logo || "/assets/images/default_profile.png"}
              alt={company.name}
            />

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

              {/* NEW: Skills Input */}
              <div style={{ marginTop: "1rem" }}>
                <SkillsInput
                  skills={selectedSkills}
                  onSkillsChange={handleSkillsChange}
                  placeholder="Search and add required skills..."
                  label="Required Skills"
                  required={false}
                />
              </div>

              <Button variant="success" style={{ marginTop: "1rem" }}>
                Post Job
              </Button>
            </form>
          </div>
          <div className={styles.exam}>
            {/*Selected Exam Id is tied to a certain job*/}
            {/*Need a post request that puts the job and the changes*/}
            <h3>Exams</h3>
            <ExamList
              exams={exams}
              selectedExamId={selectedExamId}
              onSelect={(exam) => handleExamSelect(exam.id)}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      {showConfirmClose && (
        <ConfirmCloseModal
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      )}
    </>
  );
};

export default PostJobsModal;
