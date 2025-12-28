// src/app/admin/company-profiles/components/list/CompanyTable.tsx

import React, { useState } from "react";
import styles from "../CompanyProfiles.module.css";
import { Company } from "../../types/company.types";

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (company: Company) => void;
  onManageCompany: (company: Company) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onViewCompany,
  onManageCompany,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced from 10 to 5 so pagination shows earlier

  // Calculate pagination
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = companies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
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

  // Generate page numbers to display
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

  if (companies.length === 0) {
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
        <h3>No Companies found.</h3>
      </div>
    );
  }

  return (
    <div className={styles.jobseekersTable}>
      <div className={styles.tableHeader}>
        <div className={styles.jobseekersDetailsHeader}>
          <div>COMPANY NAME</div>
          <div>PLACE OF ASSIGNMENT</div>
          <div>JOBS POSTED</div>
          <div>MANPOWER NEEDED</div>
          <div>STATUS</div>
        </div>
        <div>ABOUT COMPANY</div>
        <div>SELECT</div>
      </div>

      {currentCompanies.map((company) => (
        <div className={styles.tableRow} key={company.id}>
          <div
            className={styles.jobseekersDetails}
            onClick={() => onViewCompany(company)}
          >
            <div className={styles.avatarCell}>
              <img
                src={company.logo ?? "/assets/images/default_profile.png"}
                alt={company.name}
                className={styles.avatar}
              />
              <span>{company.name}</span>
            </div>
            <div>{company.location}</div>
            <div>{company.totalJobsPosted}</div>
            <div>{company.totalManpower}</div>

            <div className={styles.status}>
              <span className={`${styles.status} ${styles.active}`}>
                ACTIVE
              </span>
            </div>
          </div>

          <div>
            <button
              className={styles.detailsBtn}
              onClick={() => onManageCompany(company)}
            >
              Manage Details
            </button>
          </div>

          <div className={styles.checkbox}>
            <input type="checkbox" />
          </div>
        </div>
      ))}

      {/* Pagination Controls - Always show if there are companies */}
      {companies.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, companies.length)} of{" "}
            {companies.length}{" "}
            {companies.length === 1 ? "company" : "companies"}
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

export default CompanyTable;
