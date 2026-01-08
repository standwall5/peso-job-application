// src/app/(user)/job-opportunities/[companyId]/components/application/ApplicationModal.tsx
"use client";
import React, { useState } from "react";
import jobStyle from "../../JobsOfCompany.module.css";
import ResumePreviewTab from "./ResumePreviewTab";
import ExamTab from "./ExamTab";
import VerifiedIdTab from "./VerifiedIdTab";
import WithdrawConfirmModal from "./WithdrawConfirmModal";
import Button from "@/components/Button";
import { Job, Exam } from "../../types/job.types";
import {
  ApplicationProgress,
  ExamAttemptData,
} from "../../types/application.types";
import { withdrawApplication } from "@/lib/db/services/application.service";
import { ResumeEditSection } from "@/app/(user)/profile/components/sections/ResumeEditSection";
import { useProfileData } from "@/app/(user)/profile/hooks/useProfileData";
import { useProfileEdit } from "@/app/(user)/profile/hooks/useProfileEdit";
import { updateResumeAction } from "@/app/(user)/profile/actions/profile.actions";
import Toast from "@/components/toast/Toast";

interface ApplicationModalProps {
  job: Job;
  hasApplied: boolean;
  examData: Exam | null;
  loadingExam: boolean;
  examAttempt: ExamAttemptData | null;
  loadingAttempt: boolean;
  progress: ApplicationProgress | undefined;
  onClose: () => void;
  onExamSubmit: (
    answers: Record<number, number | number[] | string>,
  ) => Promise<void>;
  onContinueToExam: () => void;
  onIdUploaded: () => void;
  onSubmitFinalApplication: () => void;
  onFetchExamAttempt: () => void;
  onWithdrawSuccess?: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  hasApplied,
  examData,
  loadingExam,
  examAttempt,
  loadingAttempt,
  progress,
  onClose,
  onExamSubmit,
  onContinueToExam,
  onIdUploaded,
  onSubmitFinalApplication,
  onFetchExamAttempt,
  onWithdrawSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<
    "previewResume" | "exam" | "verifiedId"
  >("previewResume");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [examDataFetched, setExamDataFetched] = useState(false);
  const [showEditResume, setShowEditResume] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  // Resume editing hooks
  const { user, resume, refreshResume, refreshUser } = useProfileData();
  const profileEditHook = useProfileEdit(user, resume);

  const handleTabChange = (tab: "previewResume" | "exam" | "verifiedId") => {
    setActiveTab(tab);
    // Only fetch exam data once
    if ((tab === "exam" || tab === "verifiedId") && !examDataFetched) {
      onFetchExamAttempt();
      setExamDataFetched(true);
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
      alert(
        error instanceof Error
          ? error.message
          : "Failed to withdraw application",
      );
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
      {/* Success Toast */}
      <Toast
        show={showEditSuccess}
        onClose={() => setShowEditSuccess(false)}
        title="Success"
        message="Resume updated!"
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
                  <img
                    src={job.companies.logo}
                    alt={job.companies.name + " logo"}
                    style={{
                      width: "80px",
                      height: "80px",
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
                  className={activeTab === "exam" ? jobStyle.active : ""}
                  onClick={() => handleTabChange("exam")}
                >
                  Pre-Screening Questions
                </li>
                <li
                  className={activeTab === "verifiedId" ? jobStyle.active : ""}
                  onClick={() => handleTabChange("verifiedId")}
                >
                  Verified ID
                </li>
              </ul>

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
                  style={{ display: activeTab === "exam" ? "block" : "none" }}
                >
                  <ExamTab
                    loadingAttempt={loadingAttempt}
                    loadingExam={loadingExam}
                    examAttempt={examAttempt}
                    examData={examData}
                    hasApplied={hasApplied}
                    onExamSubmit={onExamSubmit}
                  />
                </div>

                <div
                  style={{
                    display: activeTab === "verifiedId" ? "block" : "none",
                  }}
                >
                  <VerifiedIdTab
                    jobId={job.id}
                    hasApplied={hasApplied}
                    examAttempt={examAttempt}
                    progress={progress}
                    onIdUploaded={onIdUploaded}
                    onSubmitFinalApplication={onSubmitFinalApplication}
                    onGoToExam={() => handleTabChange("exam")}
                  />
                </div>
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
    </>
  );
};

export default ApplicationModal;
