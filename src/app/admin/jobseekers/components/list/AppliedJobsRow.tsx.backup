// src/app/admin/jobseekers/components/list/AppliedJobsRow.tsx

"use client";

import React, { useState } from "react";
import styles from "../Jobseekers.module.css";
import { AppliedJob } from "../../types/jobseeker.types";

interface AppliedJobsRowProps {
  jobs: AppliedJob[];
  loading: boolean;
  onStatusChange?: (jobId: number, newStatus: string) => Promise<void>;
}

const AppliedJobsRow: React.FC<AppliedJobsRowProps> = ({
  jobs,
  loading,
  onStatusChange,
}) => {
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    if (!onStatusChange) return;

    setUpdating(true);
    try {
      await onStatusChange(jobId, newStatus);
      setEditingJobId(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

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
            const isEditing = editingJobId === job.id;

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
                <div className={styles.statusCell}>
                  <div className={styles.statusContainer}>
                    <span
                      className={`${styles.jobStatus} ${
                        normalizedStatus === "referred"
                          ? styles.statusReferred
                          : normalizedStatus === "deployed"
                            ? styles.statusDeployed
                            : normalizedStatus === "rejected"
                              ? styles.statusRejected
                              : normalizedStatus === "pending"
                                ? styles.statusPending
                                : styles.statusDefault
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                    <button
                      className={styles.statusEditIcon}
                      onClick={() => setEditingJobId(isEditing ? null : job.id)}
                      title="Edit Status"
                      disabled={updating}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        style={{ width: "2rem", height: "2rem" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                  </div>

                  {isEditing && (
                    <div className={styles.statusDropdown}>
                      <button
                        className={styles.statusOption}
                        onClick={() => handleStatusChange(job.id, "pending")}
                        disabled={updating}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ backgroundColor: "#fbbf24" }}
                        ></span>
                        Pending
                      </button>
                      <button
                        className={styles.statusOption}
                        onClick={() => handleStatusChange(job.id, "referred")}
                        disabled={updating}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ backgroundColor: "#10b981" }}
                        ></span>
                        Referred
                      </button>
                      <button
                        className={styles.statusOption}
                        onClick={() => handleStatusChange(job.id, "rejected")}
                        disabled={updating}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ backgroundColor: "#ef4444" }}
                        ></span>
                        Rejected
                      </button>
                    </div>
                  )}
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
