"use client";
import React, { useState, useEffect } from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import Link from "next/link";
import BlocksWave from "@/components/BlocksWave";
import SortCompany, { SortOption } from "./sort/SortCompany";
import { sortCompanies } from "../utils/sortCompanies";

interface Job {
  id: number;
  company_id: number;
  manpower_needed: number;
  posted_date: string | null;
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  industry: string;
  location: string;
  description: string;
}

interface PublicCompanyListProps {
  searchParent: string;
  onSearchChange?: (value: string) => void;
}

const PublicCompanyList = ({
  searchParent,
  onSearchChange,
}: PublicCompanyListProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState(searchParent || "");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  useEffect(() => {
    async function fetchAll() {
      try {
        const companiesRes = await fetch("/api/getCompanies");
        const jobsRes = await fetch("/api/getJobs");
        const companiesData = await companiesRes.json();
        const jobsData = await jobsRes.json();

        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (err) {
        console.error("Fetch failed:", err);
        setCompanies([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const getJobCount = (companyId: number) =>
    jobs.filter((job) => job.company_id === companyId).length;
  const getManpowerCount = (companyId: number) =>
    jobs
      .filter((job) => job.company_id === companyId)
      .reduce((sum, job) => sum + (job.manpower_needed || 0), 0);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase()) ||
      company.location.toLowerCase().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedCompanies = sortCompanies(filteredCompanies, jobs, sortOption);

  return (
    <section className={styles.section}>
      <header className={styles.welcomeSearch}>
        <span>
          <img src="/assets/pesoLogo.png" alt="PESO Paranaque" />
          <h2>Welcome to PESO Parañaque</h2>
        </span>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search jobs here..."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <SortCompany currentSort={sortOption} onSortChange={setSortOption} />

      <div
        className={styles.jobList}
        style={
          loading
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "60vh",
                width: "100%",
              }
            : undefined
        }
      >
        {loading ? (
          <BlocksWave />
        ) : sortedCompanies.length > 0 ? (
          sortedCompanies.map((company) => (
            <Link key={company.id} href={`/job-opportunities/${company.id}`}>
              <div key={company.id} className={styles.jobCard}>
                <div className={styles.jobCompany}>
                  <div className={`${styles.manpowerCount} ${styles.jobStats}`}>
                    <h3>{getManpowerCount(company.id)}</h3>
                    <p>MANPOWER NEEDS</p>
                  </div>
                  <div className={styles.companyLogoContainer}>
                    <img
                      src={company.logo || "/assets/images/default_profile.png"}
                      alt={company.name + " logo"}
                      className={styles.companyLogo}
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className={`${styles.jobCount} ${styles.jobStats}`}>
                    <h3>{getJobCount(company.id)}</h3>
                    <p>JOBS POSTED</p>
                  </div>
                </div>
                <div className={styles.companyInfo}>
                  <h3>{company.name}</h3>
                  <p>{company.description}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </section>
  );
};

export default PublicCompanyList;
