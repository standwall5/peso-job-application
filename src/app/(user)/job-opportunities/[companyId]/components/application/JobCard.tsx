// src/app/(user)/job-opportunities/[companyId]/components/application/JobCard.tsx
"use client";
import React from "react";
import styles from "./JobCard.module.css";
import Button from "@/components/Button";
import { Job } from "../../types/job.types";
import SkillMatchBadge from "@/components/SkillMatchBadge";

interface JobCardProps {
  job: Job & { matchPercentage?: number };
  hasApplied: boolean;
  onClick: () => void;
  userSkills?: string[];
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  hasApplied,
  onClick,
  userSkills,
}) => {
  // Calculate which skills match
  const matchingSkills =
    userSkills && job.skills
      ? job.skills.filter((skill) =>
          userSkills.some((us) => us.toLowerCase() === skill.toLowerCase()),
        )
      : [];

  const missingSkills =
    job.skills?.filter((skill) => !matchingSkills.includes(skill)) || [];

  return (
    <div className={styles.jobCard} onClick={onClick}>
      <div className={styles.jobCardHeader}>
        <img
          src={job.companies?.logo || "/assets/images/default_profile.png"}
          alt={job.companies?.name || "Company"}
          className={styles.companyLogo}
        />
        {job.matchPercentage !== undefined && job.matchPercentage > 0 && (
          <SkillMatchBadge percentage={job.matchPercentage} size="small" />
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {job.sex}
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            {job.eligibility}
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

        {/* Show Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className={styles.skillsSection}>
            <h4 className={styles.skillsTitle}>Required Skills</h4>
            <div className={styles.skillsList}>
              {job.skills.map((skill, idx) => {
                const isMatched = matchingSkills.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`${styles.skillTag} ${
                      isMatched ? styles.matched : styles.unmatched
                    }`}
                  >
                    {skill}
                    {isMatched && <span className={styles.checkmark}> ✓</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <Button
          variant="success"
          disabled={hasApplied}
          style={{ marginTop: "auto", width: "100%" }}
        >
          {hasApplied ? "Applied" : "Apply Now"}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
