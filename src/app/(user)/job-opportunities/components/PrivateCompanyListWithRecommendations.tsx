"use client";
import React, { useState, useEffect } from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import panelStyles from "./PrivateCompanyListWithRecommendations.module.css";
import Link from "next/link";
import BlocksWave from "@/components/BlocksWave";
import SortCompany, { SortOption } from "./sort/SortCompany";
import { sortCompanies } from "../utils/sortCompanies";
import RecommendedJobsPanel from "./RecommendedJobsPanel";
import AllJobsSection from "./AllJobsSection";
import { getUserSkillsAction } from "../actions/job-opportunities.actions";
import ApplicationModal from "../[companyId]/components/application/ApplicationModal";
import Toast from "@/components/toast/Toast";
import { useToast } from "../[companyId]/hooks/useToast";
import { useApplicationProgress } from "../[companyId]/hooks/useApplicationProgress";
import { useExam } from "../[companyId]/hooks/useExam";
import { useUserApplications } from "../[companyId]/hooks/useUserApplications";
import { Job } from "../[companyId]/types/job.types";

interface JobWithCompanyId extends Job {
  company_id: number;
  manpower_needed: number;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  industry: string;
  location: string;
}

interface PrivateCompanyListProps {
  searchParent: string;
  onSearchChange?: (value: string) => void;
}

const PrivateCompanyListWithRecommendations = ({
  searchParent,
  onSearchChange,
}: PrivateCompanyListProps) => {
  const [jobs, setJobs] = useState<JobWithCompanyId[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParent || "");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [showExpandedRecommendations, setShowExpandedRecommendations] =
    useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // Custom Hooks for modal
  const { toast, showToast, hideToast } = useToast();
  const { applicationProgress, fetchProgress, updateProgress, clearProgress } =
    useApplicationProgress();
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
  const { userApplications, fetchUserApplications, submitFinalApplication } =
    useUserApplications();

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

  useEffect(() => {
    async function fetchAll() {
      try {
        const companiesRes = await fetch("/api/getCompanies");
        const jobsRes = await fetch("/api/getJobs");
        const companiesData = await companiesRes.json();
        const jobsData = await jobsRes.json();

        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        console.error("Fetch failed:", err);
        setCompanies([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Fetch user applications and progress
  useEffect(() => {
    fetchUserApplications();
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(search);
    }
  }, [search, onSearchChange]);

  const getJobCount = (companyId: number) =>
    jobs.filter((job) => job.company_id === companyId).length;
  const getManpowerCount = (companyId: number) =>
    jobs
      .filter((job) => job.company_id === companyId)
      .reduce((sum, job) => sum + (job.manpower_needed || 0), 0);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase()) ||
      company.location.toLowerCase().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedCompanies = sortCompanies(
    filteredCompanies,
    jobs.map((job) => ({
      id: job.id,
      company_id: job.company_id || 0,
      manpower_needed: job.manpower_needed || 0,
      posted_date: job.posted_date,
    })),
    sortOption,
  );

  const displayedCompanies = showAllCompanies
    ? sortedCompanies
    : sortedCompanies.slice(0, 8);

  // Modal handlers
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
    if (!selectedJob) return;

    await handleExamSubmit(selectedJob.id, selectedJob.exam_id || 0, answers);
    showToast("Success", "Exam submitted successfully!");
    updateProgress(selectedJob.id, { exam_completed: true });

    // Fetch exam attempt to get the score
    if (selectedJob.exam_id) {
      await fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
    }
  };

  const handleContinueToExam = () => {
    if (!selectedJob?.exam_id) return;
    fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
    updateProgress(selectedJob.id, { exam_completed: false });
  };

  const handleIdUploaded = () => {
    if (!selectedJob) return;
    updateProgress(selectedJob.id, { verified_id_uploaded: true });
  };

  const handleSubmitFinalApplication = async () => {
    if (!selectedJob) return;

    await submitFinalApplication(selectedJob.id);

    showToast(
      "Success",
      "Application submitted successfully! Good luck with your application.",
    );
    await fetchUserApplications();
    clearProgress(selectedJob.id);
    handleCloseModal();
  };

  const handleFetchExamAttempt = () => {
    if (!selectedJob?.exam_id) return;
    fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
  };

  return (
    <div className={panelStyles.container}>
      <section className={panelStyles.mainContent}>
        <div className={panelStyles.searchBox}>
          <input
            type="text"
            placeholder="Search companies and jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={panelStyles.searchInput}
          />
        </div>

        {/* Companies Section */}
        <div className={panelStyles.companiesSection}>
          <div className={panelStyles.companiesHeader}>
            <h2 className={panelStyles.companiesTitle}>
              Companies
              <span className={panelStyles.count}>
                ({filteredCompanies.length})
              </span>
            </h2>
            <SortCompany
              currentSort={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
              }}
            >
              <BlocksWave />
            </div>
          ) : sortedCompanies.length > 0 ? (
            <>
              <div className={panelStyles.companiesGrid}>
                {displayedCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/job-opportunities/${company.id}`}
                  >
                    <div className={styles.jobCard}>
                      <div className={styles.jobCompany}>
                        <div
                          className={`${styles.manpowerCount} ${styles.jobStats}`}
                        >
                          <h3>{getManpowerCount(company.id)}</h3>
                          <p>MANPOWER NEEDS</p>
                        </div>
                        <div className={styles.companyLogoContainer}>
                          <img
                            src={
                              company.logo ||
                              "/assets/images/default_profile.png"
                            }
                            alt={company.name + " logo"}
                            className={styles.companyLogo}
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div
                          className={`${styles.jobCount} ${styles.jobStats}`}
                        >
                          <h3>{getJobCount(company.id)}</h3>
                          <p>JOBS POSTED</p>
                        </div>
                      </div>
                      <div className={styles.companyInfo}>
                        <h3>{company.name}</h3>
                        <p>{company.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredCompanies.length > 8 && (
                <button
                  className={panelStyles.showMoreButton}
                  onClick={() => setShowAllCompanies(!showAllCompanies)}
                >
                  {showAllCompanies
                    ? "Show Less"
                    : `Show All Companies (${filteredCompanies.length - 8} more)`}
                </button>
              )}
            </>
          ) : (
            <p
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#64748b",
              }}
            >
              No companies found.
            </p>
          )}
        </div>

        <AllJobsSection
          jobs={jobs}
          userSkills={userSkills}
          searchQuery={search}
          onJobClick={handleJobClick}
        />
      </section>

      <aside className={panelStyles.sidebar}>
        <RecommendedJobsPanel
          userSkills={userSkills}
          showExpanded={showExpandedRecommendations}
          onToggleExpanded={() =>
            setShowExpandedRecommendations(!showExpandedRecommendations)
          }
          onJobClick={handleJobClick}
        />
      </aside>

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
    </div>
  );
};

export default PrivateCompanyListWithRecommendations;
