"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";
import BlocksWave from "@/components/BlocksWave";
import Toast from "@/components/toast/Toast";
import SortJobs from "./sort/SortJobs";
import Breadcrumbs from "@/components/Breadcrumbs";
import { createClient } from "@/utils/supabase/client";

// Custom Hooks
import { useToast } from "../hooks/useToast";
import { useApplicationProgress } from "../hooks/useApplicationProgress";
import { useExam } from "../hooks/useExam";
import { useUserApplications } from "../hooks/useUserApplications";
import { useJobs } from "../hooks/useJobs";

// Components
import JobCard from "./application/JobCard";
import ApplicationModal from "./application/ApplicationModal";

// Types
import { Job } from "../types/job.types";

interface PrivateJobListProps {
  searchParent?: string;
  onSearchChange?: (value: string) => void;
}

const PrivateJobList = ({ searchParent }: PrivateJobListProps) => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  // State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Custom Hooks
  const { toast, showToast, hideToast } = useToast();
  const {
    applicationProgress,
    loadingProgress,
    fetchProgress,
    updateProgress,
    clearProgress,
  } = useApplicationProgress();
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
  const {
    userApplications,
    loading,
    fetchUserApplications,
    submitFinalApplication,
  } = useUserApplications();
  const {
    jobs,
    search,
    setSearch,
    sortOption,
    setSortOption,
    loading: jobsLoading,
  } = useJobs(companyId);

  // Sync search with parent
  useEffect(() => {
    setSearch(searchParent || "");
  }, [searchParent, setSearch]);

  // Fetch company name and logo for header and breadcrumbs
  useEffect(() => {
    async function fetchCompanyInfo() {
      if (!companyId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("name, logo")
        .eq("id", companyId)
        .single();

      if (data && !error) {
        setCompanyName(data.name);
        setCompanyLogo(data.logo);
      }
    }

    fetchCompanyInfo();
  }, [companyId]);

  // Fetch initial data
  useEffect(() => {
    fetchUserApplications();
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    resetExamData();

    // Mark resume as viewed if not already applied
    const hasApplied = userApplications.includes(job.id);
    if (!hasApplied) {
      updateProgress(job.id, { resume_viewed: true });
    }

    // Fetch exam data if available
    if (job.exam_id) {
      fetchExam(job.exam_id);
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
        // Mark exam as completed in progress
        await updateProgress(selectedJob.id, { exam_completed: true });

        // Build the toast message
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
          message = "Your exam has been submitted successfully!";
        }

        showToast("Exam Submitted! 🎉", message.trim());
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast(
        "Exam Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleContinueToExam = () => {
    showToast("Resume Reviewed ✓", "Please proceed to take the exam.");
  };

  const handleIdUploaded = () => {
    if (selectedJob) {
      updateProgress(selectedJob.id, { verified_id_uploaded: true });
      showToast(
        "Verified ID Uploaded! ✓",
        "All steps complete. You can now submit your application.",
      );
    }
  };

  const handleSubmitFinalApplication = async () => {
    if (!selectedJob) return;

    try {
      await submitFinalApplication(selectedJob.id);
      await clearProgress(selectedJob.id);

      showToast(
        "Application Submitted! 🎉",
        "Your application has been successfully submitted.",
      );

      setSelectedJob(null);
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

  // Loading state
  if (loading || loadingProgress || jobsLoading) {
    return <BlocksWave />;
  }

  // Render job cards
  const jobCards = jobs.map((job) => {
    const hasApplied = userApplications.includes(job.id);

    return (
      <JobCard
        key={job.id}
        job={job}
        hasApplied={hasApplied}
        onClick={() => handleJobClick(job)}
      />
    );
  });

  return (
    <section className={styles.section}>
      {/* Company Header */}
      <div className={jobStyle.companyHeader}>
        <div className={jobStyle.companyHeaderContent}>
          <img
            src={companyLogo || "/assets/images/default_profile.png"}
            alt={companyName || "Company"}
            className={jobStyle.companyHeaderLogo}
          />
          <div className={jobStyle.companyHeaderInfo}>
            <h1 className={jobStyle.companyHeaderName}>
              {companyName || "Loading..."}
            </h1>
            <p className={jobStyle.companyHeaderSubtext}>Available Positions</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={jobStyle.searchContainer}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={jobStyle.searchInput}
        />
      </div>

      <div className={styles.listHeader}>
        <Breadcrumbs
          customLabels={{
            "job-opportunities": "Job Opportunities",
            "manage-admin": "Manage Admins",
            "create-admin": "Create Admin",
            "company-profiles": "Company Profiles",
            admin: "Dashboard",
            [companyId as string]: companyName || (companyId as string),
          }}
        />
        <SortJobs currentSort={sortOption} onSortChange={setSortOption} />
      </div>

      <h2 className={jobStyle.jobsTitle}>Jobs</h2>

      <div className={styles.jobList}>
        {jobCards.length > 0 ? jobCards : <p>No jobs found.</p>}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          hasApplied={userApplications.includes(selectedJob.id)}
          examData={examData}
          loadingExam={loadingExam}
          examAttempt={examAttempt}
          loadingAttempt={loadingAttempt}
          progress={applicationProgress[selectedJob.id]}
          onClose={handleCloseModal}
          onExamSubmit={handleExamSubmitWrapper}
          onContinueToExam={handleContinueToExam}
          onIdUploaded={handleIdUploaded}
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
    </section>
  );
};

export default PrivateJobList;
