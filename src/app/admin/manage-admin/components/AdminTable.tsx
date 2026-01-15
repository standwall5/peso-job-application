// src/app/admin/manage-admin/components/AdminTable.tsx

import React, { useState } from "react";
import styles from "../ManageAdmin.module.css";
import { AdminWithEmail } from "../types/admin.types";

interface AdminTableProps {
  admins: AdminWithEmail[];
  onEdit: (admin: AdminWithEmail) => void;
  onUnlock: (adminId: number) => void;
  onArchive: (admin: AdminWithEmail) => void;
  selectedAdmins: number[];
  onToggleSelect: (adminId: number) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({
  admins,
  onEdit,
  onUnlock,
  onArchive,
  selectedAdmins,
  onToggleSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

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

  const getStatusBadge = (admin: AdminWithEmail) => {
    if (admin.account_locked) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusLocked}`}>
          Locked
        </span>
      );
    }

    const status = admin.status || "active";
    const statusClass = {
      active: styles.statusActive,
      suspended: styles.statusSuspended,
      deactivated: styles.statusDeactivated,
    }[status];

    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
    );
  };

  if (admins.length === 0) {
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
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
        <h3>No admins found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className={styles.adminTable}>
      <div className={styles.tableHeader}>
        <div className={styles.adminDetailsHeader}>
          <div>NAME</div>
          <div>ROLE</div>
          <div>EMAIL</div>
          <div>CREATED</div>
          <div>STATUS</div>
        </div>
        <div></div>
      </div>

      {currentAdmins.map((admin) => (
        <div className={styles.tableRow} key={admin.id}>
          <div
            className={styles.adminDetails}
            onClick={() => onEdit(admin)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.adminInfo}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {admin.is_online && (
                  <span
                    className={styles.onlineIndicator}
                    title="Currently online"
                  />
                )}
                <span className={styles.adminName}>{admin.name}</span>
              </div>
              {admin.is_superadmin && (
                <span className={styles.adminRole}>Super Admin</span>
              )}
            </div>

            <div className={styles.adminDate}>
              {admin.is_superadmin ? "Super Admin" : "Admin"}
            </div>

            <div className={styles.adminEmail}>{admin.email}</div>

            <div className={styles.adminDate}>
              {admin.created_at
                ? new Date(admin.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </div>

            <div>{getStatusBadge(admin)}</div>
          </div>

          <div className={styles.checkbox}>
            <input
              type="checkbox"
              checked={selectedAdmins.includes(admin.id)}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(admin.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {admins.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, admins.length)} of{" "}
            {admins.length} {admins.length === 1 ? "admin" : "admins"}
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

export default AdminTable;
