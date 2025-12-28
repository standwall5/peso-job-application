import React from "react";

import styles from "./PageHeader.module.css";

/**
 * Reusable PageHeader component
 * - Renders a title, search input, and an "Add" button
 * - Styles should be defined in PageHeader.module.css, modeled after CompanyProfiles.module.css and Jobseekers.module.css
 *
 * Instructions:
 * 1) Create a new CSS module at: src/app/admin/components/PageHeader.module.css
 *    - Mirror spacing, typography, and layout from:
 *      - src/app/admin/company-profiles/components/CompanyProfiles.module.css
 *      - src/app/admin/jobseekers/components/Jobseekers.module.css
 *    - Suggested class names used below:
 *      .headerContainer, .left, .title, .stats, .right, .searchContainer, .searchIcon, .search, .addButton
 *
 * 2) Use this component in your admin pages:
 *    - Import PageHeader
 *    - Pass handlers and state from the parent page
 *    - Example:
 *      <PageHeader
 *        title="Company Profiles"
 *        searchValue={search}
 *        onSearchChange={(v) => setSearch(v)}
 *        onAddClick={() => setShowCreateCompany(true)}

 *        placeholder="Search name, location, industry..."
 *        stats={[`TOTAL OF COMPANIES: ${companies.length}`, `TOTAL OF JOB VACANCIES: ${totalJobsAllCompanies}`]}
 *      />
 *
 * 3) This header intentionally does not fetch data. Keep data logic in the parent page.
 */

type PageHeaderProps = {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  placeholder?: string;
  stats?: string[];
  addLabel?: string;
  showAddButton?: boolean;
  className?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchValue = "",
  onSearchChange,
  onAddClick,
  placeholder = "Search...",
  stats = [],
  addLabel = "ADD",
  showAddButton = true,
  className = "",
}) => {
  return (
    <div className={`${styles.headerContainer} ${className}`}>
      {/* Left side: Title + stats */}
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
        {stats?.length > 0 && (
          <div className={styles.stats}>
            {stats.map((s, i) => (
              <strong key={i}>{s}</strong>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Search + Add button */}
      <div className={styles.right}>
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
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        {showAddButton && (
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddClick}
          >
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
