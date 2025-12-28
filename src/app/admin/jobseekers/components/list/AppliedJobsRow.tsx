// src/app/admin/jobseekers/components/list/AppliedJobsRow.tsx

import React from "react";
import styles from "../Jobseekers.module.css";
import { AppliedJob } from "../../types/jobseeker.types";

interface AppliedJobsRowProps {
  jobs: AppliedJob[];
  loading: boolean;
}

const AppliedJobsRow: React.FC<AppliedJobsRowProps> = ({ jobs, loading }) => {
  if (loading) {
    return (
      <div className={styles.expandedRow}>
        <div className={styles.expandedContent}>
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Loading applied jobs...
          </p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={styles.expandedRow}>
        <div className={styles.expandedContent}>
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No job applications found for this applicant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.expandedRow}>
      <div className={styles.expandedContent}>
        <div className={styles.expandedHeader}>
          <h4>Applied Jobs ({jobs.length})</h4>
        </div>

        <div className={styles.appliedJobsTable}>
          <div className={styles.appliedJobsHeader}>
            <div>COMPANY</div>
            <div>JOB TITLE</div>
            <div>PLACE OF ASSIGNMENT</div>
            <div>STATUS</div>
          </div>

          {jobs.map((job, index) => {
            // Normalize status to lowercase for comparison
            const normalizedStatus = job.status.toLowerCase();

            return (
              <div
                key={job.id}
                className={styles.appliedJobRow}
                style={{ "--index": index } as React.CSSProperties}
              >
                <div className={styles.companyCell}>
                  <img
                    src={
                      job.company_logo ?? "/assets/images/default_profile.png"
                    }
                    alt={job.company_name}
                    className={styles.companyLogo}
                  />
                  <span>{job.company_name}</span>
                </div>
                <div>{job.job_title}</div>
                <div>{job.place_of_assignment}</div>
                <div>
                  <span
                    className={`${styles.jobStatus} ${
                      normalizedStatus === "referred"
                        ? styles.statusReferred
                        : normalizedStatus === "deployed"
                          ? styles.statusDeployed
                          : normalizedStatus === "pending"
                            ? styles.statusPending
                            : styles.statusDefault
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppliedJobsRow;
