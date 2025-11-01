import React from "react";
import PrivateJobList from "@/app/(user)/job-opportunities/[companyId]/components/PrivateJobList";
import PrivateCompanyList from "@/app/(user)/job-opportunities/components/PrivateCompanyList";
import styles from "./Search.module.css";

interface PrivateSearchProp {
  search: string;
  onSearchChange?: (value: string) => void;
}

const PrivateSearch = ({ search, onSearchChange }: PrivateSearchProp) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchContent}>
        <div className={styles.jobList}>
          <h2>Job Listings</h2>
          <PrivateJobList
            searchParent={search}
            onSearchChange={onSearchChange}
          />
        </div>
        <div className={styles.companyList}>
          <h2>Companies</h2>
          <PrivateCompanyList
            searchParent={search}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PrivateSearch;
