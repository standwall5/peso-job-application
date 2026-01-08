"use client";

import React, { useState, useEffect } from "react";
import styles from "../../manage-admin/ManageAdmin.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import {
  getArchivedAdminsAction,
  unarchiveAdminAction,
  deleteAdminAction,
} from "@/app/admin/actions/admin.actions";
import { AdminWithEmail } from "../../manage-admin/types/admin.types";

const ArchivedAdminsList = () => {
  const [admins, setAdmins] = useState<AdminWithEmail[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithEmail | null>(
    null,
  );
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchArchivedAdmins();
  }, []);

  useEffect(() => {
    const filtered = admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredAdmins(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [search, admins]);

  const fetchArchivedAdmins = async () => {
    try {
      setLoading(true);
      const data = await getArchivedAdminsAction();
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (error) {
      console.error("Error fetching archived admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      await unarchiveAdminAction(selectedAdmin.id);
      await fetchArchivedAdmins();
      setShowUnarchiveModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error unarchiving admin:", error);
      alert("Failed to unarchive admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      await deleteAdminAction(selectedAdmin.id, selectedAdmin.auth_id);
      await fetchArchivedAdmins();
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

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
      <div className={styles.container}>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "4rem" }}
        >
          <OneEightyRing height={64} width={64} color="var(--accent)" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.archiveContainer}`}>
      {/*<div className={styles.header}>
        <p>
          View archived admin accounts. You can restore or permanently delete
          them.
        </p>
      </div>*/}

      {/* Search Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchContainer}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className={styles.searchIcon}
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
        {/* Empty div for layout balance */}
        <div style={{ width: "200px" }}></div>
      </div>

      {/* Table */}
      {filteredAdmins.length === 0 ? (
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
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <h3>No archived admins</h3>
          <p>Archived admin accounts will appear here</p>
        </div>
      ) : (
        <div className={styles.adminTable}>
          <div className={styles.tableHeader}>
            <div className={styles.adminDetailsHeaderArchived}>
              <div>NAME</div>
              <div>ROLE</div>
              <div>EMAIL</div>
              <div>ARCHIVED DATE</div>
            </div>
            <div>ACTIONS</div>
            <div></div>
          </div>

          {currentAdmins.map((admin) => (
            <div key={admin.id} className={styles.tableRow}>
              <div className={styles.adminDetailsArchived}>
                <div className={styles.adminInfo}>
                  <span className={styles.adminName}>{admin.name}</span>
                  {admin.is_superadmin && (
                    <span className={styles.adminRole}>Super Admin</span>
                  )}
                </div>

                <div className={styles.adminDate}>
                  {admin.is_superadmin ? "Super Admin" : "Admin"}
                </div>

                <div className={styles.adminEmail}>{admin.email}</div>

                <div className={styles.adminDate}>
                  {admin.archived_at
                    ? new Date(admin.archived_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>

              <div className={styles.actions}>
                {/* Unarchive Button */}
                <button
                  className={styles.actionIconButton}
                  onClick={() => handleUnarchive(admin)}
                  title="Unarchive Admin"
                >
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
                      d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
                    />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  className={`${styles.actionIconButton} ${styles.actionButtonDanger}`}
                  onClick={() => handleDelete(admin)}
                  title="Permanently Delete Admin"
                >
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
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.checkbox}>
                <input type="checkbox" />
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {filteredAdmins.length > 0 && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAdmins.length)} of{" "}
                {filteredAdmins.length}{" "}
                {filteredAdmins.length === 1 ? "admin" : "admins"}
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
      )}

      {/* Unarchive Confirmation Modal */}
      {showUnarchiveModal && selectedAdmin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Unarchive Admin</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowUnarchiveModal(false)}
                disabled={actionLoading}
              >
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>
                Are you sure you want to unarchive{" "}
                <strong>{selectedAdmin.name}</strong>? This will restore the
                admin account to active status.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowUnarchiveModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={confirmUnarchive}
                disabled={actionLoading}
              >
                {actionLoading ? "Unarchiving..." : "Unarchive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Permanently Delete Admin</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p
                style={{
                  color: "#dc2626",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p>
                Are you sure you want to permanently delete{" "}
                <strong>{selectedAdmin.name}</strong> ({selectedAdmin.email})?
                This will remove all data associated with this admin account.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedAdminsList;
