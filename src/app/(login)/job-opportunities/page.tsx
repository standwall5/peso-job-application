"use client";
import React, { useState, useEffect } from "react";
import styles from "./JobHome.module.css";
import Link from "next/link";

async function fetchData() {
  const response = await fetch("http://localhost:5000/jobs?_expand=company", {
    method: "GET",
    cache: "no-store",
  });
  return response.json();
}

const Companies = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAll() {
      const [companiesRes, jobsRes] = await Promise.all([
        fetch("http://localhost:5000/companies"),
        fetch("http://localhost:5000/jobs"),
      ]);
      const companiesData = await companiesRes.json();
      const jobsData = await jobsRes.json();
      setCompanies(companiesData);
      setJobs(jobsData);
    }
    fetchAll();
  }, []);

  const getJobCount = (companyId: number) =>
    jobs.filter((job: any) => job.companyId === companyId).length;
  const getManpowerCount = (companyId: number) =>
    jobs
      .filter((job: any) => job.companyId === companyId)
      .reduce((sum: number, job: any) => sum + (job.manpowerNeeded || 0), 0);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase()) ||
      company.location.toLowerCase().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className={styles.section}>
      <header className={styles.welcomeSearch}>
        <h2>Welcome to PESO Paranaque</h2>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search jobs here..."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>
      <div className={styles.jobList}>
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company: any) => (
            <Link key={company.id} href={`/job-opportunities/${company.id}`}>
              <div key={company.id} className={styles.jobCard}>
                <div className={styles.jobCompany}>
                  <div className={`${styles.manpowerCount} ${styles.jobStats}`}>
                    <h3>{getManpowerCount(company.id)}</h3>
                    <p>MANPOWER NEEDS</p>
                  </div>
                  <div className={styles.companyLogoContainer}>
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={company.name + " logo"}
                        className={styles.companyLogo}
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    )}
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

export default Companies;
