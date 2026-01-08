// src/app/admin/jobseekers/components/list/JobseekerStatsHeader.tsx

import React from "react";
import styles from "../Jobseekers.module.css";

interface JobseekerStatsHeaderProps {
  totalJobseekers: number;
  activeApplications: number;
  isArchived?: boolean;
}

const JobseekerStatsHeader: React.FC<JobseekerStatsHeaderProps> = ({
  totalJobseekers,
  activeApplications,
  isArchived = false,
}) => {
  return (
    <div className={styles.totalStatistics}>
      <strong>
        {isArchived ? "TOTAL ARCHIVED JOBSEEKERS" : "TOTAL JOBSEEKERS"}:{" "}
        {totalJobseekers}
      </strong>
      {!isArchived && (
        <strong>ACTIVE APPLICATIONS: {activeApplications}</strong>
      )}
    </div>
  );
};

export default JobseekerStatsHeader;
