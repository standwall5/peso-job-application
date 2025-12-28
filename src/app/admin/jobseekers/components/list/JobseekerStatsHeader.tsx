// src/app/admin/jobseekers/components/list/JobseekerStatsHeader.tsx

import React from "react";
import styles from "../Jobseekers.module.css";

interface JobseekerStatsHeaderProps {
  totalJobseekers: number;
  activeApplications: number;
}

const JobseekerStatsHeader: React.FC<JobseekerStatsHeaderProps> = ({
  totalJobseekers,
  activeApplications,
}) => {
  return (
    <div className={styles.totalStatistics}>
      <strong>TOTAL JOBSEEKERS: {totalJobseekers}</strong>
      <strong>ACTIVE APPLICATIONS: {activeApplications}</strong>
    </div>
  );
};

export default JobseekerStatsHeader;
