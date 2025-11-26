"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ManageJobseeker.module.css";
import Resume from "@/app/(user)/profile/components/Resume";
import jobHomeStyle from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";
import Button from "@/components/Button";

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

interface JobApplication {
  id: number;
  applicant_id: number;
  job_id: number;
  status: string;
  applied_date: string;
  exam_score?: number;
  company: {
    id: number;
    name: string;
    logo?: string | null;
    location: string;
  };
  job: {
    id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  };
}

interface Jobseeker {
  id: number;
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
  resume: {
    profile_pic_url: string | null;
    education: Education;
    skills: string[] | string;
    work_experiences: WorkExperience[];
    profile_introduction?: string;
  } | null;
}

const ManageJobseeker = ({ jobseeker }: { jobseeker: Jobseeker }) => {
  const [nav, setNav] = useState("previewResume");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [showExamResult, setShowExamResult] = useState(false);

  useEffect(() => {
    const currentTab = tabRefs.current[activeIndex];
    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (nav === "appliedJobs") {
      fetchApplications();
    }
  }, [nav]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/getApplicantApplications?applicant_id=${jobseeker.id}`,
      );
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    }
    setLoading(false);
  };

  const handleDownloadReferral = async () => {
    if (!selectedApplication) return;

    try {
      // Mark applicant as referred
      await fetch(`/api/updateApplicationStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: selectedApplication.id,
          status: "referred",
        }),
      });

      // Generate and download referral letter
      // TODO: Implement actual PDF generation
      alert(`Referral letter downloaded for ${jobseeker.applicant.name}`);

      setShowReferralModal(false);
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error("Error downloading referral:", error);
      alert("Failed to download referral letter");
    }
  };

  const previewResumeTab = () => {
    if (!jobseeker.resume) {
      return (
        <div className={styles.noData}>
          <p>No resume available for this jobseeker.</p>
        </div>
      );
    }

    return (
      <div className={styles.resumeContainer}>
        <Resume
          profilePicUrl={
            jobseeker.resume.profile_pic_url ??
            "/assets/images/default_profile.png"
          }
          name={jobseeker.applicant.name}
          birthDate={jobseeker.applicant.birth_date}
          address={jobseeker.applicant.address}
          barangay={jobseeker.applicant.barangay}
          district={jobseeker.applicant.district}
          email={jobseeker.applicant.email}
          phone={jobseeker.applicant.phone}
          education={jobseeker.resume.education}
          skills={
            Array.isArray(jobseeker.resume.skills)
              ? jobseeker.resume.skills
              : typeof jobseeker.resume.skills === "string"
                ? jobseeker.resume.skills.split(",").map((s) => s.trim())
                : undefined
          }
          workExperiences={jobseeker.resume.work_experiences}
          profileIntroduction={jobseeker.resume.profile_introduction}
        />
      </div>
    );
  };

  const appliedJobsTab = () => {
    if (loading) {
      return <div className={styles.loading}>Loading applications...</div>;
    }

    if (applications.length === 0) {
      return (
        <div className={styles.noData}>
          <p>This jobseeker has not applied to any jobs yet.</p>
        </div>
      );
    }

    return (
      <div className={styles.appliedJobs}>
        <h2>Applied Jobs ({applications.length})</h2>
        <div className={styles.applicationsGrid}>
          {applications.map((app) => (
            <div key={app.id} className={styles.applicationCard}>
              <div className={styles.applicationCardContent}>
                <div className={jobHomeStyle.jobCompany}>
                  {app.company.logo && (
                    <img
                      src={app.company.logo}
                      alt={app.company.name + " logo"}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "contain",
                        borderRadius: "0.5rem",
                      }}
                    />
                  )}
                  <span>{app.company.name}</span>
                </div>
                <div className={styles.jobInfo}>
                  <h3>{app.job.title}</h3>
                  <p>
                    <strong>Location:</strong> {app.job.place_of_assignment}
                  </p>
                  <p>
                    <strong>Education:</strong> {app.job.education}
                  </p>
                  <p>
                    <strong>Eligibility:</strong> {app.job.eligibility}
                  </p>
                  <p>
                    <strong>Applied:</strong>{" "}
                    {new Date(app.applied_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${styles.status} ${styles[app.status.replace(" ", "").toLowerCase()]}`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <div className={styles.applicationActions}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedApplication(app);
                    setShowExamResult(true);
                  }}
                >
                  Exam Result
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    setSelectedApplication(app);
                    setShowReferralModal(true);
                  }}
                >
                  Referral
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.manageJobseekerWrapper}>
      <div className={styles.nav}>
        <ul className={styles.tabList}>
          {["previewResume", "appliedJobs"].map((tab, idx) => (
            <li
              key={tab}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              className={nav === tab ? styles.active : ""}
              onClick={() => {
                setNav(tab);
                setActiveIndex(idx);
              }}
            >
              {tab === "previewResume" && "PREVIEW RESUME"}
              {tab === "appliedJobs" && "APPLIED JOBS"}
            </li>
          ))}
          <div
            className={styles.tabIndicator}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </ul>
      </div>
      <div className={styles.content}>
        {nav === "previewResume" && previewResumeTab()}
        {nav === "appliedJobs" && appliedJobsTab()}
      </div>

      {/* Referral Modal */}
      {showReferralModal && selectedApplication && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowReferralModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowReferralModal(false)}
              className={styles.closeBtn}
            >
              X
            </button>
            <h2>Referral Letter</h2>
            <div className={styles.referralContent}>
              <p>
                <strong>Applicant:</strong> {jobseeker.applicant.name}
              </p>
              <p>
                <strong>Company:</strong> {selectedApplication.company.name}
              </p>
              <p>
                <strong>Position:</strong> {selectedApplication.job.title}
              </p>
              <p className={styles.warning}>
                ⚠️ Downloading this referral letter will mark the applicant as
                REFERRED in the system.
              </p>
            </div>
            <div className={styles.modalActions}>
              <Button variant="success" onClick={handleDownloadReferral}>
                Download & Mark as Referred
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowReferralModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Result Modal */}
      {showExamResult && selectedApplication && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowExamResult(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowExamResult(false)}
              className={styles.closeBtn}
            >
              X
            </button>
            <h2>Exam Result</h2>
            <div className={styles.examResultContent}>
              <p>
                <strong>Applicant:</strong> {jobseeker.applicant.name}
              </p>
              <p>
                <strong>Company:</strong> {selectedApplication.company.name}
              </p>
              <p>
                <strong>Position:</strong> {selectedApplication.job.title}
              </p>
              <div className={styles.scoreDisplay}>
                <h3>Score</h3>
                <p className={styles.score}>
                  {selectedApplication.exam_score !== undefined &&
                  selectedApplication.exam_score !== null
                    ? `${selectedApplication.exam_score}%`
                    : "No exam taken yet"}
                </p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button
                variant="primary"
                onClick={() => setShowExamResult(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageJobseeker;
