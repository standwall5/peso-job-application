// src/app/admin/jobseekers/components/list/JobseekerTable.tsx

import React, { useState } from "react";
import styles from "../Jobseekers.module.css";
import { Application, AppliedJob } from "../../types/jobseeker.types";
// import AppliedJobsRow from "./AppliedJobsRow";
// import {
//   getApplicantAppliedJobs,
//   updateApplicationStatus,
// } from "@/lib/db/services/application.service";

interface JobseekerTableProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedJobseekers: number[];
  onToggleSelect: (applicantId: number) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onArchiveSelected: () => void;
  isArchived?: boolean;
}

const JobseekerTable: React.FC<JobseekerTableProps> = ({
  applications,
  onViewDetails,
  sortBy,
  setSortBy,
  selectedJobseekers,
  onToggleSelect,
  selectedCount,
  onSelectAll,
  onArchiveSelected,
  isArchived = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  // const [expandedApplicantId, setExpandedApplicantId] = useState<number | null>(
  //   null,
  // );
  // const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  // const [loadingJobs, setLoadingJobs] = useState(false);

  const itemsPerPage = 5;

  // Pagination calculations
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // setExpandedApplicantId(null); // Close expanded row on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // const handleRowClick = async (applicantId: number) => {
  //   // Toggle: if clicking the same row, collapse it
  //   if (expandedApplicantId === applicantId) {
  //     setExpandedApplicantId(null);
  //     setAppliedJobs([]);
  //     return;
  //   }

  //   // Expand the new row
  //   setExpandedApplicantId(applicantId);
  //   setLoadingJobs(true);

  //   try {
  //     // Fetch applied jobs for this applicant using the service
  //     const jobs = await getApplicantAppliedJobs(applicantId);
  //     setAppliedJobs(jobs);
  //   } catch (error) {
  //     console.error("Error fetching applied jobs:", error);
  //     setAppliedJobs([]);
  //   } finally {
  //     setLoadingJobs(false);
  //   }
  // };

  // const handleStatusChange = async (
  //   applicationId: number,
  //   newStatus: string,
  // ) => {
  //   try {
  //     await updateApplicationStatus(applicationId, newStatus);

  //     // Refresh the applied jobs list for the expanded row
  //     if (expandedApplicantId) {
  //       const jobs = await getApplicantAppliedJobs(expandedApplicantId);
  //       setAppliedJobs(jobs);
  //     }

  //     // TODO: Send notification to user about status change
  //     console.log(
  //       `Status updated to ${newStatus} for application ${applicationId}`,
  //     );
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     alert("Failed to update application status. Please try again.");
  //   }
  // };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatAppliedDate = (
    dateStr?: string,
    hasApplication: boolean = true,
  ) => {
    if (!dateStr) return hasApplication ? "" : "Not Applied";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const formatted = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    return `${day} ${formatted}`;
  };

  if (applications.length === 0) {
    return (
      <div className={styles.notFound}>
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
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <h3>No applicants found.</h3>
      </div>
    );
  }

  const handleHeaderClick = (sortKey: string) => {
    setSortBy(sortKey);
  };

  const getSortIcon = (sortKey: string) => {
    if (sortBy !== sortKey) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          style={{ width: "16px", height: "16px", opacity: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          />
        </svg>
      );
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        style={{ width: "16px", height: "16px", color: "var(--accent)" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        />
      </svg>
    );
  };

  const handleArchiveClick = () => {
    if (selectedCount === 0) {
      alert("Please select at least one jobseeker to archive.");
      return;
    }
    onArchiveSelected();
  };

  return (
    <div className={styles.jobseekersTable}>
      {/* HEADER */}
      <div className={styles.tableHeader}>
        <div className={styles.jobseekersDetailsHeader}>
          <div style={{ width: "5.8rem" }}></div>
          <div
            className={styles.sortableHeader}
            onClick={() => handleHeaderClick("name")}
          >
            FULL NAME {getSortIcon("name")}
          </div>
          <div
            className={styles.sortableHeader}
            onClick={() => handleHeaderClick("type")}
          >
            TYPE OF APPLICANT {getSortIcon("type")}
          </div>
          <div
            className={styles.sortableHeader}
            onClick={() => handleHeaderClick("place")}
          >
            PLACE OF ASSIGNMENT {getSortIcon("place")}
          </div>
          <div
            className={styles.sortableHeader}
            onClick={() => handleHeaderClick("date")}
          >
            DATE APPLIED {getSortIcon("date")}
          </div>
        </div>
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
        {/* Column space for checkbox*/}
      </div>

      {/* Bottom row controls: Select All and Archive */}

      {currentApplications.map((app) => (
        <React.Fragment key={app.applicant.id}>
          <div className={styles.tableRow}>
            <div
              className={`${styles.jobseekersDetails}`}
              onClick={() => onViewDetails(app)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.avatarCell}>
                <img
                  src={
                    app.applicant.profile_pic_url ??
                    "/assets/images/default_profile.png"
                  }
                  alt={app.applicant.name}
                  className={styles.avatar}
                />
              </div>
              <div className={styles.applicantName}>{app.applicant.name}</div>
              <div>{app.applicant.applicant_type}</div>
              <div>{app.applicant.preferred_poa || "N/A"}</div>
              <div>{formatAppliedDate(app.applied_date, !!app.status)}</div>
            </div>

            {/* Comment out status jobseeker */}
            {/*<div onClick={(e) => e.stopPropagation()}>
              {app.status && (
                <span
                  className={styles.statusBadge}
                  data-status={app.status.toLowerCase()}
                >
                  {app.status}
                </span>
              )}
            </div>*/}
            <div
              className={styles.selectIndicator}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(app.applicant.id);
              }}
            >
              {selectedJobseekers.includes(app.applicant.id) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-check"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>

          {/* Expanded row showing applied jobs - COMMENTED OUT AS NOT NEEDED */}
          {/* {expandedApplicantId === app.applicant.id && (
            <AppliedJobsRow
              jobs={appliedJobs}
              loading={loadingJobs}
              onStatusChange={handleStatusChange}
            />
          )} */}
        </React.Fragment>
      ))}

      {/* Pagination Controls */}
      {applications.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, applications.length)}{" "}
            of {applications.length}{" "}
            {applications.length === 1 ? "jobseeker" : "jobseekers"}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className={styles.paginationEllipsis}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.paginationNumber} ${
                      currentPage === page ? styles.paginationActive : ""
                    }`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className={styles.paginationBtn}
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobseekerTable;
