"use client";
import React, { useState, useEffect } from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import privateStyles from "@app/job-opportunities/components/PrivateCompanyList.module.css";
import Link from "next/link";
import BlocksWave from "@/components/BlocksWave";

interface Job {
  id: number;
  company_id: number;
  manpower_needed: number;
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  industry: string;
  location: string;
}

interface PublicCompanyListProps {
  searchParent: string;
  onSearchChange?: (value: string) => void;
}

const PrivateCompanyList = ({
  searchParent,
  onSearchChange,
}: PublicCompanyListProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParent || "");

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

  return (
    <section className={styles.section}>
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
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
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

export default PrivateCompanyList;
