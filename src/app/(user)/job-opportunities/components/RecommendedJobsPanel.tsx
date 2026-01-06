"use client";
import React, { useState, useEffect } from "react";
import styles from "./RecommendedJobsPanel.module.css";
import { calculateSkillMatch } from "@/lib/utils/skillMatching";
import SkillMatchBadge from "@/components/SkillMatchBadge";
import { getJobsAction } from "../actions/job-opportunities.actions";
import { Job } from "../[companyId]/types/job.types";

interface RecommendedJobsPanelProps {
  userSkills: string[];
  showExpanded?: boolean;
  onToggleExpanded?: () => void;
  onJobClick?: (job: Job) => void;
}

const RecommendedJobsPanel: React.FC<RecommendedJobsPanelProps> = ({
  userSkills,
  showExpanded = false,
  onToggleExpanded,
  onJobClick,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobsAction();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const recommendedJobs = jobs
    .map((job) => ({
      ...job,
      matchPercentage: calculateSkillMatch(userSkills, job.skills || []),
    }))
    .filter((job) => job.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  const displayedJobs = showExpanded
    ? recommendedJobs
    : recommendedJobs.slice(0, 5);

  if (loading) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>Recommended for You</h3>
        <p className={styles.loading}>Loading recommendations...</p>
      </div>
    );
  }

  if (recommendedJobs.length === 0) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>Recommended for You</h3>
        <p className={styles.noJobs}>
          {userSkills.length === 0
            ? "Add skills to your resume to get personalized job recommendations."
            : "No matching jobs found. Check back later!"}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Recommended for You
          <span className={styles.count}>({recommendedJobs.length})</span>
        </h3>
      </div>

      <div className={styles.jobsList}>
        {displayedJobs.map((job) => (
          <div
            key={job.id}
            className={styles.jobItem}
            onClick={() => onJobClick?.(job)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.jobHeader}>
              <img
                src={
                  job.companies?.logo || "/assets/images/default_profile.png"
                }
                alt={job.companies?.name || "Company"}
                className={styles.companyLogo}
              />
              <div className={styles.jobInfo}>
                <h4 className={styles.jobTitle}>{job.title}</h4>
                <p className={styles.companyName}>{job.companies?.name}</p>
                <p className={styles.location}>{job.place_of_assignment}</p>
              </div>
            </div>
            <SkillMatchBadge percentage={job.matchPercentage} size="small" />
          </div>
        ))}
      </div>

      {recommendedJobs.length > 5 && (
        <button
          className={styles.viewMoreButton}
          onClick={(e) => {
            e.preventDefault();
            onToggleExpanded?.();
          }}
        >
          {showExpanded
            ? "Show Less"
            : `View All (${recommendedJobs.length - 5} more)`}
        </button>
      )}
    </div>
  );
};

export default RecommendedJobsPanel;
