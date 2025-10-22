import React from "react";
import { useParams } from "next/navigation";
import PrivateJobList from "@/app/job-opportunities/[companyId]/components/PrivateJobList";
import PrivateCompanyList from "@/app/job-opportunities/components/PrivateCompanyList";
import styles from "./Search.module.css";

interface PrivateSearchProp {
  search: string;
  onSearchChange?: (value: string) => void;
}

const PrivateSearch = ({ search, onSearchChange }: PrivateSearchProp) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.jobList}>
        <h2>Job Listings</h2>
        <PrivateJobList />
      </div>
      <div className={styles.companyList}>
        <h2>Companies</h2>
        <PrivateCompanyList
          searchParent={search}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};

export default PrivateSearch;
