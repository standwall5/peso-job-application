"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Button from "@/components/Button";
import { Job } from "../types/job.types";
import SortJobs, { JobSortOption } from "../components/sort/SortJobs";
import { sortJobs } from "../utils/sortJobs";

const PublicJobList = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loginModal, setLoginModal] = useState(false);
  const [sortOption, setSortOption] = useState<JobSortOption>("recent");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      // Fetch jobs for this company, including company details
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(*)")
        .eq("company_id", companyId);

      if (error) {
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
      job.description.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedJobs = sortJobs(filteredJobs, sortOption);

  return (
    <section className={styles.section}>
      <div className={styles.sort}>
        <SortJobs currentSort={sortOption} onSortChange={setSortOption} />
      </div>
      <div className={styles.jobList}>
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <div
              key={job.id}
              className={`${styles.jobCard} ${jobStyle.jobSpecificCard}`}
              onClick={() => setLoginModal(true)}
            >
              <div
                className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
              >
                <img
                  src={
                    job.companies?.logo || "/assets/images/default_profile.png"
                  }
                  alt={job.companies?.name + " logo"}
                  className={styles.companyLogo}
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "contain",
                  }}
                />
                <span>{job.companies?.name}</span>
              </div>
              <div className={jobStyle.jobDetails}>
                <h2>{job.title}</h2>
                <p>{job.place_of_assignment}</p>
                <p>{job.sex}</p>
                <p>{job.education}</p>
                <p>{job.eligibility}</p>
                <p>
                  {job.posted_date
                    ? new Date(job.posted_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No date"}
                </p>

                <Button variant="success">Apply</Button>
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
            className={`${jobStyle.modal} warningModal`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLoginModal(false)}
              style={{ fontWeight: "bold", right: 30, position: "absolute" }}
            >
              X
            </button>
            <div className="warningContainer">
              <h2>Log in to Apply</h2>
              <div className="warningContent">
                <p>
                  To submit your application, <br /> please sign in first to
                  proceed.
                </p>
                <Link href="/login">
                  <Button variant="primary">Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PublicJobList;
