// src/app/(user)/profile/components/sections/ApplicationsSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "../Profile.module.css";
import { Job, UserApplication } from "../../types/profile.types";
import ApplicationModal from "@/app/(user)/job-opportunities/[companyId]/components/application/ApplicationModal";
import { useExam } from "@/app/(user)/job-opportunities/[companyId]/hooks/useExam";
import { useApplicationProgress } from "@/app/(user)/job-opportunities/[companyId]/hooks/useApplicationProgress";
import { useToast } from "@/app/(user)/job-opportunities/[companyId]/hooks/useToast";
import Toast from "@/components/toast/Toast";
import { Job as JobOpportunityJob } from "@/app/(user)/job-opportunities/[companyId]/types/job.types";

interface ApplicationsSectionProps {
  jobs: Job[];
  userApplications: UserApplication[];
}

export const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({
  jobs,
  userApplications,
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);

  // Use hooks for modal functionality
  const { toast, showToast, hideToast } = useToast();
  const { applicationProgress, fetchProgress } = useApplicationProgress();
  const {
    examData,
    loadingExam,
    examAttempt,
    loadingAttempt,
    fetchExam,
    fetchExamAttempt,
    handleExamSubmit,
    resetExamData,
  } = useExam();

  // Fetch progress on mount
  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getApplicationDate = (jobId: number) =>
    userApplications.find((app) => app.job_id === jobId);

  const filteredJobs = jobs.filter((job) =>
    userApplications.some((app) => app.job_id === job.id),
  );

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    resetExamData();

    // Get application ID for this job
    const application = userApplications.find((app) => app.job_id === job.id);
    setSelectedApplicationId(application?.id || null);

    // Fetch exam data if available
    if (job.exam_id) {
      fetchExam(job.exam_id);
      fetchExamAttempt(job.id, job.exam_id);
    }
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setSelectedApplicationId(null);
    resetExamData();
  };

  const handleExamSubmitWrapper = async (
    answers: Record<number, number | number[] | string>,
  ) => {
    if (!selectedJob?.exam_id || !selectedJob?.id) {
      showToast("Error", "Job or exam information is missing");
      return;
    }

    try {
      const result = await handleExamSubmit(
        selectedJob.exam_id,
        selectedJob.id,
        answers,
      );

      if (result.success) {
        let message = "";
        if (result.autoGradedCount > 0) {
          if (result.score !== null) {
            message += `Auto-graded score: ${result.score}% (${result.correctCount}/${result.autoGradedCount} correct)\n`;
          }
        }
        if (result.paragraphCount > 0) {
          message += `${result.paragraphCount} paragraph question(s) pending admin review.`;
        }
        if (!message) {
          message = "Your answers have been submitted successfully!";
        }
        showToast("Pre-Screening Submitted! 🎉", message.trim());
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast(
        "Exam Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleFetchExamAttempt = () => {
    if (selectedJob?.id && selectedJob?.exam_id) {
      fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
    }
  };

  // Convert profile Job to JobOpportunityJob for modal
  const convertToModalJob = (job: Job): JobOpportunityJob => ({
    id: job.id,
    title: job.title,
    description: job.description,
    place_of_assignment: job.place_of_assignment,
    sex: job.sex,
    education: job.education,
    eligibility: job.eligibility,
    posted_date: job.posted_date,
    exam_id: job.exam_id,
    companies: {
      name: job.companies.name,
      logo: job.companies.logo,
    },
  });

  const jobCards = filteredJobs.map((job) => {
    const application = getApplicationDate(job.id);
    const applicationDate = application?.applied_date
      ? new Date(application.applied_date)
      : null;

    const formattedDate =
      applicationDate && !isNaN(applicationDate.getTime())
        ? applicationDate.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "No application date";

    return (
      <div
        key={job.id}
        className={`${styles.jobCard}`}
        onClick={() => handleJobClick(job)}
        style={{ cursor: "pointer" }}
      >
        <div className={`${styles.jobCompany}`}>
          <img
            src={job.companies.logo || "/assets/images/default_profile.png"}
            alt={job.companies.name + " logo"}
            className={styles.companyLogo}
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
            }}
          />
          <span>{job.companies?.name}</span>
          <span>{job.title}</span>
        </div>
        <div className={styles.jobDetails}>
          <span>{formattedDate}</span>
          <span
            className={`${styles.status} ${
              application?.status === "Pending" ? styles.pending : ""
            } ${application?.status === "Referred" ? styles.referred : ""}`}
          >
            {application?.status === "Pending" ? (
              <>
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {application.status}
              </>
            ) : application?.status === "Referred" ? (
              <>
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
                {application.status}
              </>
            ) : null}
          </span>
        </div>
      </div>
    );
  });

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="var(--accent)"
            style={{ width: "1.75rem", height: "1.75rem" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            My Applications
          </h2>
        </div>
        <div
          style={{
            height: "3px",
            background: "var(--accent)",
            borderRadius: "2px",
            width: "100%",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div
          className={styles.appliedJobs}
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          {jobCards}
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          job={convertToModalJob(selectedJob)}
          hasApplied={true}
          progress={applicationProgress[selectedJob.id]}
          applicationId={selectedApplicationId}
          onClose={handleCloseModal}
          onContinueToExam={() => {
            showToast("Note", "You have already applied to this job.");
          }}
          onIdUploaded={() => {
            showToast("Note", "You have already applied to this job.");
          }}
          onSubmitFinalApplication={() => {
            showToast("Note", "You have already applied to this job.");
          }}
        />
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        title={toast.title}
        message={toast.message}
      />
    </>
  );
};
