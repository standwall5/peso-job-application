"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";

import { createClient } from "@/utils/supabase/client";

const PrivateJobList = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicationSelect, setApplicationSelect] = useState("previewResume");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      // Fetch jobs for this company, including company details
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(*)")
        .eq("company_id", companyId);

      if (error) {
        // handle error (optional)
        console.log(error);
        setJobs([]);
        return;
      }
      setJobs(data || []);
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
              className={`${styles.jobCard} ${jobStyle.jobSpecificCard}`}
              onClick={() => setSelectedJob(job)}
            >
              <div
                className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
              >
                {job.companies?.logo && (
                  <img
                    src={job.companies.logo}
                    alt={job.companies.name + " logo"}
                    className={styles.companyLogo}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <span>{job.companies?.name}</span>
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
                <button className="green-button">Apply</button>
              </div>
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
          <div
            className={`${jobStyle.modal} ${jobStyle.applicationModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedJob(null)}
              style={{ fontWeight: "bold", right: 40, position: "absolute" }}
            >
              X
            </button>
            <div className={jobStyle.applicationContainer}>
              <div
                key={selectedJob.id}
                className={`${styles.jobCard} ${jobStyle.applicationJobCompany}`}
                onClick={() => setSelectedJob(selectedJob)}
              >
                <div
                  className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
                >
                  {selectedJob.companies?.logo && (
                    <img
                      src={selectedJob.companies.logo}
                      alt={selectedJob.companies.name + " logo"}
                      className={styles.companyLogo}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <span>{selectedJob.companies?.name}</span>
                </div>
                <div className={jobStyle.jobDetails}>
                  <h2>{selectedJob.title}</h2>
                  <p>{selectedJob.place_of_assignment}</p>
                  <p>{selectedJob.sex}</p>
                  <p>{selectedJob.education}</p>
                  <p>{selectedJob.eligibility}</p>
                  <p>
                    {new Date(selectedJob.posted_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
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
                {applicationSelect === "previewResume" && (
                  <div className={jobStyle.applicantDetail}>
                    {/* Render resume preview content here */}
                    <p>Resume preview for this job/applicant.</p>
                  </div>
                )}
                {applicationSelect === "exam" && (
                  <div className={jobStyle.applicantDetail}>
                    {/* Render exam content here */}
                    <p>Exam section for this job/applicant.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PrivateJobList;
