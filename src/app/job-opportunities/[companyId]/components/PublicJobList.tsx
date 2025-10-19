"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";
import { createClient } from "@/utils/supabase/client";

// TODO: implement login redirect when clicking apply; remove modal

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  company?: {
    name: string;
    logo: string | null;
  };
  companies?: {
    name: string;
    logo: string | null;
  };
}

const PublicJobList = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loginModal, setLoginModal] = useState(false);
  // const [loginModal, setLoginModal] = useState<any | null>(null);
  // const [applicationSelect, setApplicationSelect] = useState("previewResume");

  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await fetch(
  //       `http://localhost:5000/jobs?companyId=${companyId}&_expand=company`,
  //       {
  //         method: "GET",
  //         cache: "no-store",
  //       }
  //     );
  //     const data = await response.json();
  //     setJobs(data);
  //   }
  //   if (companyId) fetchData();
  // }, [companyId]);

  // const filteredJobs = jobs.filter(
  //   (job) =>
  //     job.title.toLowerCase().includes(search.toLowerCase()) ||
  //     job.description.toLowerCase().includes(search.toLowerCase())
  // );

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
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`${styles.jobCard} ${jobStyle.jobSpecificCard}`}
              onClick={() => setLoginModal(true)}
            >
              <div
                className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
              >
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
      {loginModal && (
        <div
          className={jobStyle.modalOverlay}
          onClick={() => setLoginModal(false)}
        >
          <div
            className={`${jobStyle.modal} ${jobStyle.warningModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLoginModal(false)}
              style={{ fontWeight: "bold", right: 40, position: "absolute" }}
            >
              X
            </button>
            <div className={jobStyle.warningContainer}>
              <h2>Log in to Apply</h2>
              <div className={jobStyle.warningContent}>
                <p>
                  To submit your application, <br /> please sign in first to
                  proceed.
                </p>
                <button className="custom-button">Login</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PublicJobList;
