"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import ManageJobseeker from "./ManageJobseeker";

interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  description?: string;
}

interface Education {
  school?: string;
  degree?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

interface SelectedResume {
  profile_pic_url: string | null;
  applicant: {
    name: string;
    birth_date: string;
    address: string;
    barangay: string;
    district: string;
    email: string;
    phone: string;
    preferred_poa?: string;
    applicant_type?: string;
  };
  company: {
    id: number;
    name: string;
    logo?: string | null;
  };
  job: {
    id?: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  };
  education: Education;
  skills: string[] | string;
  work_experiences: WorkExperience[];
  profile_introduction?: string;
}

interface Application {
  id: number;
  name: string;
  type: string;
  place: string;
  date: string;
  status: string;
  resume: SelectedResume | null;
  avatar: string;
  selected: boolean;
  applied_date?: string;
  applicant: {
    id: number;
    name: string;
    birth_date: string;
    age: number;
    address: string;
    sex: string;
    barangay: string;
    district: string;
    email: string;
    phone: string;
    profile_pic_url: string | null;
    preferred_poa: string;
    applicant_type: string;
    disability_type?: string;
  };
  applicant_id: number;
}

const Jobseekers = () => {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManageJobseeker, setShowManageJobseeker] = useState(false);
  const [selectedJobseeker, setSelectedJobseeker] =
    useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch("/api/getJobseekers");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
      console.log(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const formatAppliedDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const formatted = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    return `${day} ${formatted}`;
  };

  // Get unique applicants (deduplicate by applicant_id)
  const uniqueApplicants = React.useMemo(() => {
    const applicantMap = new Map<number, Application>();

    applications.forEach((app) => {
      const applicantId = app.applicant_id || app.applicant.id;

      // If this applicant isn't in the map yet, add them
      if (!applicantMap.has(applicantId)) {
        applicantMap.set(applicantId, app);
      } else {
        // If they exist, keep the one with the most recent applied_date
        const existing = applicantMap.get(applicantId)!;
        const existingDate = new Date(existing.applied_date || 0).getTime();
        const currentDate = new Date(app.applied_date || 0).getTime();

        if (currentDate > existingDate) {
          applicantMap.set(applicantId, app);
        }
      }
    });

    return Array.from(applicantMap.values());
  }, [applications]);

  const filteredApplications = (uniqueApplicants ?? []).filter(
    (app) =>
      app.applicant.name.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.sex.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.applicant_type
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (app.applicant.disability_type ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      app.applicant.preferred_poa
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      app.applicant.barangay.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.district.toLowerCase().includes(search.toLowerCase()) ||
      app.status.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.applicant.name.localeCompare(b.applicant.name);
      case "date":
        return (
          new Date(b.applied_date || 0).getTime() -
          new Date(a.applied_date || 0).getTime()
        );
      case "type":
        return a.applicant.applicant_type.localeCompare(
          b.applicant.applicant_type,
        );
      case "place":
        return a.applicant.preferred_poa.localeCompare(
          b.applicant.preferred_poa,
        );
      default:
        return 0;
    }
  });

  // Count unique active applications
  const activeApplicationsCount = React.useMemo(() => {
    const activeApplicantIds = new Set(
      applications
        .filter((a) => a.status === "pending")
        .map((a) => a.applicant_id || a.applicant.id),
    );
    return activeApplicantIds.size;
  }, [applications]);

  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  if (showManageJobseeker && selectedJobseeker) {
    return (
      <section className={styles.manageJobseeker}>
        <button
          onClick={() => setShowManageJobseeker(false)}
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
        <ManageJobseeker
          jobseeker={{
            id: selectedJobseeker.applicant.id,
            applicant: selectedJobseeker.applicant,
            resume: selectedJobseeker.resume,
          }}
        />
      </section>
    );
  }

  return (
    <section className={styles.jobseekers}>
      <div className={styles.top}>
        <div className={styles.totalStatistics}>
          <strong>TOTAL JOBSEEKERS: {uniqueApplicants.length}</strong>
          <strong>ACTIVE APPLICATIONS: {activeApplicationsCount}</strong>
        </div>

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

        <div className={styles.topRight}>
          <div className={styles.sortBy}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="date">Date Applied</option>
              <option value="type">Applicant Type</option>
              <option value="place">Place of Assignment</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.jobseekersTable}>
        {sortedApplications.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.jobseekersDetailsHeader}>
                <div style={{ width: "5.8rem" }}></div>
                <div>FULL NAME</div>
                <div>TYPE OF APPLICANT</div>
                <div>PLACE OF ASSIGNMENT</div>
                <div>DATE APPLIED</div>
              </div>
              <div>ACTIONS</div>
              <div>SELECT</div>
            </div>
            {sortedApplications.map((app) => (
              <div className={styles.tableRow} key={app.applicant.id}>
                <div className={styles.jobseekersDetails}>
                  <div className={styles.avatarCell}>
                    <img
                      src={
                        app.applicant.profile_pic_url ?? "/default-avatar.png"
                      }
                      alt={app.applicant.name}
                      className={styles.avatar}
                    />
                  </div>
                  <div className={styles.applicantName}>
                    {app.applicant.name}
                  </div>
                  <div>{app.applicant.applicant_type}</div>
                  <div>{app.applicant.preferred_poa}</div>
                  <div>{formatAppliedDate(app.applied_date)}</div>
                </div>
                <div>
                  <button
                    className={styles.detailsBtn}
                    onClick={() => {
                      setSelectedJobseeker(app);
                      setShowManageJobseeker(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
                <div className={styles.checkbox}>
                  <input type="checkbox" checked={app.selected} />
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
            <h3>No applicants found.</h3>
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobseekers;
