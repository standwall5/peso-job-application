// src/app/(user)/job-opportunities/[companyId]/components/application/JobCard.tsx
"use client";
import React from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "../../JobsOfCompany.module.css";
import Button from "@/components/Button";
import { Job } from "../../types/job.types";
import SkillMatchBadge from "@/components/SkillMatchBadge";

interface JobCardProps {
  job: Job;
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
  return (
    <div
      key={job.id}
      className={`${styles.jobCard} ${jobStyle.jobSpecificCard} ${jobStyle.jobCard}`}
      onClick={onClick}
      style={{ height: "50rem" }}
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

        <Button variant="success" disabled={hasApplied}>
          {hasApplied ? "Applied" : "Apply"}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
