"use client";

import React, { useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import ManageJobseeker from "@/app/admin/jobseekers/components/ManageJobseeker";
import { useDeployedJobseekerData } from "../hooks/useDeployedJobseekerData";
import { Application } from "@/app/admin/jobseekers/types/jobseeker.types";
import JobseekerStatsHeader from "@/app/admin/jobseekers/components/list/JobseekerStatsHeader";
import JobseekerSearchBar from "@/app/admin/jobseekers/components/list/JobseekerSearchBar";
import JobseekerTable from "@/app/admin/jobseekers/components/list/JobseekerTable";
import BackButton from "@/app/admin/jobseekers/components/shared/BackButton";

const DeployedJobseekers = () => {
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
  } = useDeployedJobseekerData();

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

  const handleMarkAsNotDeployedSelected = async () => {
    if (selectedJobseekers.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to mark ${selectedJobseekers.length} jobseeker(s) as not deployed?`,
      )
    )
      return;

    try {
      for (const applicantId of selectedJobseekers) {
        await fetch("/api/deployJobseeker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantId: applicantId,
            deployed: false,
          }),
        });
      }
      setSelectedJobseekers([]);
      alert("Selected jobseekers marked as not deployed successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error marking jobseekers as not deployed:", error);
      alert(
        "Failed to mark some jobseekers as not deployed. Please try again.",
      );
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
          isArchived={false}
        />
        <JobseekerSearchBar
          search={search}
          setSearch={setSearch}
          selectedCount={selectedJobseekers.length}
          onSelectAll={handleSelectAll}
          onArchiveSelected={handleMarkAsNotDeployedSelected}
          isArchived={false}
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
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
              />
            </svg>
            <h3>No deployed jobseekers</h3>
            <p>Deployed jobseekers will appear here</p>
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
          onArchiveSelected={handleMarkAsNotDeployedSelected}
        />
      )}
    </section>
  );
};

export default DeployedJobseekers;
