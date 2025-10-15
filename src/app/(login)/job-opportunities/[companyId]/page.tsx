"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "../JobHome.module.css";
import jobStyle from "./JobsOfCompany.module.css";

const JobsOfCompany = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicationSelect, setApplicationSelect] = useState("");

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
            <div
              key={job.id}
              className={styles.jobCard}
              onClick={() => setSelectedJob(job)}
            >
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
      {selectedJob && (
        <div
          className={jobStyle.modalOverlay}
          onClick={() => setSelectedJob(null)}
        >
          <div className={jobStyle.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedJob(null)}>Close</button>
            <div className={jobStyle.applicationContainer}>
              <div
                key={selectedJob.id}
                className={`${styles.jobCard} ${jobStyle.applicationCompany}`}
                onClick={() => setSelectedJob(selectedJob)}
              >
                <div className={`${styles.jobCompany}`}>
                  {selectedJob.company?.logo && (
                    <img
                      src={selectedJob.company.logo}
                      alt={selectedJob.company.name + " logo"}
                      className={styles.companyLogo}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <span>{selectedJob.company?.name}</span>
                </div>
                <h2>{selectedJob.title}</h2>
                <p>{selectedJob.description}</p>
              </div>

              {/* Questions */}
              <div className={jobStyle.applicationDetails}>
                <ul className={jobStyle.applicationNav}>
                  <li
                    className={
                      applicationSelect === "previewResume"
                        ? jobStyle.active
                        : ""
                    }
                    onClick={() => setApplicationSelect("previewResume")}
                  >
                    Preview Resume
                  </li>
                  <li
                    className={
                      applicationSelect === "exam" ? jobStyle.active : ""
                    }
                    onClick={() => setApplicationSelect("exam")}
                  >
                    Exam
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobsOfCompany;
