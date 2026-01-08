"use client";
import React, { useState } from "react";
import styles from "./AllJobsSection.module.css";
import { sortJobsBySkillMatch } from "@/lib/utils/skillMatching";
import JobListCard from "@/components/jobs/JobListCard";
import { Job } from "../[companyId]/types/job.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface AllJobsSectionProps {
  jobs: Job[];
  userSkills: string[];
  searchQuery: string;
  onJobClick: (job: Job) => void;
}

const AllJobsSection: React.FC<AllJobsSectionProps> = ({
  jobs,
  userSkills,
  searchQuery,
  onJobClick,
}) => {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance");
  const [showAll, setShowAll] = useState(false);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companies?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.place_of_assignment.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedJobs =
    sortBy === "relevance"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sortJobsBySkillMatch(filteredJobs as any, userSkills)
      : [...filteredJobs].sort((a, b) => {
          const dateA = new Date(a.posted_date || "").getTime();
          const dateB = new Date(b.posted_date || "").getTime();
          return dateB - dateA;
        });

  const displayedJobs = showAll ? sortedJobs : sortedJobs.slice(0, 12);

  if (filteredJobs.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t("jobs.allJobs")}
          <span className={styles.count}>({filteredJobs.length})</span>
        </h2>
        <div className={styles.sortButtons}>
          <button
            className={`${styles.sortButton} ${sortBy === "relevance" ? styles.active : ""}`}
            onClick={() => setSortBy("relevance")}
          >
            {t("jobs.relevance")}
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === "date" ? styles.active : ""}`}
            onClick={() => setSortBy("date")}
          >
            {t("jobs.recent")}
          </button>
        </div>
      </div>

      {displayedJobs.length > 0 && (
        <div className={styles.jobsGrid}>
          {displayedJobs.map((job) => {
            const matchPercentage =
              sortBy === "relevance"
                ? (job as Job & { matchPercentage?: number }).matchPercentage ||
                  0
                : 0;

            return (
              <JobListCard
                key={job.id}
                job={{ ...job, matchPercentage }}
                userSkills={userSkills}
                showSkillMatch={sortBy === "relevance"}
                showApplyButton={true}
                onClick={() => onJobClick(job)}
              />
            );
          })}
        </div>
      )}

      {filteredJobs.length > 12 && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? t("common.showLess")
            : `${t("common.showAll")} (${sortedJobs.length - 12} ${t("common.viewMore").toLowerCase()})`}
        </button>
      )}
    </section>
  );
};

export default AllJobsSection;
