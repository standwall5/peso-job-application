"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/admin/jobseekers/components/Jobseekers.module.css";
import jobHomeStyle from "@/app/(user)/job-opportunities/JobHome.module.css";

import Resume from "@/app/(user)/profile/components/Resume"; // adjust path if needed
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";

import OneEightyRing from "@/components/OneEightyRing";
import Link from "next/link";

// ...existing code...
interface Application {
  id: number;
  name: string;
  type: string;
  place: string;
  date: string;
  status: string;
  resume: SelectedResume | null; // updated
  avatar: string;
  selected: boolean;
  applied_date?: string;
  applicant: {
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
}

// New interface for the selected resume
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
  includes(id: number): unknown;
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

// ...existing code...
// ...existing code...

const Jobseekers = () => {
  const [showModal, setShowModal] = useState(false);
  const [applicationSelect, setApplicationSelect] = useState("previewResume");
 const [selectedResume, setSelectedResume] = useState<SelectedResume | null>(null);
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

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

  // ...existing code...

  const formatAppliedDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // fallback if invalid
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const formatted = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    return `${day} ${formatted}`;
  };

  const filteredApplications = (applications ?? []).filter(
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
      app.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  return (
    <section className={styles.jobseekers}>
      {/* Search */}

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

      {/* Jobseekers List */}
      <div className={styles.jobseekersTable}>
        {filteredApplications.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.jobseekersDetailsHeader}>
                <div style={{ width: "5.8rem" }}></div>
                <div>FULL NAME</div>
                <div>TYPE OF APPLICANT</div>
                <div>PLACE OF ASSIGNMENT</div>
                <div>DATE APPLIED</div>
              </div>
              <div></div>

              <div>SELECT</div>
            </div>
            {filteredApplications.map((app) => (
              <div className={styles.tableRow} key={app.id}>
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

                  {/* <div className={styles.status}>
                    <span
                      className={`${styles.status} ${
                        styles[app.status.replace(" ", "").toLowerCase()]
                      }`}
                    >
                      {app.status}
                    </span>
                  </div> */}
                </div>
                <div>
                  <button
                    className={styles.detailsBtn}
                    onClick={() => {
                      setSelectedResume(app.resume);
                      setShowModal(true);
                    }}
                  >
                    {app.resume ? "View Resume" : "No Resume"}
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

      {showModal && selectedResume && (
        <div
          className={jobStyle.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={`${jobStyle.modal} ${jobStyle.applicationModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{ fontWeight: "bold", right: 40, position: "absolute" }}
            >
              X
            </button>
            <div className={jobStyle.applicationContainer}>
              <div className={jobStyle.jobApplied}>
                <strong>Applicant</strong>

                <div className={jobStyle.applicantInformation}>
                  <div className={jobStyle.applicantPicture}>
                    <img
                      src={selectedResume.profile_pic_url || "/assets/images/default_profile.png"}
                      alt={selectedResume.applicant.name}
                    />
                  </div>
                  <div className={jobStyle.applicantPersonalInfo}>
                    <span>
                      <strong style={{ fontSize: "1.2rem" }}>
                        {selectedResume.applicant.name}
                      </strong>
                    </span>
                    <span>
                      <strong>PREFERRED PLACE OF ASSIGNMENT:</strong>{" "}
                      {selectedResume.applicant.preferred_poa}
                    </span>
                    <span>
                      <strong>APPLICANT TYPE:</strong>{" "}
                      {selectedResume.applicant.applicant_type}
                    </span>
                  </div>
                </div>
                <strong>Job Applied</strong>
                <div
                  key={selectedResume.company.id}
                  className={`${jobHomeStyle.jobCardAdmin} ${jobStyle.applicationJobCompanyAdmin}`}
                  onClick={() => setShowModal(selectedResume.company ? true : false)}
                >
                  <div
                    className={`${jobHomeStyle.jobCompany} ${jobStyle.companyInformation}`}
                  >
                    {selectedResume.company?.logo && (
                      <img
                        src={selectedResume.company?.logo}
                        alt={selectedResume.company?.name + " logo"}
                        className={styles.companyLogo}
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <span>{selectedResume.company?.name}</span>
                  </div>
                  <div className={jobStyle.jobDetails}>
                    <h2>{selectedResume.job.title}</h2>
                    <p>{selectedResume.job.place_of_assignment}</p>
                    <p>{selectedResume.job.sex}</p>
                    <p>{selectedResume.job.education}</p>
                    <p>{selectedResume.job.eligibility}</p>
                    <p>
                      {new Date(
                        selectedResume.job.posted_date
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
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
                      <Resume
                        // Pass the resume props here
                        profilePicUrl={
                          selectedResume.profile_pic_url ??
                          "/assets/images/default_profile.png"
                        }
                        name={selectedResume.applicant.name}
                        birthDate={selectedResume.applicant.birth_date}
                        address={selectedResume.applicant.address}
                        barangay={selectedResume.applicant.barangay}
                        district={selectedResume.applicant.district}
                        email={selectedResume.applicant.email}
                        phone={selectedResume.applicant.phone}
                        education={selectedResume.education}
                        skills={
                          Array.isArray(selectedResume.skills)
                            ? selectedResume.skills
                            : typeof selectedResume.skills === "string"
                            ? selectedResume.skills
                                .split(",")
                                .map((s) => s.trim())
                            : undefined
                        }
                        workExperiences={selectedResume.work_experiences}
                        profileIntroduction={
                          selectedResume.profile_introduction
                        }
                      />
                    </div>
                    <div className={jobStyle.applicantDetailButtons}>
                      <button className="green-button">Submit</button>
                    </div>
                  </div>
                )}
                {applicationSelect === "exam" &&
                selectedResume.includes(selectedResume.company.id) ? (
                  <div className={jobStyle.applicantDetail}>
                    {/* Render exam content here */}
                    <p>Exam section for this job/applicant.</p>
                  </div>
                ) : (
                  applicationSelect === "exam" && (
                    <div
                      className={jobStyle.modalOverlay}
                      onClick={() => {
                        setShowModal(false);
                        setApplicationSelect("previewResume");
                      }}
                    >
                      <div
                        className={`warningModal`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setShowModal(false);
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

export default Jobseekers;
