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
import { getUserSkillsAction } from "../../actions/job-opportunities.actions";
import { sortJobsBySkillMatch } from "@/lib/utils/skillMatching";

// Custom Hooks
import { useToast } from "../hooks/useToast";
import { useApplicationProgress } from "../hooks/useApplicationProgress";
import { useExam } from "../hooks/useExam";
import { useUserApplications } from "../hooks/useUserApplications";
import { useJobs } from "../hooks/useJobs";

// Components
import JobListCard from "@/components/jobs/JobListCard";
import ApplicationModal from "./application/ApplicationModal";
import ApplicationSuccessModal from "./application/ApplicationSuccessModal";
import DeployedNoticeModal from "./application/DeployedNoticeModal";

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

  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeployedModal, setShowDeployedModal] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  // Custom Hooks
  const { toast, showToast, hideToast } = useToast();
  const {
    applicationProgress,
    loadingProgress,
    fetchProgress,
    updateProgress,
    clearProgress,
  } = useApplicationProgress();
  const { fetchExam, resetExamData } = useExam();
  const {
    userApplications,
    loading,
    fetchUserApplications,
    submitFinalApplication,
  } = useUserApplications();
  const {
    jobs: rawJobs,
    search,
    setSearch,
    sortOption,
    setSortOption,
    loading: jobsLoading,
  } = useJobs(companyId);

  // Apply skill matching to jobs
  const jobs = React.useMemo(() => {
    if (sortOption === "relevance" && userSkills.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return sortJobsBySkillMatch(rawJobs as any, userSkills);
    }
    return rawJobs;
  }, [rawJobs, sortOption, userSkills]);

  // Fetch user skills
  useEffect(() => {
    async function fetchUserSkills() {
      try {
        const skills = await getUserSkillsAction();
        setUserSkills(skills);
      } catch (error) {
        console.error("Failed to fetch user skills:", error);
      }
    }
    fetchUserSkills();
  }, []);

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
      }
    }

    fetchCompanyInfo();
  }, [companyId]);

  // Fetch initial data
  useEffect(() => {
    fetchUserApplications();
    fetchProgress();

    // Check if user is deployed
    async function checkDeployedStatus() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: applicant } = await supabase
          .from("applicants")
          .select("deployed")
          .eq("auth_id", user.id)
          .single();

        if (applicant?.deployed) {
          setIsDeployed(true);
        }
      }
    }

    checkDeployedStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleJobClick = (job: Job) => {
    // Check if user is deployed
    if (isDeployed) {
      setShowDeployedModal(true);
      return;
    }

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

  const handleContinueToExam = () => {
    showToast(
      "Resume Reviewed ✓",
      "Please proceed to answer the pre-screening questions.",
    );
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

      // Close application modal and show success modal
      setSelectedJob(null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      showToast(
        "Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleChatWithAdmin = () => {
    setShowDeployedModal(false);
    // Open chat widget
    const chatButton = document.querySelector(
      "[data-chat-widget]",
    ) as HTMLElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  // Loading state
  if (loading || loadingProgress || jobsLoading) {
    return <BlocksWave />;
  }

  // Render job cards
  const jobCards = jobs.map((job) => {
    const hasApplied = userApplications.includes(job.id);
    const matchPercentage =
      sortOption === "relevance"
        ? (job as Job & { matchPercentage?: number }).matchPercentage || 0
        : 0;

    return (
      <JobListCard
        key={job.id}
        job={{ ...job, matchPercentage }}
        userSkills={userSkills}
        hasApplied={hasApplied}
        showSkillMatch={sortOption === "relevance"}
        showApplyButton={true}
        onClick={() => handleJobClick(job)}
      />
    );
  });

  return (
    <section className={styles.section}>
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
          progress={applicationProgress[selectedJob.id]}
          onClose={handleCloseModal}
          onContinueToExam={handleContinueToExam}
          onIdUploaded={handleIdUploaded}
          onSubmitFinalApplication={handleSubmitFinalApplication}
        />
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        title={toast.title}
        message={toast.message}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <ApplicationSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}

      {/* Deployed Notice Modal */}
      <DeployedNoticeModal
        isOpen={showDeployedModal}
        onClose={() => setShowDeployedModal(false)}
        onChatWithAdmin={handleChatWithAdmin}
      />
    </section>
  );
};

export default PrivateJobList;
