"use client";

import React, { useState } from "react";
import styles from "../Jobseekers.module.css";
import { JobApplication } from "../../types/jobseeker.types";

interface AppliedJobsTabProps {
  applications: JobApplication[];
  loading: boolean;
  onViewExam: (app: JobApplication) => void;
  onViewReferral: (app: JobApplication) => void;
  onViewID: (app: JobApplication) => void;
}

export default function AppliedJobsTab({
  applications,
  loading,
  onViewExam,
  onViewReferral,
  onViewID,
}: AppliedJobsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  if (loading) {
    return (
      <div className={styles.notFound}>
        <h3>Loading applications...</h3>
      </div>
    );
  }

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
        <h3>No applications found.</h3>
      </div>
    );
  }

  return (
    <div style={{ width: "90%", maxWidth: "1400px" }}>
      <div className={styles.jobseekersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.jobseekersDetailsHeader}>
            <div style={{ width: "5.8rem" }}></div>
            <div>COMPANY</div>
            <div>JOB TITLE</div>
            <div>PLACE OF ASSIGNMENT</div>
            <div>STATUS</div>
          </div>
          <div>VIEW</div>
        </div>

        {currentApplications.map((app) => (
          <React.Fragment key={app.id}>
            <div className={styles.tableRow}>
              <div className={styles.jobseekersDetails}>
                <div className={styles.avatarCell}>
                  <img
                    src={
                      app.company.logo ?? "/assets/images/default_profile.png"
                    }
                    alt={app.company.name}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.applicantName}>{app.company.name}</div>
                <div>{app.job.title}</div>
                <div>{app.job.place_of_assignment}</div>
                <div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor:
                        app.status.toLowerCase() === "pending"
                          ? "#e5e7eb"
                          : app.status.toLowerCase() === "referred"
                            ? "#10b981"
                            : "#3b82f6",
                      color:
                        app.status.toLowerCase() === "pending"
                          ? "#64748b"
                          : "#ffffff",
                    }}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.viewActions}>
                <button
                  className={styles.examResultBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewExam(app);
                  }}
                >
                  EXAM RESULT
                </button>
                <button
                  className={styles.validIdBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewID(app);
                  }}
                >
                  VALID ID
                </button>
                <button
                  className={styles.referralBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReferral(app);
                  }}
                >
                  REFERRAL
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Pagination Controls */}
        {applications.length > 0 && (
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Showing {startIndex + 1}-{Math.min(endIndex, applications.length)}{" "}
              of {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
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
    </div>
  );
}
