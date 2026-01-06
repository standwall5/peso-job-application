"use client";

import React, { useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import ManageJobseeker from "./ManageJobseeker";
import { useJobseekerData } from "../hooks/useJobseekerData";
import { Application } from "../types/jobseeker.types";
import JobseekerStatsHeader from "./list/JobseekerStatsHeader";
import JobseekerSearchBar from "./list/JobseekerSearchBar";
import JobseekerSortDropdown from "./list/JobseekerSortDropdown";
import JobseekerTable from "./list/JobseekerTable";
import BackButton from "./shared/BackButton";
import { ArchiveJobseekerModal } from "./modals";

const Jobseekers = () => {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const {
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    uniqueApplicants,
    sortedApplications,
    activeApplicationsCount,
  } = useJobseekerData();

  const [showManageJobseeker, setShowManageJobseeker] = useState(false);
  const [selectedJobseeker, setSelectedJobseeker] =
    useState<Application | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [jobseekerToArchive, setJobseekerToArchive] =
    useState<Application | null>(null);

  const handleViewDetails = (application: Application) => {
    setSelectedJobseeker(application);
    setShowManageJobseeker(true);
  };

  const handleArchiveClick = (application: Application) => {
    setJobseekerToArchive(application);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    if (!jobseekerToArchive) return;

    try {
      // TODO: Implement archive API call
      console.log("Archiving jobseeker:", jobseekerToArchive.applicant.id);
      setShowArchiveModal(false);
      setJobseekerToArchive(null);
      // Refresh data after archiving
      window.location.reload();
    } catch (error) {
      console.error("Failed to archive jobseeker:", error);
    }
  };

  const handleCancelArchive = () => {
    setShowArchiveModal(false);
    setJobseekerToArchive(null);
  };

  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  if (showManageJobseeker && selectedJobseeker) {
    return (
      <section className={styles.manageJobseeker}>
        <BackButton onClick={() => setShowManageJobseeker(false)} />
        <ManageJobseeker
          jobseeker={{
            id: selectedJobseeker.applicant.id,
            applicant: selectedJobseeker.applicant,
            resume: selectedJobseeker.resume,
          }}
        />
      </section>
    );
  }

  return (
    <section className={styles.jobseekers}>
      <div className={styles.top}>
        <JobseekerStatsHeader
          totalJobseekers={uniqueApplicants.length}
          activeApplications={activeApplicationsCount}
        />
        <JobseekerSearchBar search={search} setSearch={setSearch} />
        <JobseekerSortDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Jobseekers
          <span className={styles.tabCount}>({sortedApplications.length})</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "archived" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("archived")}
        >
          Archived
          <span className={styles.tabCount}>(0)</span>
        </button>
      </div>

      {activeTab === "active" ? (
        <JobseekerTable
          applications={sortedApplications}
          onViewDetails={handleViewDetails}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onArchive={handleArchiveClick}
        />
      ) : (
        <div className={styles.archivedView}>
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
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            <h3>No archived jobseekers</h3>
            <p>Archived jobseekers will appear here</p>
          </div>
        </div>
      )}

      {showArchiveModal && jobseekerToArchive && (
        <ArchiveJobseekerModal
          jobseekerName={jobseekerToArchive.applicant.name}
          onConfirm={handleConfirmArchive}
          onCancel={handleCancelArchive}
        />
      )}
    </section>
  );
};

export default Jobseekers;
