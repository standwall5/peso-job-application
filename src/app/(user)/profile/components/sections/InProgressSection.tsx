// src/app/(user)/profile/components/sections/InProgressSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "../Profile.module.css";
import inProgressStyles from "./InProgressSection.module.css";
import BlocksWave from "@/components/BlocksWave";
import Button from "@/components/Button";
import { Job } from "../../types/profile.types";
import ApplicationModal from "@/app/(user)/job-opportunities/[companyId]/components/application/ApplicationModal";
import { useExam } from "@/app/(user)/job-opportunities/[companyId]/hooks/useExam";
import { useApplicationProgress } from "@/app/(user)/job-opportunities/[companyId]/hooks/useApplicationProgress";
import { useToast } from "@/app/(user)/job-opportunities/[companyId]/hooks/useToast";
import { useUserApplications } from "@/app/(user)/job-opportunities/[companyId]/hooks/useUserApplications";
import Toast from "@/components/toast/Toast";
import { Job as JobOpportunityJob } from "@/app/(user)/job-opportunities/[companyId]/types/job.types";

interface InProgressSectionProps {
  jobs: Job[];
  userApplicationIds: number[];
}

export const InProgressSection: React.FC<InProgressSectionProps> = ({
  jobs,
  userApplicationIds,
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inProgressJobs, setInProgressJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
  const { submitFinalApplication } = useUserApplications();

  // Fetch progress on mount
  useEffect(() => {
    loadInProgressJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInProgressJobs = async () => {
    setLoading(true);
    await fetchProgress();

    // Filter jobs that have progress but are not fully applied
    const progressJobs = jobs.filter((job) => {
      const hasProgress = applicationProgress[job.id];
      const hasApplied = userApplicationIds.includes(job.id);
      return hasProgress && !hasApplied;
    });

    setInProgressJobs(progressJobs);
    setLoading(false);
  };

  const getProgress = (jobId: number) => {
    const progress = applicationProgress[jobId];
    if (!progress) return { completed: 0, total: 3 };

    let completed = 0;
    if (progress.resume_viewed) completed++;
    if (progress.exam_completed) completed++;
    if (progress.verified_id_uploaded) completed++;

    return { completed, total: 3 };
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    resetExamData();

    // Fetch exam data if available
    if (job.exam_id) {
      fetchExam(job.exam_id);
      fetchExamAttempt(job.id, job.exam_id);
    }
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
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
        if (result.autoGradedCount > 0 && result.score !== null) {
          message += `Auto-graded score: ${result.score}% (${result.correctCount}/${result.autoGradedCount} correct)\n`;
        }
        if (result.paragraphCount > 0) {
          message += `${result.paragraphCount} paragraph question(s) pending admin review.`;
        }
        if (!message) {
          message = "Your exam has been submitted successfully!";
        }
        showToast("Exam Submitted! 🎉", message.trim());
        loadInProgressJobs();
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast(
        "Exam Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleSubmitFinalApplication = async () => {
    if (!selectedJob) return;

    try {
      await submitFinalApplication(selectedJob.id);
      showToast(
        "Application Submitted! 🎉",
        "Your application has been successfully submitted.",
      );
      setSelectedJob(null);
      loadInProgressJobs();
    } catch (error) {
      console.error("Error submitting application:", error);
      showToast(
        "Submission Failed",
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

  if (loading) {
    return <BlocksWave />;
  }

  if (inProgressJobs.length === 0) {
    return (
      <div className={inProgressStyles.emptyState}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={inProgressStyles.emptyIcon}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
        <h3>No Applications in Progress</h3>
        <p>
          You don&apos;t have any incomplete applications. Start applying for
          jobs to see them here!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.appliedJobs}>
        {inProgressJobs.map((job) => {
          const progress = getProgress(job.id);
          const percentComplete = (progress.completed / progress.total) * 100;

          return (
            <div
              key={job.id}
              className={`${styles.jobCard}`}
              onClick={() => handleJobClick(job)}
              style={{ cursor: "pointer" }}
            >
              <div className={`${styles.jobCompany}`}>
                <img
                  src={
                    job.companies.logo || "/assets/images/default_profile.png"
                  }
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
                <div className={inProgressStyles.progressInfo}>
                  <span className={inProgressStyles.progressText}>
                    {progress.completed} of {progress.total} steps completed
                  </span>
                  <div className={inProgressStyles.progressBar}>
                    <div
                      className={inProgressStyles.progressFill}
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  style={{ marginTop: "0.5rem", width: "100%" }}
                >
                  Continue Application
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          job={convertToModalJob(selectedJob)}
          hasApplied={false}
          examData={examData}
          loadingExam={loadingExam}
          examAttempt={examAttempt}
          loadingAttempt={loadingAttempt}
          progress={applicationProgress[selectedJob.id]}
          onClose={handleCloseModal}
          onExamSubmit={handleExamSubmitWrapper}
          onContinueToExam={() => {}}
          onIdUploaded={() => {
            showToast("ID Uploaded", "Your ID has been uploaded successfully!");
            loadInProgressJobs();
          }}
          onSubmitFinalApplication={handleSubmitFinalApplication}
          onFetchExamAttempt={handleFetchExamAttempt}
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
