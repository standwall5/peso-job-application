"use client";

import React, { useState } from "react";
import styles from "../Jobseekers.module.css";
import {
  Jobseeker,
  JobApplication,
  ExamAttemptData,
} from "../../types/jobseeker.types";

import {
  ExamAnswer,
  CorrectAnswer,
} from "@/app/(user)/job-opportunities/[companyId]/types/job.types";
import ExamResultModal from "./ExamResultModal";
import IDViewModal from "@/components/admin/IDViewModal";
import { useManageJobseeker } from "../../hooks/useManageJobseeker";

interface AppliedJobsTabProps {
  applications: JobApplication[];
  loading: boolean;
  onViewExam: (app: JobApplication) => void;
  onViewReferral: (app: JobApplication) => void;
  onViewID: (app: JobApplication) => void;
  lastClickedApplicationId?: number | null;
  onApplicationClick?: (appId: number) => void;
  jobseeker: Jobseeker;
}

export default function AppliedJobsTab({
  applications,
  loading,
  onViewExam,
  onViewReferral,
  onViewID,
  lastClickedApplicationId,
  onApplicationClick,
  jobseeker,
}: AppliedJobsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = applications.slice(startIndex, endIndex);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<Jobseeker | null>(
    jobseeker
  );
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);
  const [idModalApplicant, setIDModalApplicant] = useState<{
    applicantId: number;
    applicantName: string;
    applicationId?: number;
  } | null>(null);

  const { fetchExamAttempt, examAttempt, loadingAttempt } =
    useManageJobseeker();

  // Handler to open modal and fetch exam attempt data
  const handleOpenExamModal = async (app: JobApplication) => {
    setSelectedApplication(app);
    setSelectedJobSeeker(jobseeker);
    setShowExamModal(true);

    // Fetch exam attempt data for this application
    // Use the exam_id from the job, not the application
    const examId = app.job?.exam_id || app.exam_id;

    if (app.job?.id && examId && jobseeker?.id) {
      console.log("Fetching exam attempt with:", {
        jobId: app.job.id,
        examId: examId,
        applicantId: jobseeker.id,
      });
      await fetchExamAttempt(app.job.id, examId, jobseeker.id);
    } else {
      console.log("Missing required data:", {
        jobId: app.job?.id,
        examId: examId,
        applicantId: jobseeker?.id,
      });
    }
  };

  // Handler to open ID modal
  const handleOpenIDModal = (app: Jobseeker, id: number) => {
    setIDModalApplicant({
      applicantId: app.id,
      applicantName: app.applicant?.name,
      applicationId: id,
    });
    setShowIDModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className={styles.notFound}>
        <h3>Loading applications...</h3>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
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
        <h3>No applications found.</h3>
      </div>
    );
  }

  return (
    <div style={{ width: "90%", maxWidth: "1400px" }}>
      <div className={styles.jobseekersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.jobseekersDetailsHeader}>
            <div style={{ width: "5.8rem" }}></div>
            <div>COMPANY</div>
            <div>JOB TITLE</div>
            <div>PLACE OF ASSIGNMENT</div>
            <div>STATUS</div>
          </div>
          <div>VIEW</div>
        </div>

        {currentApplications.map((app) => (
          <React.Fragment key={app.id}>
            <div
              className={`${styles.tableRow} ${
                lastClickedApplicationId === app.id ? styles.highlightedRow : ""
              }`}
              style={
                lastClickedApplicationId === app.id
                  ? {
                      backgroundColor: "#fef3c7",
                      border: "2px solid #f59e0b",
                      transition: "all 0.3s ease",
                    }
                  : undefined
              }
            >
              <div className={styles.jobseekersDetails}>
                <div className={styles.avatarCell}>
                  <img
                    src={
                      app.company?.logo ?? "/assets/images/default_profile.png"
                    }
                    alt={app.company?.name}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.applicantName}>{app.company?.name}</div>
                <div>{app.job?.title}</div>
                <div>{app.job?.place_of_assignment}</div>
                <div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor:
                        app.status.toLowerCase() === "pending"
                          ? "#e5e7eb"
                          : app.status.toLowerCase() === "referred"
                          ? "#10b981"
                          : "#3b82f6",
                      color:
                        app.status.toLowerCase() === "pending"
                          ? "#64748b"
                          : "#ffffff",
                    }}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.viewActions}>
                <button
                  className={styles.examResultBtn}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (onApplicationClick) onApplicationClick(app.id);
                    await handleOpenExamModal(app);
                  }}
                >
                  PRE-SCREENING
                </button>
                <button
                  className={styles.validIdBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onApplicationClick) onApplicationClick(app.id);
                    handleOpenIDModal(jobseeker, app.id);
                  }}
                >
                  VALID ID
                </button>
                <button
                  className={styles.referralBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onApplicationClick) onApplicationClick(app.id);
                    onViewReferral(app);
                  }}
                >
                  REFERRAL
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Pagination Controls */}
        {applications.length > 0 && (
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Showing {startIndex + 1}-{Math.min(endIndex, applications.length)}{" "}
              of {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className={styles.paginationEllipsis}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.paginationNumber} ${
                        currentPage === page ? styles.paginationActive : ""
                      }`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className={styles.paginationBtn}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Place ExamResultModal here at the root of the main container */}
      {showExamModal && selectedApplication && selectedJobSeeker && (
        <ExamResultModal
          jobseeker={selectedJobSeeker}
          application={selectedApplication}
          examAttempt={examAttempt}
          loadingAttempt={loadingAttempt}
          onClose={() => setShowExamModal(false)}
          onGraded={() => {}}
        />
      )}
      {/* Place IDViewModal here at the root of the main container */}
      {showIDModal && idModalApplicant && (
        <IDViewModal
          applicantId={idModalApplicant.applicantId}
          applicantName={idModalApplicant.applicantName}
          applicationId={idModalApplicant.applicationId}
          onClose={() => setShowIDModal(false)}
        />
      )}
    </div>
  );
}
