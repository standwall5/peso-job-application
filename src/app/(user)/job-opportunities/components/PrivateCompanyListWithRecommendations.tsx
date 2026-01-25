"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import panelStyles from "./PrivateCompanyListWithRecommendations.module.css";
import BlocksWave from "@/components/BlocksWave";
import SortCompany, { SortOption } from "./sort/SortCompany";
import { sortCompanies } from "../utils/sortCompanies";
import RecommendedJobsPanel from "./RecommendedJobsPanel";
import {
  getUserSkillsAction,
  getUserPreferredLocationAction,
} from "../actions/job-opportunities.actions";
import ApplicationModal from "../[companyId]/components/application/ApplicationModal";
import ApplicationSuccessModal from "../[companyId]/components/application/ApplicationSuccessModal";
import Toast from "@/components/toast/Toast";
import { useToast } from "../[companyId]/hooks/useToast";
import { useApplicationProgress } from "../[companyId]/hooks/useApplicationProgress";
import { useUserApplications } from "../[companyId]/hooks/useUserApplications";
import { Job } from "../[companyId]/types/job.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface JobWithCompanyId extends Job {
  company_id: number;
  manpower_needed?: number;
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
  initialCompanies: Company[];
  initialJobs: JobWithCompanyId[];
  searchParent: string;
}

const PrivateCompanyListWithRecommendations = ({
  initialCompanies,
  initialJobs,
  searchParent,
}: PrivateCompanyListProps) => {
  const { t } = useLanguage();
  const [jobs] = useState<JobWithCompanyId[]>(initialJobs);
  const [companies] = useState<Company[]>(initialCompanies);
  const [loading] = useState(false);
  const [search, setSearch] = useState(searchParent || "");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userPreferredLocation, setUserPreferredLocation] = useState<
    string | null
  >(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Custom Hooks for modal
  const { toast, showToast, hideToast } = useToast();
  const { applicationProgress, fetchProgress, updateProgress, clearProgress } =
    useApplicationProgress();
  const { userApplications, fetchUserApplications, submitFinalApplication } =
    useUserApplications();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const skills = await getUserSkillsAction();
        setUserSkills(skills);

        const preferredLocation = await getUserPreferredLocationAction();
        setUserPreferredLocation(preferredLocation);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    fetchUserData();
  }, []);

  // Fetch user applications and progress
  useEffect(() => {
    fetchUserApplications();
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      place_of_assignment: job.place_of_assignment,
    })),
    sortOption,
    userPreferredLocation,
  );

  const displayedCompanies = showAllCompanies
    ? sortedCompanies
    : sortedCompanies.slice(0, 8);

  // Modal handlers
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);

    // Mark resume as viewed if not already applied
    const hasApplied = userApplications.includes(job.id);
    if (!hasApplied) {
      updateProgress(job.id, { resume_viewed: true });
    }
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleIdUploaded = () => {
    if (!selectedJob) return;
    updateProgress(selectedJob.id, { verified_id_uploaded: true });
  };

  const handleSubmitFinalApplication = async () => {
    if (!selectedJob) return;

    await submitFinalApplication(selectedJob.id);
    await fetchUserApplications();
    clearProgress(selectedJob.id);

    // Close application modal and show success modal
    handleCloseModal();
    setShowSuccessModal(true);
  };

  return (
    <div className={panelStyles.container}>
      <section className={panelStyles.mainContent}>
        <div className={panelStyles.searchBox}>
          <input
            type="text"
            placeholder={t("jobs.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={panelStyles.searchInput}
          />
        </div>

        {/* Companies Section */}
        <div className={panelStyles.companiesSection}>
          <div className={panelStyles.companiesHeader}>
            <h2 className={panelStyles.companiesTitle}>
              {t("jobs.companies")}
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
            <div className={panelStyles.companiesGrid}>
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "40vh",
                }}
              >
                <BlocksWave />
              </div>
            </div>
          ) : sortedCompanies.length > 0 ? (
            <>
              <div className={panelStyles.companiesGrid}>
                {displayedCompanies.map((company) => (
                  <a key={company.id} href={`/job-opportunities/${company.id}`}>
                    <div className={styles.jobCard}>
                      <div className={styles.jobCompany}>
                        <div
                          className={`${styles.manpowerCount} ${styles.jobStats}`}
                        >
                          <h3>{getManpowerCount(company.id)}</h3>
                          <p>{t("jobs.manpowerNeeds")}</p>
                        </div>
                        <div className={styles.companyLogoContainer}>
                          <Image
                            src={
                              company.logo ||
                              "/assets/images/default_profile.png"
                            }
                            alt={company.name + " logo"}
                            className={styles.companyLogo}
                            width={72}
                            height={72}
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div
                          className={`${styles.jobCount} ${styles.jobStats}`}
                        >
                          <h3>{getJobCount(company.id)}</h3>
                          <p>{t("jobs.jobsPosted")}</p>
                        </div>
                      </div>
                      <div className={styles.companyInfo}>
                        <h3>{company.name}</h3>
                        <p>{company.description}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {filteredCompanies.length > 8 && (
                <button
                  className={panelStyles.showMoreButton}
                  onClick={() => setShowAllCompanies(!showAllCompanies)}
                >
                  {showAllCompanies
                    ? t("common.showLess")
                    : `${t("common.showAll")} (${filteredCompanies.length - 8} ${t("common.viewMore").toLowerCase()})`}
                </button>
              )}
            </>
          ) : (
            <div className={panelStyles.companiesGrid}>
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                {t("jobs.noCompaniesFound")}
              </p>
            </div>
          )}
        </div>
      </section>

      {userSkills.length > 0 && (
        <aside className={panelStyles.sidebar}>
          <RecommendedJobsPanel
            jobs={jobs}
            userSkills={userSkills}
            userPreferredLocation={userPreferredLocation}
          />
        </aside>
      )}

      {/* Application Modal */}
      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          hasApplied={userApplications.includes(selectedJob.id)}
          progress={applicationProgress[selectedJob.id]}
          onClose={handleCloseModal}
          onIdUploaded={handleIdUploaded}
          onSubmitFinalApplication={handleSubmitFinalApplication}
          onContinueToExam={() => {
            // Handle continue to exam - can add navigation logic here if needed
            console.log("Continue to exam clicked");
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

      {/* Success Modal */}
      {showSuccessModal && (
        <ApplicationSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
};

export default PrivateCompanyListWithRecommendations;
