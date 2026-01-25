"use client";

import React, { useEffect, useState } from "react";
import styles from "./CompanyProfiles.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import { useCompanyData } from "../hooks/useCompanyData";
import { useCompanyActions } from "../hooks/useCompanyActions";
import CompanyStatsHeader from "./list/CompanyStatsHeader";
import CompanySearchBar from "./list/CompanySearchBar";
import CompanyTable from "./list/CompanyTable";
import CompanyDetailsView from "./details/CompanyDetailsView";
import CreateCompany from "./CreateCompany";
import ManageCompany from "./ManageCompany";
import BackButton from "./shared/BackButton";
import { Exam, CompanyWithStats } from "../types/company.types";

const CompanyProfiles = () => {
  const {
    filteredCompanies,
    totalJobsAllCompanies,
    loading,
    search,
    setSearch,
    fetchCompanies,
  } = useCompanyData();

  const {
    showCreateCompany,
    setShowCreateCompany,
    showManageCompany,
    setShowManageCompany,
    showCompanyDetails,
    selectedCompany,
    handleViewCompany,
    handleManageCompany,
    handleCloseAll,
  } = useCompanyActions(fetchCompanies);

  const [exams, setExams] = useState<Exam | null>(null);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => setExams(data[0] || null));
  }, []);

  // Loading state
  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  // Manage Company View
  if (showManageCompany && exams && selectedCompany) {
    return (
      <section className={styles.createCompany}>
        <BackButton onClick={() => setShowManageCompany(false)} />
        <ManageCompany
          company={
            {
              ...selectedCompany,
              totalJobsAllCompanies,
            } as CompanyWithStats
          }
          onJobsUpdated={fetchCompanies}
        />
      </section>
    );
  }

  // Create Company View
  if (showCreateCompany) {
    return (
      <section className={styles.createCompany}>
        <BackButton onClick={() => setShowCreateCompany(false)} />
        <CreateCompany />
      </section>
    );
  }

  // Company Details View
  if (showCompanyDetails && selectedCompany) {
    return (
      <CompanyDetailsView company={selectedCompany} onBack={handleCloseAll} />
    );
  }

  // Main List View
  return (
    <section className={styles.companyProfiles}>
      <div className={styles.top}>
        <CompanyStatsHeader
          totalCompanies={filteredCompanies.length}
          totalJobVacancies={totalJobsAllCompanies}
        />

        <CompanySearchBar
          search={search}
          setSearch={setSearch}
          onAddCompany={() => setShowCreateCompany(true)}
        />
      </div>

      <CompanyTable
        companies={filteredCompanies}
        onViewCompany={handleViewCompany}
        onManageCompany={handleManageCompany}
      />
    </section>
  );
};

export default CompanyProfiles;
