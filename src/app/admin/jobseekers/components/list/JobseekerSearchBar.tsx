// src/app/admin/jobseekers/components/list/JobseekerSearchBar.tsx

import React from "react";
import styles from "../Jobseekers.module.css";

interface JobseekerSearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onArchiveSelected: () => void;
  isArchived?: boolean;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const JobseekerSearchBar: React.FC<JobseekerSearchBarProps> = ({
  search,
  setSearch,
  selectedCount,
  onSelectAll,
  onArchiveSelected,
  isArchived = false,
  sortBy,
  setSortBy,
}) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  const handleArchiveClick = () => {
    if (selectedCount === 0) {
      alert(
        `Please select at least one jobseeker to ${isArchived ? "unarchive" : "archive"}.`,
      );
      return;
    }
    onArchiveSelected();
  };

  return (
    <div className={styles.topBar}>
      {/* Center - Search */}
      <div className={styles.searchContainer}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search name, gender, place of assignment, etc."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.searchIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side - Controls below sort */}
      <div className={styles.topRightControls}>
        {/* Top row: Sort By */}
        <div className={styles.topRowControls}>
          <div style={{ position: "relative" }}>
            <button
              className={styles.sortByButton}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              SORT BY
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "1rem", height: "1rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </button>
            {showSortMenu && (
              <div className={styles.sortDropdown}>
                <button
                  onClick={() => {
                    setSortBy("name");
                    setShowSortMenu(false);
                  }}
                >
                  Name
                </button>
                <button
                  onClick={() => {
                    setSortBy("date");
                    setShowSortMenu(false);
                  }}
                >
                  Date Applied
                </button>
                <button
                  onClick={() => {
                    setSortBy("type");
                    setShowSortMenu(false);
                  }}
                >
                  Applicant Type
                </button>
                <button
                  onClick={() => {
                    setSortBy("place");
                    setShowSortMenu(false);
                  }}
                >
                  Place of Assignment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: Select All and Archive */}
        <div className={styles.bottomRowControls}>
          <button className={styles.selectAllButton} onClick={onSelectAll}>
            SELECT ALL
          </button>
          <button className={styles.archiveButton} onClick={handleArchiveClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: "1.25rem", height: "1.25rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            {isArchived ? "UNARCHIVE" : "ARCHIVE"}{" "}
            {selectedCount > 0 && `(${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobseekerSearchBar;
