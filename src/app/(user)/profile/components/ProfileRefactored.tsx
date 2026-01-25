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
import { ProfileNavigation } from "./sections/ProfileNavigation/ProfileNavigation";
import { ResumeViewSection } from "./sections/ResumeViewSection";
import { ResumeEditSection } from "./sections/ResumeEditSection";
import { ApplicationsSection } from "./sections/ApplicationsSection";
import { ViewIdSection } from "./sections/ViewIdSection";

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

  // Default to "profileDetails" to show the centered card first
  const [profileOptionsNav, setProfileOptionsNav] =
    useState<ProfileTab>("profileDetails");

  // Drawer State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dateNow = Date.now();
  const resumeRef = useRef<HTMLDivElement>(null);

  // Handle tab parameter from URL (e.g., from notifications)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "profileDetails",
        "viewResume",
        "editResume",
        "applications",
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
  const handleProfileDetailsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileDetailsAction({
        preferred_poa: profileEditHook.editPreferredPoa,
        applicant_type: profileEditHook.editApplicantType,
        name: user?.name || "",
      });
      setShowEditSuccess(true);
      setShowEdit(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

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
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
          },
          jsPDF: {
            unit: "in",
            format: "letter",
            orientation: "portrait",
          },
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

  // Nav change handler to close menu
  const handleNavChange = (tab: ProfileTab) => {
    setProfileOptionsNav(tab);
    setIsMenuOpen(false);
  };

  // Loading and error states
  if (loading) return <BlocksWave />;
  if (!user) return <div>No user found.</div>;

  return (
    <>
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

      {/* Hamburger Button */}
      <button
        className={`${styles.hamburgerButton} ${isMenuOpen ? styles.shifted : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`${styles.sidebarOverlay} ${isMenuOpen ? styles.open : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div className={`${styles.sidebar} ${isMenuOpen ? styles.open : ""}`}>
        <ProfileNavigation
          activeTab={profileOptionsNav}
          onTabChange={handleNavChange}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`${styles.profileContainer} ${isMenuOpen ? styles.contentShifted : ""}`}
      >
        {/* VIEW 1: Centered Profile Details (Home) */}
        {profileOptionsNav === "profileDetails" && (
          <ProfileHeader
            user={user}
            resume={resume}
            dateNow={dateNow}
            onProfilePicClick={() => profilePictureHook.setShowModal(true)}
            onDataRefresh={async () => {
              await Promise.all([refreshUser(), refreshResume()]);
              // setShowEditSuccess(true); // Don't show toast just for load, only save
            }}
          />
        )}

        {/* VIEW 2: Resume */}
        {profileOptionsNav === "viewResume" && (
          <div className={styles.sectionContainer}>
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
          </div>
        )}

        {/* VIEW 3: Applications */}
        {profileOptionsNav === "applications" && (
          <div className={styles.sectionContainer}>
            <ApplicationsSection
              jobs={jobs}
              userApplications={userApplications}
            />
          </div>
        )}

        {/* VIEW 4: View ID */}
        {profileOptionsNav === "viewId" && (
          <div className={styles.sectionContainer}>
            <ViewIdSection />
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
