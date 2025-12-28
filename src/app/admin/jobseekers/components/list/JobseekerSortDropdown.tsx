// src/app/admin/jobseekers/components/list/JobseekerSortDropdown.tsx

import React from "react";
import styles from "../Jobseekers.module.css";

interface JobseekerSortDropdownProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const JobseekerSortDropdown: React.FC<JobseekerSortDropdownProps> = ({
  sortBy,
  setSortBy,
}) => {
  return (
    <div className={styles.topRight}>
      <div className={styles.sortBy}>
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="date">Date Applied</option>
          <option value="type">Applicant Type</option>
          <option value="place">Place of Assignment</option>
        </select>
      </div>
    </div>
  );
};

export default JobseekerSortDropdown;
