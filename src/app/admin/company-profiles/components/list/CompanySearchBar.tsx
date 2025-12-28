// src/app/admin/company-profiles/components/list/CompanySearchBar.tsx

import React from "react";
import styles from "../CompanyProfiles.module.css";

interface CompanySearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  onAddCompany: () => void;
}

const CompanySearchBar: React.FC<CompanySearchBarProps> = ({
  search,
  setSearch,
  onAddCompany,
}) => {
  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.searchIcon}>
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
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search company name, location, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.topRight}>
        <div className={styles.addCompany} onClick={onAddCompany}>
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
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <button>ADD COMPANY</button>
        </div>
      </div>
    </>
  );
};

export default CompanySearchBar;
