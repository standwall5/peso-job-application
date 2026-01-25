// src/app/(user)/job-opportunities/[companyId]/components/application/JobCard.tsx
"use client";
import React from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "../../JobsOfCompany.module.css";
import skillStyles from "./JobCardSkills.module.css";
import Button from "@/components/Button";
import { Job } from "../../../types/job.types";
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
    <div
      key={job.id}
      className={`${styles.jobCard} ${jobStyle.jobSpecificCard} ${jobStyle.jobCard}`}
      onClick={onClick}
      style={{ minHeight: "50rem" }}
    >
      <div className={`${styles.jobCompany} ${jobStyle.companyInformation}`}>
        <img
          src={job.companies?.logo || "/assets/images/default_profile.png"}
          alt={job.companies?.name + " logo" || "Company logo"}
          className={styles.companyLogo}
          style={{
            width: "64px",
            height: "64px",
            objectFit: "contain",
          }}
        />
        <span>{job.companies?.name}</span>
      </div>

      <div className={jobStyle.jobDetails}>
        <h2>{job.title}</h2>
        <p>{job.place_of_assignment}</p>
        <p>{job.sex}</p>
        <p>{job.education}</p>
        <p>{job.eligibility}</p>
        <p>
          {job.posted_date
            ? new Date(job.posted_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "No date"}
        </p>

        {/* Show Skill Match Badge */}
        {job.matchPercentage !== undefined && job.matchPercentage > 0 && (
          <div className={skillStyles.matchBadgeContainer}>
            <SkillMatchBadge percentage={job.matchPercentage} size="small" />
          </div>
        )}

        {/* Show Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className={skillStyles.skillsSection}>
            <h4 className={skillStyles.skillsTitle}>Required Skills:</h4>
            <div className={skillStyles.skillsList}>
              {job.skills.map((skill, idx) => {
                const isMatched = matchingSkills.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`${skillStyles.skillTag} ${
                      isMatched ? skillStyles.matched : skillStyles.unmatched
                    }`}
                  >
                    {skill}
                    {isMatched && (
                      <span className={skillStyles.checkmark}> ✓</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <Button
          variant="success"
          disabled={hasApplied}
          style={{ marginTop: "1rem" }}
        >
          {hasApplied ? "Applied" : "Apply"}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
