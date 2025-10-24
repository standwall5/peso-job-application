"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";
import BlocksWave from "@/components/BlocksWave";

import { createClient } from "@/utils/supabase/client";
import UserProfile from "@/app/profile/components/UserProfile";
import Link from "next/link";

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

const PrivateJobList = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationSelect, setApplicationSelect] = useState("previewResume");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const [userApplications, setUserApplications] = useState<number[]>([]);
  async function fetchUserApplications() {
    try {
      const res = await fetch("/api/getUserApplications");
      const data = await res.json();
      // data is an array of { job_id: number }
      setUserApplications(data.map((app: { job_id: number }) => app.job_id));
    } catch (err) {
      console.log("Error: " + err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchUserApplications();
  }, []);

  const submitResume = async (job_id: any) => {
    const response = await fetch("/api/submitResume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_id: job_id,
      }),
    });

    const result = await response.json();
    console.log(result);

    fetchUserApplications();
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <BlocksWave />;
  }

  const jobCards = filteredJobs.map((job) => {
    const hasApplied = userApplications.includes(job.id);
    return (
      <div
        key={job.id}
        className={`${styles.jobCard} ${jobStyle.jobSpecificCard}`}
        onClick={() => setSelectedJob(job)}
      >
        <div className={`${styles.jobCompany} ${jobStyle.companyInformation}`}>
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

          <button className="green-button">
            {hasApplied ? "Applied" : "Apply"}
          </button>
        </div>
      </div>
    );
  });

  return (
    <section className={styles.section}>
      <div className={styles.jobList}>
        {jobCards.length > 0 ? jobCards : <p>No jobs found.</p>}
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
                  <div className={`${jobStyle.applicantDetail}`}>
                    {/* Render resume preview content here */}

                    <div className={jobStyle.applicantDetailResume}>
                      <UserProfile />
                    </div>
                    <div className={jobStyle.applicantDetailButtons}>
                      {!userApplications.includes(selectedJob.id) ? (
                        <>
                          <button
                            className="green-button"
                            onClick={() => submitResume(selectedJob.id)}
                          >
                            Submit
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            className="blue-button"
                            href="/profile"
                            style={{ color: "white" }}
                          >
                            Edit
                          </Link>
                          <button disabled className="green-button">
                            Submitted
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {applicationSelect === "exam" &&
                userApplications.includes(selectedJob.id) ? (
                  <div className={jobStyle.applicantDetail}>
                    {/* Render exam content here */}
                    <p>Exam section for this job/applicant.</p>
                  </div>
                ) : (
                  applicationSelect === "exam" && (
                    <div
                      className={jobStyle.modalOverlay}
                      onClick={() => {
                        setModal(false);
                        setApplicationSelect("previewResume");
                      }}
                    >
                      <div
                        className={`warningModal`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setModal(false);
                          }}
                          style={{
                            fontWeight: "bold",
                            right: 40,
                            position: "absolute",
                          }}
                        >
                          X
                        </button>
                        <div className="warningContainer">
                          <h2>Please submit resume to continue with exam</h2>
                          <div className="warningContent">
                            <button className="custom-button">Login</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
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
