"use client";
import React, { useState, useEffect } from "react";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import BlocksWave from "@/components/BlocksWave";
import SortCompany, { SortOption } from "./sort/SortCompany";
import { sortCompanies } from "../utils/sortCompanies";

interface Job {
  id: number;
  company_id: number;
  manpower_needed?: number;
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
  initialCompanies: Company[];
  initialJobs: Job[];
  searchParent: string;
}

const PublicCompanyList = ({
  initialCompanies,
  initialJobs,
  searchParent,
}: PublicCompanyListProps) => {
  const [jobs] = useState<Job[]>(initialJobs);
  const [companies] = useState<Company[]>(initialCompanies);
  const [search, setSearch] = useState(searchParent || "");
  const [loading] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 5 columns x 2 rows

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

  // Pagination calculations
  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOption]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      <div className={styles.jobList}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
              width: "100%",
            }}
          >
            <BlocksWave />
          </div>
        ) : paginatedCompanies.length > 0 ? (
          paginatedCompanies.map((company) => (
            <a key={company.id} href={`/job-opportunities/${company.id}`}>
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
            </a>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>

      {sortedCompanies.length > 0 && totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.activePage : ""
              }`}
              disabled={currentPage === page}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicCompanyList;
