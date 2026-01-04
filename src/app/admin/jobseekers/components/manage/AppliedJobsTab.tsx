import React from "react";
import Button from "@/components/Button";
import styles from "../ManageJobseeker.module.css";
import jobHomeStyle from "@/app/(user)/job-opportunities/JobHome.module.css";
import { JobApplication } from "../../types/jobseeker.types";

interface AppliedJobsTabProps {
  applications: JobApplication[];
  loading: boolean;
  onViewExam: (app: JobApplication) => void;
  onViewReferral: (app: JobApplication) => void;
  onViewID: (app: JobApplication) => void;
}

export default function AppliedJobsTab({
  applications,
  loading,
  onViewExam,
  onViewReferral,
  onViewID,
}: AppliedJobsTabProps) {
  if (loading) {
    return <div className={styles.loading}>Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className={styles.noData}>
        <p>This jobseeker has not applied to any jobs yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.appliedJobs}>
      <h2>Applied Jobs ({applications.length})</h2>
      <div className={styles.applicationsGrid}>
        {applications.map((app) => (
          <div key={app.id} className={styles.applicationCard}>
            <div className={styles.applicationCardContent}>
              <div className={jobHomeStyle.jobCompany}>
                {app.company.logo && (
                  <img
                    src={app.company.logo}
                    alt={app.company.name + " logo"}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
                <span>{app.company.name}</span>
              </div>
              <div className={styles.jobInfo}>
                <h3>{app.job.title}</h3>
                <p>
                  <strong>Location:</strong> {app.job.place_of_assignment}
                </p>
                <p>
                  <strong>Education:</strong> {app.job.education}
                </p>
                <p>
                  <strong>Eligibility:</strong> {app.job.eligibility}
                </p>
                <p>
                  <strong>Applied:</strong>{" "}
                  {new Date(app.applied_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${styles.status} ${styles[app.status.replace(" ", "").toLowerCase()]}`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            <div className={styles.applicationActions}>
              <Button variant="primary" onClick={() => onViewExam(app)}>
                📝 Exam Result
              </Button>
              <Button variant="warning" onClick={() => onViewID(app)}>
                🆔 View ID
              </Button>
              <Button variant="success" onClick={() => onViewReferral(app)}>
                📄 Referral
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
