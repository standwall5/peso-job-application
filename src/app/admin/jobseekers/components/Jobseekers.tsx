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
  } = useJobseekerData();

  const [showManageJobseeker, setShowManageJobseeker] = useState(false);
  const [selectedJobseeker, setSelectedJobseeker] =
    useState<Application | null>(null);

  const handleViewDetails = (application: Application) => {
    setSelectedJobseeker(application);
    setShowManageJobseeker(true);
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

      <JobseekerTable
        applications={sortedApplications}
        onViewDetails={handleViewDetails}
      />
    </section>
  );
};

export default Jobseekers;
