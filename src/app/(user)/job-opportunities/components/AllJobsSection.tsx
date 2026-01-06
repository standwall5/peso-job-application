"use client";
import React, { useState } from "react";
import styles from "./AllJobsSection.module.css";
import { sortJobsBySkillMatch } from "@/lib/utils/skillMatching";
import SkillMatchBadge from "@/components/SkillMatchBadge";
import { Job } from "../[companyId]/types/job.types";

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
          All Job Openings
          <span className={styles.count}>({filteredJobs.length})</span>
        </h2>
        <div className={styles.sortButtons}>
          <button
            className={`${styles.sortButton} ${sortBy === "relevance" ? styles.active : ""}`}
            onClick={() => setSortBy("relevance")}
          >
            Most Relevant
          </button>
          <button
            className={`${styles.sortButton} ${sortBy === "date" ? styles.active : ""}`}
            onClick={() => setSortBy("date")}
          >
            Most Recent
          </button>
        </div>
      </div>

      <div className={styles.jobsGrid}>
        {displayedJobs.map((job) => {
          const matchPercentage =
            sortBy === "relevance"
              ? (job as Job & { matchPercentage?: number }).matchPercentage || 0
              : 0;

          return (
            <div
              key={job.id}
              className={styles.jobCard}
              onClick={() => onJobClick(job)}
            >
              <div className={styles.jobCardHeader}>
                <img
                  src={
                    job.companies?.logo || "/assets/images/default_profile.png"
                  }
                  alt={job.companies?.name || "Company"}
                  className={styles.companyLogo}
                />
                {sortBy === "relevance" && matchPercentage > 0 && (
                  <SkillMatchBadge percentage={matchPercentage} size="small" />
                )}
              </div>

              <div className={styles.jobContent}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.companyName}>{job.companies?.name}</p>
                <p className={styles.location}>{job.place_of_assignment}</p>

                <div className={styles.jobDetails}>
                  <span className={styles.detail}>
                    <svg
                      className={styles.icon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {job.education}
                  </span>
                  <span className={styles.detail}>
                    <svg
                      className={styles.icon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {job.posted_date
                      ? new Date(job.posted_date).toLocaleDateString()
                      : "No date"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length > 12 && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? "Show Less"
            : `Show All Jobs (${filteredJobs.length - 12} more)`}
        </button>
      )}
    </section>
  );
};

export default AllJobsSection;
