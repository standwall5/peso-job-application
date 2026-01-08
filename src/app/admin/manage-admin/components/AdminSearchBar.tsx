// src/app/admin/manage-admin/components/AdminSearchBar.tsx

import React, { useState } from "react";
import styles from "../ManageAdmin.module.css";
import Image from "next/image";

interface AdminSearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onArchiveSelected: () => void;
  onSortChange?: (sortBy: string) => void;
  onAddAdmin: () => void;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  search,
  setSearch,
  selectedCount,
  onSelectAll,
  onArchiveSelected,
  onSortChange,
  onAddAdmin,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleArchiveClick = () => {
    if (selectedCount === 0) {
      alert("Please select at least one admin to archive.");
      return;
    }
    onArchiveSelected();
  };

  const handleSortChange = (sortBy: string) => {
    if (onSortChange) {
      onSortChange(sortBy);
    }
    setShowSortMenu(false);
  };

  return (
    <div className={styles.topBar}>
      {/* Center - Search */}
      <div className={styles.searchContainer}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
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

      {/* Right side - All controls */}
      <div className={styles.topRightControls}>
        {/* Top row: Add Staff and Sort By */}
        <div className={styles.topRowControls}>
          <div className={styles.addAdmin} onClick={onAddAdmin}>
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
            <button>ADD STAFF</button>
          </div>
          <div style={{ position: "relative" }}>
            <button
              className={styles.sortByButton}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              SORT BY
              <Image
                src="/assets/sorting.svg"
                alt="Sort Icon"
                width={16}
                height={16}
              />
            </button>
            {showSortMenu && (
              <div className={styles.sortDropdown}>
                <button onClick={() => handleSortChange("name-asc")}>
                  Name (A-Z)
                </button>
                <button onClick={() => handleSortChange("name-desc")}>
                  Name (Z-A)
                </button>
                <button onClick={() => handleSortChange("date-newest")}>
                  Newest First
                </button>
                <button onClick={() => handleSortChange("date-oldest")}>
                  Oldest First
                </button>
                <button onClick={() => handleSortChange("role")}>Role</button>
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
            ARCHIVE {selectedCount > 0 && `(${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSearchBar;
