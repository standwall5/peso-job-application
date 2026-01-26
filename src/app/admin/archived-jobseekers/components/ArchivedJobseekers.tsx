"use client";

import React, { useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import ManageJobseeker from "@/app/admin/jobseekers/components/ManageJobseeker";
import { useArchivedJobseekerData } from "../hooks/useArchivedJobseekerData";
import { Application } from "@/app/admin/jobseekers/types/jobseeker.types";
import JobseekerStatsHeader from "@/app/admin/jobseekers/components/list/JobseekerStatsHeader";
import JobseekerSearchBar from "@/app/admin/jobseekers/components/list/JobseekerSearchBar";
import JobseekerTable from "@/app/admin/jobseekers/components/list/JobseekerTable";
import BackButton from "@/app/admin/jobseekers/components/shared/BackButton";

const ArchivedJobseekers = () => {
  const {
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    uniqueApplicants,
    sortedApplications,
    selectedApplicantTypes,
    setSelectedApplicantTypes,
    selectedPlaces,
    setSelectedPlaces,
  } = useArchivedJobseekerData();

  const [showManageJobseeker, setShowManageJobseeker] = useState(false);
  const [selectedJobseeker, setSelectedJobseeker] =
    useState<Application | null>(null);
  const [selectedJobseekers, setSelectedJobseekers] = useState<number[]>([]);

  const handleViewDetails = (application: Application) => {
    setSelectedJobseeker(application);
    setShowManageJobseeker(true);
  };

  const handleSelectAll = () => {
    if (selectedJobseekers.length === sortedApplications.length) {
      setSelectedJobseekers([]);
    } else {
      setSelectedJobseekers(sortedApplications.map((app) => app.applicant.id));
    }
  };

  const handleToggleSelect = (applicantId: number) => {
    setSelectedJobseekers((prev) =>
      prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId],
    );
  };

  const handleUnarchiveSelected = async () => {
    if (selectedJobseekers.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to unarchive ${selectedJobseekers.length} jobseeker(s)?`,
      )
    )
      return;

    try {
      for (const applicantId of selectedJobseekers) {
        await fetch("/api/archiveJobseeker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantId: applicantId,
            isArchived: false,
          }),
        });
      }
      setSelectedJobseekers([]);
      alert("Selected jobseekers unarchived successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error unarchiving jobseekers:", error);
      alert("Failed to unarchive some jobseekers. Please try again.");
    }
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
          activeApplications={0}
          isArchived={true}
        />
        <JobseekerSearchBar
          search={search}
          setSearch={setSearch}
          selectedCount={selectedJobseekers.length}
          onSelectAll={handleSelectAll}
          onArchiveSelected={handleUnarchiveSelected}
          isArchived={true}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedApplicantTypes={selectedApplicantTypes}
          setSelectedApplicantTypes={setSelectedApplicantTypes}
          selectedPlaces={selectedPlaces}
          setSelectedPlaces={setSelectedPlaces}
        />
      </div>

      {sortedApplications.length === 0 ? (
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
      ) : (
        <JobseekerTable
          applications={sortedApplications}
          onViewDetails={handleViewDetails}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedJobseekers={selectedJobseekers}
          onToggleSelect={handleToggleSelect}
          selectedCount={selectedJobseekers.length}
          onSelectAll={handleSelectAll}
          onArchiveSelected={handleUnarchiveSelected}
          isArchived={true}
        />
      )}
    </section>
  );
};

export default ArchivedJobseekers;
