"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import SkillMatchBadge from "@/components/SkillMatchBadge";
import { Job } from "@/app/(user)/job-opportunities/[companyId]/types/job.types";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./JobListCard.module.css";

interface JobListCardProps {
  job: Job & { matchPercentage?: number };
  userSkills?: string[];
  hasApplied?: boolean;
  showSkillMatch?: boolean;
  showApplyButton?: boolean;
  onClick: () => void;
}

interface DetailItemProps {
  icon: React.ReactNode;
  text: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, text }) => (
  <div className={styles.detailItem}>
    {icon}
    <span>{text}</span>
  </div>
);

const JobListCard: React.FC<JobListCardProps> = ({
  job,
  userSkills = [],
  hasApplied = false,
  showSkillMatch = false,
  showApplyButton = false,
  onClick,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate matching skills
  const matchingSkills =
    userSkills && job.skills
      ? job.skills.filter((skill) =>
          userSkills.some((us) => us.toLowerCase() === skill.toLowerCase()),
        )
      : [];

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.jobCard} onClick={onClick}>
      {/* Company Section */}
      <div className={styles.companySection}>
        <div className={styles.companyHeader}>
          <div className={styles.companyInfoLeft}>
            <Image
              src={
                job.icon_url ||
                job.companies?.logo ||
                "/assets/images/default_profile.png"
              }
              alt={job.title || job.companies?.name || "Company"}
              className={styles.companyLogo}
              width={64}
              height={64}
            />
            <span className={styles.companyName}>{job.companies?.name}</span>
          </div>
          {job.manpower_needed && job.manpower_needed > 0 && (
            <div className={styles.manpowerStats}>
              <h3>{job.manpower_needed}</h3>
              <p>{t("jobs.manpowerNeeds")}</p>
            </div>
          )}
        </div>
        {showSkillMatch &&
          job.matchPercentage !== undefined &&
          job.matchPercentage > 0 && (
            <div className={styles.badgeContainer}>
              <SkillMatchBadge percentage={job.matchPercentage} size="small" />
            </div>
          )}
      </div>

      {/* Job Details */}
      <div className={styles.jobContent}>
        <h2 className={styles.jobTitle}>{job.title}</h2>

        {/* Mobile Expand Button */}
        <button
          className={styles.expandButton}
          onClick={handleToggleExpand}
          type="button"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          <span
            className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}
          >
            ▼
          </span>
        </button>

        {/* Details List - Collapsible on mobile */}
        <div
          className={`${styles.detailsList} ${isExpanded ? styles.expanded : ""}`}
        >
          <DetailItem
            icon={
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
            }
            text={job.place_of_assignment}
          />
          <DetailItem
            icon={
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
            }
            text={job.education}
          />
          <DetailItem
            icon={
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
            }
            text={job.sex}
          />
          <DetailItem
            icon={
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
            }
            text={job.eligibility}
          />
          <DetailItem
            icon={
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
            }
            text={
              job.posted_date
                ? new Date(job.posted_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No date"
            }
          />
        </div>

        {/* Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <div
            className={`${styles.skillsSection} ${isExpanded ? styles.expanded : ""}`}
          >
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

        {/* Apply Button - Always render to maintain consistent height */}
        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          {showApplyButton && (
            <Button
              variant="success"
              disabled={hasApplied}
              style={{ width: "100%" }}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {hasApplied ? t("common.applied") : t("common.applyNow")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListCard;
