"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ManageJobseeker.module.css";
import Resume from "@/app/(user)/profile/components/Resume";
import jobHomeStyle from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";
import Button from "@/components/Button";
import ExamResultView from "@/app/(user)/job-opportunities/[companyId]/components/exam/ExamResultView";
import BlocksWave from "@/components/BlocksWave";
import ReferralLetter, { ReferralLetterRef } from "./ReferralLetter";
import Toast from "@/components/toast/Toast";
import Image from "next/image";

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
    exam_id: number;
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

interface ExamAttemptData {
  attempt: {
    attempt_id: number;
    exam_id: number;
    applicant_id: number;
    date_submitted: string;
    score: number;
  };
  answers: Array<{
    question_id: number;
    choice_id?: number;
    text_answer?: string;
    questions?: {
      question_text: string;
      choices?: Array<{ id: number; choice_text: string }>;
    };
    choices?: {
      choice_text: string;
    };
  }>;
  correctAnswers: Array<{
    question_id: number;
    choice_id?: number;
    correct_text?: string;
  }>;
}

const ManageJobseeker = ({ jobseeker }: { jobseeker: Jobseeker }) => {
  const [nav, setNav] = useState("previewResume");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const referralLetterRef = useRef<ReferralLetterRef>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [showExamResult, setShowExamResult] = useState(false);

  const [examAttempt, setExamAttempt] = useState<ExamAttemptData | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
  });

  const showToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
  };

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

  const fetchExamAttempt = async (
    jobId: number,
    examId: number,
    applicantId: number,
  ) => {
    setLoadingAttempt(true);
    try {
      const res = await fetch(
        `/api/admin/exams/attempt?jobId=${jobId}&examId=${examId}&applicantId=${applicantId}`,
      );
      const data = await res.json();
      console.log("Exam attempt data:", data);

      if (data.attempt) {
        setExamAttempt(data);
      } else {
        setExamAttempt(null);
      }
    } catch (err) {
      console.error("Failed to fetch exam attempt:", err);
      setExamAttempt(null);
    } finally {
      setLoadingAttempt(false);
    }
  };

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

  const handleDownloadReferral = async (applicationId: number) => {
    if (!selectedApplication) return;

    console.log("[handleDownloadReferral] Starting with:", {
      applicationId,
      currentStatus: selectedApplication.status,
    });

    try {
      // Trigger PDF download from ReferralLetter component
      await referralLetterRef.current?.downloadPDF();
      console.log("[handleDownloadReferral] PDF download complete");

      // Mark applicant as referred
      console.log("[handleDownloadReferral] Sending status update request...");
      const response = await fetch(`/api/updateApplicationStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          status: "Referred",
        }),
      });

      console.log("[handleDownloadReferral] Response status:", response.status);

      const result = await response.json();
      console.log("[handleDownloadReferral] Response data:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to update application status");
      }

      // Close modal first
      setShowReferralModal(false);

      // Refresh the list
      console.log("[handleDownloadReferral] Refreshing applications...");
      await fetchApplications();

      // Show success toast
      showToast(
        "Referral Success! 🎉",
        "Application marked as referred and letter downloaded.",
      );
    } catch (error) {
      console.error("[handleDownloadReferral] Error:", error);
      showToast(
        "Referral Failed",
        error instanceof Error
          ? error.message
          : "Failed to download referral letter or update status.",
      );
    }
  };

  const jobseekerComponent = () => {
    return (
      <div className={styles.jobseekerContainer}>
        <Image
          src={
            jobseeker?.resume?.profile_pic_url ||
            "/assets/images/default_profile.png"
          }
          alt="Jobseeker Profile Picture"
          width={84}
          height={84}
        />
        <div className={styles.jobseekerDetails}>
          <h2>Applicant</h2>
          <span className={styles.jobseekerName}>
            {jobseeker.applicant.name}
          </span>
          <span className={styles.jobseekerPreferredPOA}>
            Preferred Place of Assignment: {jobseeker.applicant.preferred_poa}
          </span>
          <span className={styles.jobseekerType}>
            Applicant Type: {jobseeker.applicant.applicant_type}
          </span>
        </div>
      </div>
    );
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
                    fetchExamAttempt(
                      app.job_id,
                      app.job.exam_id,
                      app.applicant_id,
                    );
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
      {jobseekerComponent()}
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
              <ReferralLetter
                ref={referralLetterRef}
                jobseeker={jobseeker}
                application={selectedApplication}
                recipientName="MS. RUFFA MAE G. REYES"
                recipientTitle="HR Assistant"
              />
            </div>
            <div className={styles.modalActions}>
              <Button
                variant="success"
                onClick={() => {
                  handleDownloadReferral(selectedApplication.id);
                }}
              >
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
                {loadingAttempt ? (
                  <BlocksWave />
                ) : examAttempt ? (
                  <ExamResultView
                    attempt={examAttempt.attempt}
                    answers={examAttempt.answers}
                    correctAnswers={examAttempt.correctAnswers}
                  />
                ) : (
                  "No exam submitted or no exam assigned to job"
                )}
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

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
      />
    </section>
  );
};

export default ManageJobseeker;
