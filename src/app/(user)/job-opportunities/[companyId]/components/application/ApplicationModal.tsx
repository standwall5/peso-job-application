// src/app/(user)/job-opportunities/[companyId]/components/application/ApplicationModal.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import jobStyle from "../../JobsOfCompany.module.css";
import ResumePreviewTab from "./ResumePreviewTab";
import VerifiedIdTab from "./VerifiedIdTab";
import WithdrawConfirmModal from "./WithdrawConfirmModal";
import Button from "@/components/Button";
import { Job } from "../../types/job.types";
import { ApplicationProgress } from "../../types/application.types";
import { withdrawApplication } from "@/lib/db/services/application.service";
import { ResumeEditSection } from "@/app/(user)/profile/components/sections/ResumeEditSection";
import { useProfileData } from "@/app/(user)/profile/hooks/useProfileData";
import { useProfileEdit } from "@/app/(user)/profile/hooks/useProfileEdit";
import { updateResumeAction } from "@/app/(user)/profile/actions/profile.actions";
import Toast from "@/components/toast/Toast";

interface ApplicationModalProps {
  job: Job;
  hasApplied: boolean;
  progress: ApplicationProgress | undefined;
  applicationId?: number | null;
  onClose: () => void;
  onIdUploaded: () => void;
  onSubmitFinalApplication: () => void;
  onWithdrawSuccess?: () => void;
  onContinueToExam: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  hasApplied,
  progress,
  applicationId,
  onClose,
  onIdUploaded,
  onSubmitFinalApplication,
  onWithdrawSuccess,
  onContinueToExam,
}) => {
  const [activeTab, setActiveTab] = useState<
    "previewResume" | "exam" | "verifiedId"
  >("previewResume");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showEditResume, setShowEditResume] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  // Resume editing hooks
  const { user, resume, refreshResume, refreshUser } = useProfileData();
  const profileEditHook = useProfileEdit(user, resume);

  const handleTabChange = (tab: "previewResume" | "exam" | "verifiedId") => {
    setActiveTab(tab);
  };

  const handleNextTab = () => {
    if (activeTab === "previewResume") {
      setActiveTab("exam");
    } else if (activeTab === "exam") {
      setActiveTab("verifiedId");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "verifiedId") {
      setActiveTab("exam");
    } else if (activeTab === "exam") {
      setActiveTab("previewResume");
    }
  };

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true);
    try {
      await withdrawApplication(job.id);
      setShowWithdrawModal(false);
      onClose();

      // Call the success callback if provided
      if (onWithdrawSuccess) {
        onWithdrawSuccess();
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      setToast({
        show: true,
        title: "Withdrawal Failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to withdraw application",
        type: "error",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawModal(false);
  };

  const handleEditResume = () => {
    setShowEditResume(true);
    setActiveTab("previewResume");
  };

  const handleResumeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateResumeAction({
        name: profileEditHook.editName,
        birth_date: profileEditHook.editBirthDate,
        address: profileEditHook.editAddress,
        sex: profileEditHook.editSex,
        barangay: profileEditHook.editBarangay,
        district: profileEditHook.editDistrict,
        education: {
          attainment: profileEditHook.editEducationAttainment,
          degree: profileEditHook.editDegree,
          school: profileEditHook.editSchool,
          location: profileEditHook.editEducationLocation,
          start_date: profileEditHook.editEducationStartDate,
          end_date: profileEditHook.editEducationEndDate,
        },
        skills: profileEditHook.skills,
        work_experiences: profileEditHook.workExperiences,
        profile_introduction: profileEditHook.editIntroduction,
      });

      await Promise.all([refreshUser(), refreshResume()]);
      setShowEditResume(false);
      setShowEditSuccess(true);
      setTimeout(() => setShowEditSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update resume:", error);
    }
  };

  return (
    <>
      <div className={jobStyle.modalOverlay} onClick={onClose}>
        <div
          className={`${jobStyle.modal} ${jobStyle.applicationModal}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className={jobStyle.closeButton}
            aria-label="Close modal"
          >
            ✕
          </button>
          <div className={jobStyle.applicationContainer}>
            {/* Job Information Card */}
            <div className={jobStyle.applicationJobCompany}>
              <div className={jobStyle.companyInformation}>
                {job.companies?.logo && (
                  <Image
                    src={job.companies.logo}
                    alt={job.companies.name + " logo"}
                    width={80}
                    height={80}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                )}
                <span>{job.companies?.name}</span>
              </div>
              <div className={jobStyle.jobDetails}>
                <h2>{job.title}</h2>
                <p>
                  <strong>Location:</strong> {job.place_of_assignment}
                </p>
                <p>
                  <strong>Sex:</strong> {job.sex}
                </p>
                <p>
                  <strong>Education:</strong> {job.education}
                </p>
                <p>
                  <strong>Eligibility:</strong> {job.eligibility}
                </p>
                <p>
                  <strong>Posted:</strong>{" "}
                  {job.posted_date
                    ? new Date(job.posted_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No date"}
                </p>
              </div>

              {/* Withdraw Button - Only show if user has applied */}
              {hasApplied && (
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                  <Button
                    variant="danger"
                    onClick={handleWithdrawClick}
                    style={{ width: "100%" }}
                  >
                    Withdraw Application
                  </Button>
                </div>
              )}
            </div>

            {/* Application Details with Tabs */}
            <div className={jobStyle.applicationDetails}>
              <ul className={jobStyle.applicationNav}>
                <li
                  className={
                    activeTab === "previewResume" ? jobStyle.active : ""
                  }
                  onClick={() => handleTabChange("previewResume")}
                >
                  Preview Resume
                </li>
                <li
                  className={activeTab === "verifiedId" ? jobStyle.active : ""}
                  onClick={() => handleTabChange("verifiedId")}
                >
                  Verified ID
                </li>
              </ul>

              {/* Tab Content Container with Navigation Arrows */}
              <div style={{ position: "relative", flex: 1, display: "flex" }}>
                {/* Tab Content - All tabs rendered but hidden to cache resume */}
                <div className={jobStyle.tabContentContainer}>
                  <div
                    style={{
                      display: activeTab === "previewResume" ? "block" : "none",
                    }}
                  >
                    {showEditResume && user ? (
                      <div
                        style={{
                          padding: "1rem",
                          overflowY: "auto",
                          height: "100%",
                        }}
                      >
                        <ResumeEditSection
                          user={user}
                          {...profileEditHook}
                          onCancel={() => setShowEditResume(false)}
                          onSave={handleResumeSave}
                        />
                      </div>
                    ) : (
                      <ResumePreviewTab
                        hasApplied={hasApplied}
                        onContinueToExam={onContinueToExam}
                        onEditResume={handleEditResume}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      display: activeTab === "verifiedId" ? "block" : "none",
                    }}
                  >
                    <VerifiedIdTab
                      hasApplied={hasApplied}
                      progress={progress}
                      jobId={job.id}
                      applicationId={applicationId}
                      onIdUploaded={onIdUploaded}
                      onSubmitFinalApplication={onSubmitFinalApplication}
                    />
                  </div>
                </div>

                {/* Navigation Arrows - Bottom Right Corner */}
                {!hasApplied && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "1rem",
                      right: "1rem",
                      display: "flex",
                      gap: "0.5rem",
                      zIndex: 1000,
                    }}
                  >
                    {/* Previous Arrow - Show on exam and verifiedId tabs */}
                    {(activeTab === "exam" || activeTab === "verifiedId") && (
                      <button
                        onClick={handlePrevTab}
                        title="Previous"
                        style={{
                          background: "rgba(122, 218, 239, 0.9)",
                          border: "none",
                          borderRadius: "0.375rem",
                          width: "3rem",
                          height: "3rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(91, 196, 220, 1)";
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(122, 218, 239, 0.9)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="black"
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Next Arrow - Show on previewResume and exam tabs */}
                    {(activeTab === "previewResume" ||
                      activeTab === "exam") && (
                      <button
                        onClick={handleNextTab}
                        title="Next"
                        style={{
                          background: "rgba(122, 218, 239, 0.9)",
                          border: "none",
                          borderRadius: "0.375rem",
                          width: "3rem",
                          height: "3rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(91, 196, 220, 1)";
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(122, 218, 239, 0.9)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="black"
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <WithdrawConfirmModal
          jobTitle={job.title}
          companyName={job.companies?.name || ""}
          onConfirm={handleWithdrawConfirm}
          onCancel={handleWithdrawCancel}
          isLoading={isWithdrawing}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        show={showEditSuccess}
        onClose={() => setShowEditSuccess(false)}
        title="Success"
        message="Resume updated!"
        type="success"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        }
      />
      <Toast
        show={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
};

export default ApplicationModal;
