"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Jobseekers.module.css";
import Toast from "@/components/toast/Toast";
import { Jobseeker, JobApplication } from "../types/jobseeker.types";
import { useApplications } from "../hooks/useApplications";
import { useManageJobseeker } from "../hooks/useManageJobseeker";
import JobseekerHeader from "./manage/JobseekerHeader";
import PreviewResumeTab from "./manage/PreviewResumeTab";
import AppliedJobsTab from "./manage/AppliedJobsTab";
import ReferralLetterModal from "./manage/ReferralLetterModal";

const ManageJobseeker = ({
  jobseeker,
  lastClickedApplicationId,
  onApplicationClick,
}: {
  jobseeker: Jobseeker;
  lastClickedApplicationId?: number | null;
  onApplicationClick?: (appId: number) => void;
}) => {
  const [nav, setNav] = useState("previewResume");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<Jobseeker | null>(
    jobseeker
  );
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);

  // Custom hooks
  const { applications, loading, fetchApplications, updateApplicationStatus } =
    useApplications(jobseeker.id);
  const { toast, showToast, setToast, examAttempt } = useManageJobseeker();

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

  const handleDownloadReferral = async (
    applicationId: number,
    downloadPDF: () => Promise<void>
  ) => {
    try {
      // Trigger PDF download
      await downloadPDF();

      // Mark applicant as referred
      await updateApplicationStatus(applicationId, "Referred");

      // Close modal
      setShowReferralModal(false);

      // Refresh the list
      await fetchApplications();

      // Show success toast
      showToast(
        "Referral Success! 🎉",
        "Application marked as referred and letter downloaded."
      );
    } catch (error) {
      showToast(
        "Referral Failed",
        error instanceof Error
          ? error.message
          : "Failed to download referral letter or update status."
      );
    }
  };

  const handleViewExam = (app: JobApplication) => {
    setSelectedApplication(app);
  };

  const handleViewReferral = (app: JobApplication) => {
    setSelectedApplication(app);
    setShowReferralModal(true);
  };

  const handleViewID = (app: JobApplication) => {
    setSelectedApplication(app);
  };

  return (
    <section className={styles.manageJobseekerWrapper}>
      <JobseekerHeader jobseeker={jobseeker} />

      <div className={styles.navWrapper}>
        <div className={styles.navContainer}>
          <ul className={styles.navList}>
            <li
              ref={(el) => {
                tabRefs.current[0] = el;
              }}
              onClick={() => {
                setNav("previewResume");
                setActiveIndex(0);
              }}
              className={nav === "previewResume" ? styles.activeNav : ""}
            >
              PREVIEW RESUME
            </li>
            <li
              ref={(el) => {
                tabRefs.current[1] = el;
              }}
              onClick={() => {
                setNav("appliedJobs");
                setActiveIndex(1);
              }}
              className={nav === "appliedJobs" ? styles.activeNav : ""}
            >
              APPLIED JOBS
            </li>
          </ul>
          <div className={styles.navIndicator} style={indicatorStyle}></div>
        </div>
      </div>

      <div className={styles.tabContentWrapper}>
        {nav === "previewResume" && <PreviewResumeTab jobseeker={jobseeker} />}
        {nav === "appliedJobs" && (
          <AppliedJobsTab
            applications={applications}
            loading={loading}
            onViewExam={handleViewExam}
            onViewReferral={handleViewReferral}
            onViewID={handleViewID}
            lastClickedApplicationId={lastClickedApplicationId}
            onApplicationClick={onApplicationClick}
            jobseeker={jobseeker}
          />
        )}
      </div>

      {/* Modals */}
      {showReferralModal && selectedApplication && (
        <ReferralLetterModal
          jobseeker={jobseeker}
          application={selectedApplication}
          onClose={() => setShowReferralModal(false)}
          onDownload={handleDownloadReferral}
        />
      )}

      {toast.show && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast({ show: false, title: "", message: "" })}
        />
      )}
    </section>
  );
};

export default ManageJobseeker;
