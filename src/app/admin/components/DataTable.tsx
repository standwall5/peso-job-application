import React from "react";

import styles from "./DataTable.module.css";

/**
 * Reusable DataTable component
 *
 * How to use:
 * 1) Provide columns and data from the parent page.
 *    Example in CompanyProfiles page:
 *      const columns = [
 *        { key: "company", label: "COMPANY NAME" },
 *        { key: "location", label: "PLACE OF ASSIGNMENT" },
 *        { key: "jobsPosted", label: "JOBS POSTED" },
 *        { key: "manpower", label: "MANPOWER NEEDED" },
 *        { key: "status", label: "STATUS" },
 *      ];
 *
 *      const rows = companies.map((c) => ({

 *        company: (
 *          <div className={styles.avatarCell}>
 *            <img
 *              src={c.logo ?? "/assets/images/default_profile.png"}
 *              alt={c.name}
 *              className={styles.avatar}
 *            />
 *            <span>{c.name}</span>
 *          </div>
 *        ),
 *        location: c.location,
 *        jobsPosted: c.totalJobsPosted,
 *        manpower: c.totalManpower,
 *        status: (
 *          <span className={`${styles.status} ${styles.active}`}>ACTIVE</span>
 *        ),
 *      }));
 *
 *      <DataTable
 *        columns={columns}
 *        data={rows}
 *        onRowClick={(row, index) => {
 *          // Optional: handle row click (e.g., setSelectedCompany(row))
 *        }}
 *        emptyContent={
 *          <div className={styles.notFound}>
 *            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
 *              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
 *            </svg>
 *            <h3>No Companies found.</h3>
 *          </div>
 *        }
 *      />
 *
 * 2) Styling:
 *    - Refer to styles used in CompanyProfiles.module.css and Jobseekers.module.css.
 *    - Create a new DataTable.module.css beside this file and copy/adapt table-related classes:
 *      .table, .tableHeader, .tableRow, .cell, .avatarCell, .avatar, .status, .detailsBtn, .notFound
 *
 * 3) Keep data logic (fetching, filtering, sorting) in the parent.
 *    This component is purely presentational.
 */

type Column = {
  key: string;

  label: string;
  /** Optional column width style or class mapping, if needed */
  className?: string;
};

type DataTableProps = {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  /** Rendered when data.length === 0 */
  emptyContent?: React.ReactNode;
  /** Optional click handler for a row */
  onRowClick?: (row: Record<string, React.ReactNode>, index: number) => void;
  /** Optional className overrides */
  className?: string;
  /** Optional header class override */
  headerClassName?: string;
  /** Optional row class override */
  rowClassName?: string;
};

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  emptyContent = <div className={styles.notFound}>No records found.</div>,
  onRowClick,
  className = "",
  headerClassName = "",
  rowClassName = "",
}) => {
  return (
    <div className={`${styles.table} ${className}`}>
      {/* Header */}
      <div className={`${styles.tableHeader} ${headerClassName}`}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={`${styles.cell} ${col.className ?? ""}`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.length > 0
        ? data.map((row, idx) => (
            <div
              key={idx}
              className={`${styles.tableRow} ${rowClassName}`}
              onClick={() => onRowClick?.(row, idx)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={`${styles.cell} ${col.className ?? ""}`}
                >
                  {row[col.key]}
                </div>
              ))}
            </div>
          ))
        : emptyContent}
    </div>
  );
};

export default DataTable;
