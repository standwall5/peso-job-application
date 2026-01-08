"use client";
import React from "react";
import Image from "next/image";
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

  return (
    <div className={styles.jobCard} onClick={onClick}>
      {/* Header with company logo and skill match badge */}
      <div className={styles.companySection}>
        <Image
          src={job.companies?.logo || "/assets/images/default_profile.png"}
          alt={job.companies?.name || "Company"}
          className={styles.companyLogo}
          width={64}
          height={64}
        />
        <span className={styles.companyName}>{job.companies?.name}</span>
        {job.matchPercentage !== undefined && job.matchPercentage > 0 && (
          <div className={styles.badgeContainer}>
            <SkillMatchBadge percentage={job.matchPercentage} size="small" />
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className={styles.jobDetails}>
        <h2 className={styles.jobTitle}>{job.title}</h2>

        <div className={styles.detailsList}>
          <div className={styles.detailItem}>
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{job.place_of_assignment}</span>
          </div>

          <div className={styles.detailItem}>
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
            <span>{job.education}</span>
          </div>

          <div className={styles.detailItem}>
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
            <span>{job.sex}</span>
          </div>

          <div className={styles.detailItem}>
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
            <span>{job.eligibility}</span>
          </div>

          <div className={styles.detailItem}>
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
            <span>
              {job.posted_date
                ? new Date(job.posted_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No date"}
            </span>
          </div>
        </div>

        {/* Show Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className={styles.skillsSection}>
            <h4 className={styles.skillsTitle}>
              <svg
                className={styles.skillsIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Required Skills
            </h4>
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
