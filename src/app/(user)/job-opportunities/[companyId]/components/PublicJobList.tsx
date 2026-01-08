"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "../JobsOfCompany.module.css";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Button from "@/components/Button";
import { Job } from "../types/job.types";
import SortJobs, { JobSortOption } from "../components/sort/SortJobs";
import { sortJobs } from "../utils/sortJobs";
import Breadcrumbs from "@/components/Breadcrumbs";
import JobListCard from "@/components/jobs/JobListCard";

const PublicJobList = () => {
  const params = useParams();
  const companyId = params.companyId || params.id;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loginModal, setLoginModal] = useState(false);
  const [sortOption, setSortOption] = useState<JobSortOption>("recent");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

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

  // Fetch company info for header
  useEffect(() => {
    async function fetchCompanyInfo() {
      if (!companyId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("name, logo")
        .eq("id", companyId)
        .single();

      if (data && !error) {
        setCompanyName(data.name);
        setCompanyLogo(data.logo);
      }
    }

    fetchCompanyInfo();
  }, [companyId]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedJobs = sortJobs(filteredJobs, sortOption);

  return (
    <section className={styles.section}>
      {/* Search Bar */}
      <div className={jobStyle.searchContainer}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={jobStyle.searchInput}
        />
      </div>

      <div className={styles.listHeader}>
        <Breadcrumbs
          customLabels={{
            "job-opportunities": "Job Opportunities",
            [companyId as string]: companyName || (companyId as string),
          }}
        />
        <SortJobs currentSort={sortOption} onSortChange={setSortOption} />
      </div>

      <h2 className={jobStyle.jobsTitle}>Jobs</h2>

      <div className={styles.jobList}>
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <JobListCard
              key={job.id}
              job={job}
              showSkillMatch={false}
              showApplyButton={true}
              onClick={() => setLoginModal(true)}
            />
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
