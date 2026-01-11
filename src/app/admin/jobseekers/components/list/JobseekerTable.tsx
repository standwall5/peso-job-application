// src/app/admin/jobseekers/components/list/JobseekerTable.tsx

import React, { useState } from "react";
import styles from "../Jobseekers.module.css";
import { Application, AppliedJob } from "../../types/jobseeker.types";
import AppliedJobsRow from "./AppliedJobsRow";
import {
  getApplicantAppliedJobs,
  updateApplicationStatus,
} from "@/lib/db/services/application.service";

interface JobseekerTableProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedJobseekers: number[];
  onToggleSelect: (applicantId: number) => void;
}

const JobseekerTable: React.FC<JobseekerTableProps> = ({
  applications,
  onViewDetails,
  sortBy,
  setSortBy,
  selectedJobseekers,
  onToggleSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedApplicantId, setExpandedApplicantId] = useState<number | null>(
    null,
  );
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const itemsPerPage = 5;

  // Pagination calculations
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedApplicantId(null); // Close expanded row on page change
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

  const handleRowClick = async (applicantId: number) => {
    // Toggle: if clicking the same row, collapse it
    if (expandedApplicantId === applicantId) {
      setExpandedApplicantId(null);
      setAppliedJobs([]);
      return;
    }

    // Expand the new row
    setExpandedApplicantId(applicantId);
    setLoadingJobs(true);

    try {
      // Fetch applied jobs for this applicant using the service
      const jobs = await getApplicantAppliedJobs(applicantId);
      setAppliedJobs(jobs);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleStatusChange = async (
    applicationId: number,
    newStatus: string,
  ) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);

      // Refresh the applied jobs list for the expanded row
      if (expandedApplicantId) {
        const jobs = await getApplicantAppliedJobs(expandedApplicantId);
        setAppliedJobs(jobs);
      }

      // TODO: Send notification to user about status change
      console.log(
        `Status changed to ${newStatus} for application ${applicationId}`,
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  };

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

  const formatAppliedDate = (dateStr?: string) => {
    if (!dateStr) return "";
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

  return (
    <div className={styles.jobseekersTable}>
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
        <div>ACTIONS</div>
        <div></div>
      </div>

      {currentApplications.map((app) => (
        <React.Fragment key={app.applicant.id}>
          <div className={styles.tableRow}>
            <div
              className={`${styles.jobseekersDetails} ${
                expandedApplicantId === app.applicant.id
                  ? styles.expandedActive
                  : ""
              }`}
              onClick={() => handleRowClick(app.applicant.id)}
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
              <div>{app.applicant.preferred_poa}</div>
              <div>{formatAppliedDate(app.applied_date)}</div>
              <div className={styles.expandIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  style={{
                    width: "20px",
                    height: "20px",
                    transform:
                      expandedApplicantId === app.applicant.id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
            <div>
              <button
                className={styles.detailsBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(app);
                }}
              >
                View Details
              </button>
            </div>
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
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "var(--accent)",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Expanded row showing applied jobs */}
          {expandedApplicantId === app.applicant.id && (
            <AppliedJobsRow
              jobs={appliedJobs}
              loading={loadingJobs}
              onStatusChange={handleStatusChange}
            />
          )}
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
