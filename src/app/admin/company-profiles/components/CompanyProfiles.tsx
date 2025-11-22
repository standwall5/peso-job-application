"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";
import styles from "@/app/admin/company-profiles/components/CompanyProfiles.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import CreateCompany from "./CreateCompany";
import ManageCompany from "./ManageCompany";

// ================== Interfaces ==================

interface Companies {
  id: number;
  name: string;
  location: string;
  industry: string;
  website: string;
  logo: string;
  contact_email: string;
  description: string;
  totalManpower: number;
  jobs: {
    id: number;
    company_id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  }[];
  totalJobsPosted: number;
  totalJobsAllCompanies: number;
}

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface Exam {
  id: number;
  title: string;
  description: string;
}

type ExamType = Exam[];

const CompanyProfiles = () => {
  // ================== State ==================

  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Companies[]>([]);
  const [totalJobsAllCompanies, setTotalJobsAllCompanies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showManageCompany, setShowManageCompany] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Companies | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const router = useRouter();
  const [exams, setExams] = useState<ExamType | null>(null);

  // ================== Handlers ==================

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch("/api/getCompaniesAdmin");
      const data = await response.json();
      setCompanies(Array.isArray(data.companies) ? data.companies : []);
      setTotalJobsAllCompanies(data.totalJobsAllCompanies ?? 0);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => setExams(data[0] || null)); // Assuming API returns an array
  }, []);

  const filteredCompanies = (companies ?? []).filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.location.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase()) ||
      company.totalManpower.toString().includes(search.toLowerCase()) ||
      company.totalJobsPosted.toString().includes(search.toLowerCase()) ||
      company.description.toLowerCase().includes(search.toLowerCase()),
  );

  // ================== Render ==================

  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  if (showManageCompany && exams && selectedCompany) {
    return (
      <section className={styles.createCompany}>
        <button
          onClick={() => setShowManageCompany(false)}
          className={styles.back}
        >
          <div className={styles.backIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </div>
          <span>BACK</span>
        </button>
        <ManageCompany company={selectedCompany} exam={exams} />
      </section>
    );
  }

  if (showCreateCompany) {
    return (
      <section className={styles.createCompany}>
        <button
          onClick={() => setShowCreateCompany(false)}
          className={styles.back}
        >
          <div className={styles.backIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </div>
          <span>BACK</span>
        </button>
        <CreateCompany />
      </section>
    );
  }

  if (showCompany && selectedCompany) {
    return (
      <section className={styles.specificCompany}>
        <button
          onClick={() => setSelectedCompany(null)}
          className={styles.back}
        >
          <div className={styles.backIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </div>
          <span>BACK</span>
        </button>
        {/* Render your company details here */}
        <div className={styles.companyDetails}>
          <div className={styles.companyLogoDiv}>
            <span>
              Manpower Needed: <br />
              <span>{selectedCompany.totalManpower}</span>
            </span>
            <img src={selectedCompany.logo} />
            <span>
              Job Vacancies: <br />
              <span>{selectedCompany.totalJobsPosted}</span>
            </span>
          </div>
          <h2>
            <strong>{selectedCompany.name}</strong>
          </h2>
          <span>{selectedCompany.location}</span>
          <span>{selectedCompany.description}</span>
        </div>
        <div className={styles.jobsPosted}>
          <h2>Jobs Posted</h2>
          {selectedCompany.jobs.length > 0 ? (
            selectedCompany.jobs.map((job) => (
              <div
                key={job.id}
                className={`${styles.jobCard} ${jobStyle.applicationJobCompany}`}
                onClick={() =>
                  setSelectedJob({
                    id: job.id,
                    title: job.title,
                    description: "",
                    place_of_assignment: job.place_of_assignment ?? "",
                    sex: job.sex,
                    education: job.education,
                    eligibility: job.eligibility,
                    posted_date: job.posted_date,
                    companies: {
                      name: selectedCompany.name,
                      logo: selectedCompany.logo ?? null,
                    },
                  })
                }
              >
                <div
                  className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
                >
                  {selectedCompany.logo && (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name + " logo"}
                      className={styles.companyLogo}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <span>{selectedCompany.name}</span>
                </div>
                <div className={jobStyle.jobDetails}>
                  <h2>{job.title}</h2>
                  <p>{job.place_of_assignment}</p>
                  <p>{job.sex}</p>
                  <p>{job.education}</p>
                  <p>{job.eligibility}</p>
                  <p>
                    {new Date(job.posted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div>No jobs posted</div>
          )}
        </div>
        {/* ...other details... */}
      </section>
    );
  }

  return (
    <section className={styles.companyProfiles}>
      <div className={styles.top}>
        {/* Total jobs etc. */}
        <div className={styles.totalStatistics}>
          <strong>TOTAL OF COMPANIES: {companies.length}</strong>
          <strong>TOTAL OF JOB VACANCIES: {totalJobsAllCompanies}</strong>
        </div>

        {/* Search */}
        {/* <div className={styles.searchContainer}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search name, gender, place of assignment, etc."
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.searchIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div> */}

        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search name, gender, place of assignment, etc."
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Add company, sort */}
        <div className={styles.topRight}>
          <div
            className={styles.addCompany}
            onClick={() => setShowCreateCompany(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            <button>ADD COMPANY</button>
          </div>
        </div>
      </div>

      {/* Jobseekers List */}
      <div className={styles.jobseekersTable}>
        {filteredCompanies.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.jobseekersDetailsHeader}>
                <div>COMPANY NAME</div>
                <div>PLACE OF ASSIGNMENT</div>
                <div>JOBS POSTED</div>
                <div>MANPOWER NEEDED</div>
                <div>STATUS</div>
              </div>
              <div>ABOUT COMPANY</div>
              <div>SELECT</div>
            </div>
            {filteredCompanies.map((company) => (
              <div className={styles.tableRow} key={company.id}>
                <div
                  className={styles.jobseekersDetails}
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowCompany(true);
                  }}
                >
                  <div className={styles.avatarCell}>
                    <img
                      src={company.logo ?? "/assets/images/default_profile.png"}
                      alt={company.name}
                      className={styles.avatar}
                    />
                    <span>{company.name}</span>
                  </div>
                  <div>{company.location}</div>
                  <div>{company.totalJobsPosted}</div>
                  <div>{company.totalManpower}</div>

                  <div className={styles.status}>
                    <span className={`${styles.status} ${styles.active}`}>
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    className={styles.detailsBtn}
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowManageCompany(true);
                      setShowCompany(false);
                    }}
                  >
                    Manage Details
                  </button>
                </div>
                <div className={styles.checkbox}>
                  <input type="checkbox" />
                </div>
              </div>
            ))}
          </>
        ) : (
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
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <h3>No Companies found.</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyProfiles;
