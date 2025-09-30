"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "../page.module.css";

const Page = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `http://localhost:5000/jobs?companyId=${companyId}&_expand=company`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const data = await response.json();
      setJobs(data);
    }
    if (companyId) fetchData();
  }, [companyId]);

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
              <div className={styles.jobCompany}>
                {job.company?.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name + " logo"}
                    className={styles.companyLogo}
                    style={{
                      width: "64px",
                      height: "64px",
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
