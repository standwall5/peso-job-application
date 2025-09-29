"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

async function fetchData() {
  const response = await fetch("http://localhost:5000/jobs?_expand=company", {
    method: "GET",
    cache: "no-store",
  });
  return response.json();
}

const Page = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData().then(setJobs);
  }, []); // fetch only once

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className={styles.section}>
      <div className={styles.jobList}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job: any) => (
            <div key={job.id} className={styles.jobCard}>
              <div className="jobCompany">
                {job.company?.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name + " logo"}
                    className={styles.companyLogo}
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <span>{job.company?.name}</span>
              </div>
              <h2>{job.title}</h2>
              <p>{job.description}</p>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </section>
  );
};

export default Page;
