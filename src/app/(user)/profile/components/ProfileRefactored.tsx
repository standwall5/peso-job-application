// src/app/(user)/profile/components/ProfileRefactored.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Profile.module.css";
import BlocksWave from "@/components/BlocksWave";
import Toast from "@/components/toast/Toast";
import {
  updateProfileDetailsAction,
  updateResumeAction,
} from "../actions/profile.actions";
import { useProfileData } from "../hooks/useProfileData";
import { useJobs } from "../hooks/useJobs";
import { useProfileEdit } from "../hooks/useProfileEdit";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { ProfileTab } from "../types/profile.types";
import { ProfilePictureModal } from "./modals/ProfilePictureModal";
import { ProfileHeader } from "./sections/ProfileHeader";
import { ProfileNavigation } from "./sections/ProfileNavigation";
import { ResumeViewSection } from "./sections/ResumeViewSection";
import { ResumeEditSection } from "./sections/ResumeEditSection";
import { ApplicationsSection } from "./sections/ApplicationsSection";
import { ViewIdSection } from "./sections/ViewIdSection";
import { InProgressSection } from "./sections/InProgressSection";

const Profile = () => {
  // Get URL search params
  const searchParams = useSearchParams();

  // Main data hooks
  const { user, setUser, resume, loading, refreshResume, refreshUser } =
    useProfileData();
  const { jobs, userApplications } = useJobs();

  // Edit state hooks
  const profileEditHook = useProfileEdit(user, resume);

  // Profile picture hook
  const profilePictureHook = useProfilePicture(setUser);

  // Local UI state
  const [showEditResume, setShowEditResume] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [profileOptionsNav, setProfileOptionsNav] =
    useState<ProfileTab>("viewResume");
  const dateNow = Date.now();
  const resumeRef = useRef<HTMLDivElement>(null);

  // Handle tab parameter from URL (e.g., from notifications)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "viewResume",
        "editResume",
        "applications",
        "inProgress",
        "viewId",
        "settings",
      ].includes(tab)
    ) {
      setProfileOptionsNav(tab as ProfileTab);
    }
  }, [searchParams]);

  // Auto-hide success toast
  useEffect(() => {
    if (showEditSuccess) {
      const timer = setTimeout(() => setShowEditSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEditSuccess]);

  // Handle profile details save
  // Handle profile details save
  // Handle profile details save
  const handleProfileDetailsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileDetailsAction({
        preferred_poa: profileEditHook.editPreferredPoa,
        applicant_type: profileEditHook.editApplicantType,
        name: user?.name || "",
      });
      setShowEditSuccess(true);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  // Handle resume save
  // Handle resume save
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

      // Refresh both user AND resume data
      await Promise.all([refreshUser(), refreshResume()]);

      setShowEditResume(false);
      setShowEditSuccess(true);
    } catch (error) {
      console.error("Failed to update resume:", error);
      // Handle error
    }
  };

  // Handle resume download
  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (resumeRef.current) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `${user?.name} Resume.pdf`,
          image: { type: "jpeg", quality: 0.2 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(resumeRef.current)
        .save();
    }
  };

  // Handle profile picture modal cancel
  const handleProfilePicCancel = () => {
    profilePictureHook.setShowModal(false);
    profilePictureHook.setCrop({ x: 0, y: 0 });
    profilePictureHook.setZoom(1);
  };

  // Loading and error states
  if (loading) return <BlocksWave />;
  if (!user) return <div>No user found.</div>;

  return (
    <>
      {/* Profile Picture Modal */}
      <ProfilePictureModal
        show={profilePictureHook.showModal}
        selectedFile={profilePictureHook.selectedFile}
        currentProfilePicUrl={user.profile_pic_url}
        dateNow={dateNow}
        crop={profilePictureHook.crop}
        zoom={profilePictureHook.zoom}
        uploading={profilePictureHook.uploading}
        isDragActive={profilePictureHook.isDragActive}
        onClose={() => profilePictureHook.setShowModal(false)}
        setCrop={profilePictureHook.setCrop}
        setZoom={profilePictureHook.setZoom}
        onCropComplete={profilePictureHook.onCropComplete}
        handleCropAndUpload={profilePictureHook.handleCropAndUpload}
        getRootProps={profilePictureHook.getRootProps}
        getInputProps={profilePictureHook.getInputProps}
        onCancel={handleProfilePicCancel}
      />

      {/* Success Toast */}
      <Toast
        show={showEditSuccess}
        onClose={() => setShowEditSuccess(false)}
        title="Success"
        message="Details updated!"
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

      {/* Main Profile Container */}
      <div className={styles.profileContainer}>
        {/* Profile Header Section */}
        <ProfileHeader
          user={user}
          dateNow={dateNow}
          showEdit={showEdit}
          editPreferredPoa={profileEditHook.editPreferredPoa}
          editApplicantType={profileEditHook.editApplicantType}
          onShowEditToggle={() => {
            setShowEdit((prev) => !prev);
            setShowEditSuccess(false);
          }}
          onProfilePicClick={() => profilePictureHook.setShowModal(true)}
          onSaveProfileDetails={handleProfileDetailsSave}
          setEditPreferredPoa={profileEditHook.setEditPreferredPoa}
          setEditApplicantType={profileEditHook.setEditApplicantType}
          onDataRefresh={async () => {
            await Promise.all([refreshUser(), refreshResume()]);
            setShowEditSuccess(true);
          }}
        />

        {/* Profile Options Section */}
        <div className={styles.profileOptionsContainer}>
          <div className={styles.profileOptionsContent}>
            {/* Navigation Tabs */}
            <ProfileNavigation
              activeTab={profileOptionsNav}
              onTabChange={setProfileOptionsNav}
            />

            {/* Resume View/Edit Section */}
            {profileOptionsNav === "viewResume" && (
              <>
                {showEditResume ? (
                  <ResumeEditSection
                    user={user}
                    {...profileEditHook}
                    onCancel={() => setShowEditResume(false)}
                    onSave={handleResumeSave}
                  />
                ) : (
                  <ResumeViewSection
                    user={user}
                    resume={resume}
                    dateNow={dateNow}
                    resumeRef={resumeRef}
                    onEdit={() => setShowEditResume(true)}
                    onDownload={handleDownload}
                  />
                )}
              </>
            )}

            {/* Applications Section */}
            {profileOptionsNav === "applications" && (
              <ApplicationsSection
                jobs={jobs}
                userApplications={userApplications}
              />
            )}

            {/* In Progress Applications Section */}
            {profileOptionsNav === "inProgress" && (
              <InProgressSection
                jobs={jobs}
                userApplicationIds={userApplications.map((app) => app.job_id)}
              />
            )}

            {/* View ID Section */}
            {profileOptionsNav === "viewId" && <ViewIdSection />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
