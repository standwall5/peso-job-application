// src/app/(user)/profile/components/sections/ApplicationsSection.tsx
import React from "react";
import styles from "../Profile.module.css";
import { Job, UserApplication } from "../../types/profile.types";

interface ApplicationsSectionProps {
  jobs: Job[];
  userApplications: UserApplication[];
}

export const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({
  jobs,
  userApplications,
}) => {
  const getApplicationDate = (jobId: number) =>
    userApplications.find((app) => app.job_id === jobId);

  const filteredJobs = jobs.filter((job) =>
    userApplications.some((app) => app.job_id === job.id),
  );

  const jobCards = filteredJobs.map((job) => {
    const application = getApplicationDate(job.id);
    const applicationDate = application?.applied_date
      ? new Date(application.applied_date)
      : null;

    const formattedDate =
      applicationDate && !isNaN(applicationDate.getTime())
        ? applicationDate.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "No application date";

    return (
      <div key={job.id} className={`${styles.jobCard}`}>
        <div className={`${styles.jobCompany}`}>
          <img
            src={job.companies.logo || "/assets/images/default_profile.png"}
            alt={job.companies.name + " logo"}
            className={styles.companyLogo}
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
            }}
          />
          <span>{job.companies?.name}</span>
          <span>{job.title}</span>
        </div>
        <div className={styles.jobDetails}>
          <span>{formattedDate}</span>
          <span
            className={`${styles.status} ${
              application?.status === "Pending" ? styles.pending : ""
            } ${application?.status === "Referred" ? styles.referred : ""}`}
          >
            {application?.status === "Pending" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {application.status}
              </>
            ) : application?.status === "Referred" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {application.status}
              </>
            ) : null}
          </span>
        </div>
      </div>
    );
  });

  return <div className={styles.appliedJobs}>{jobCards}</div>;
};
