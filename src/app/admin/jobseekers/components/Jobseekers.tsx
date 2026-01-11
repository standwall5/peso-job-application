"use client";

import React, { useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import ManageJobseeker from "./ManageJobseeker";
import { useJobseekerData } from "../hooks/useJobseekerData";
import { Application } from "../types/jobseeker.types";
import JobseekerStatsHeader from "./list/JobseekerStatsHeader";
import JobseekerSearchBar from "./list/JobseekerSearchBar";
import JobseekerTable from "./list/JobseekerTable";
import BackButton from "./shared/BackButton";

const Jobseekers = () => {
  const {
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    uniqueApplicants,
    sortedApplications,
    activeApplicationsCount,
    selectedApplicantTypes,
    setSelectedApplicantTypes,
    selectedPlaces,
    setSelectedPlaces,
  } = useJobseekerData();

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

  const handleArchiveSelected = async () => {
    if (selectedJobseekers.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to archive ${selectedJobseekers.length} jobseeker(s)?`,
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
            isArchived: true,
          }),
        });
      }
      setSelectedJobseekers([]);
      alert("Selected jobseekers archived successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error archiving jobseekers:", error);
      alert("Failed to archive some jobseekers. Please try again.");
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
          activeApplications={activeApplicationsCount}
        />
        <JobseekerSearchBar
          search={search}
          setSearch={setSearch}
          selectedCount={selectedJobseekers.length}
          onSelectAll={handleSelectAll}
          onArchiveSelected={handleArchiveSelected}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedApplicantTypes={selectedApplicantTypes}
          setSelectedApplicantTypes={setSelectedApplicantTypes}
          selectedPlaces={selectedPlaces}
          setSelectedPlaces={setSelectedPlaces}
        />
      </div>

      <JobseekerTable
        applications={sortedApplications}
        onViewDetails={handleViewDetails}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedJobseekers={selectedJobseekers}
        onToggleSelect={handleToggleSelect}
      />
    </section>
  );
};

export default Jobseekers;
