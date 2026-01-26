// src/app/(user)/profile/components/sections/ProfileHeader.tsx
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import styles from "./ProfileHeader.module.css";
import { User, ResumeData } from "../../types/profile.types";
import { SkillsAutocomplete } from "../SkillsAutocomplete";
import { DropdownChecklist } from "@/components/DropdownChecklist";
import { updateResumeAction } from "../../actions/profile.actions";

// Import constants from signup
const PREFERRED_PLACES = [
  "Baclaran",
  "Don Galo",
  "La Huerta",
  "San Dionisio",
  "Santo Niño",
  "Tambo",
  "Vitalez",
  "BF Homes",
  "Don Bosco",
  "Marcelo Green",
  "Merville",
  "Moonwalk",
  "San Antonio",
  "San Isidro",
  "San Martin de Porres",
  "Sun Valley",
] as const;

const APPLICANT_TYPES = [
  "Student",
  "Indigenous Person (IP)",
  "Out of School Youth",
  "Person with Disability (PWD)",
  "Rehabilitation Program Graduate",
  "Reintegrated Individual (Former Detainee)",
  "Returning Overseas Filipino Worker (OFW)",
  "Senior Citizen",
  "Solo Parent/Single Parent",
  "Others",
] as const;

interface ProfileHeaderProps {
  user: User;
  resume?: ResumeData | null;
  dateNow: number;
  onProfilePicClick: () => void;
  onDataRefresh: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  resume,
  dateNow,
  onProfilePicClick,
  onDataRefresh,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [editableOverview, setEditableOverview] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Editable contact info
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [editablePreferredPoa, setEditablePreferredPoa] = useState("");
  const [editableApplicantType, setEditableApplicantType] = useState<string[]>(
    [],
  );

  // Initialize editable skills and overview from resume
  useEffect(() => {
    if (resume?.skills) {
      setEditableSkills(resume.skills);
    }
    setEditableOverview(resume?.profile_introduction || "");
  }, [resume?.skills, resume?.profile_introduction]);

  // Initialize editable contact info
  useEffect(() => {
    setEditableEmail(user.email || "");
    setEditablePhone(user.phone || "");
    setEditablePreferredPoa(user.preferred_poa || "");
    // Parse applicant_type from comma-separated string to array
    if (user.applicant_type) {
      setEditableApplicantType(
        user.applicant_type.split(",").map((type) => type.trim()),
      );
    } else {
      setEditableApplicantType([]);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Ensure work_experiences is always an array
      const workExps = resume?.work_experiences
        ? Array.isArray(resume.work_experiences)
          ? resume.work_experiences
          : [resume.work_experiences]
        : [];

      // Update resume data
      await updateResumeAction({
        name: user.name,
        birth_date: user.birth_date,
        address: user.address,
        sex: user.sex,
        barangay: user.barangay,
        district: user.district,
        education: {
          school: resume?.education?.school || "",
          degree: resume?.education?.degree || "",
          attainment: resume?.education?.attainment || "",
          location: resume?.education?.location || "",
          start_date: resume?.education?.start_date || "",
          end_date: resume?.education?.end_date || "",
        },
        skills: editableSkills,
        work_experiences: workExps,
        profile_introduction: editableOverview,
      });

      // Update contact info via contact actions
      const { updatePhoneAction } =
        await import("../../actions/contact.actions");
      const { updateProfileDetailsAction } =
        await import("../../actions/profile.actions");

      if (editablePhone !== user.phone) {
        await updatePhoneAction(editablePhone);
      }

      await updateProfileDetailsAction({
        preferred_poa: editablePreferredPoa,
        applicant_type: editableApplicantType.join(", "),
      });

      setIsEditingProfile(false);
      onDataRefresh();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setEditableSkills(resume?.skills || []);
    setEditableOverview(resume?.profile_introduction || "");
    setEditableEmail(user.email || "");
    setEditablePhone(user.phone || "");
    setEditablePreferredPoa(user.preferred_poa || "");
    // Parse applicant_type from comma-separated string to array
    if (user.applicant_type) {
      setEditableApplicantType(
        user.applicant_type.split(",").map((type) => type.trim()),
      );
    } else {
      setEditableApplicantType([]);
    }
    setIsEditingProfile(false);
  };

  const handleApplicantTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setEditableApplicantType([...editableApplicantType, type]);
    } else {
      setEditableApplicantType(editableApplicantType.filter((t) => t !== type));
    }
  };

  return (
    <>
      <div className={styles.profileWrapper}>
        <div className={styles.profileContainer}>
          {/* Left Card - Profile Picture and Overview */}
          <div className={styles.profileCard}>
            <div
              className={styles.profileImageWrapper}
              onClick={onProfilePicClick}
            >
              <img
                src={
                  user.profile_pic_url
                    ? user.profile_pic_url + "?t=" + dateNow
                    : "/assets/images/default_profile.png"
                }
                alt={user.name}
                className={styles.profileImage}
              />
              <div className={styles.imageOverlay}>
                <svg
                  className={styles.cameraIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                <span className={styles.changePhotoText}>Change Photo</span>
              </div>
            </div>

            <h1 className={styles.profileName}>{user.name}</h1>

            {isEditingProfile ? (
              <textarea
                value={editableOverview}
                onChange={(e) => setEditableOverview(e.target.value)}
                className={styles.overviewTextarea}
                placeholder="Write a brief introduction about yourself, your skills, and what you're looking for..."
                rows={6}
              />
            ) : (
              <p className={styles.profileOverview}>
                {resume?.profile_introduction ||
                  "No profile overview yet. Click 'Edit Profile' to add an introduction about yourself."}
              </p>
            )}
          </div>

          {/* Right Card - Contact Info and Skills */}
          <div className={styles.infoCard}>
            {/* Edit Button */}
            {!isEditingProfile && (
              <button
                type="button"
                className={styles.editProfileButton}
                onClick={() => setIsEditingProfile(true)}
                title="Edit profile and skills"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            )}
            <div className={styles.contactSection}>
              {isEditingProfile ? (
                <>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>EMAIL:</span>
                    <input
                      type="email"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      className={styles.selectInput}
                      placeholder="Enter email"
                      disabled
                      title="Email cannot be changed in this mode"
                    />
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>PHONE:</span>
                    <input
                      type="tel"
                      value={editablePhone}
                      onChange={(e) => setEditablePhone(e.target.value)}
                      className={styles.selectInput}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>
                      PREFERRED PLACE OF ASSIGNMENT:
                    </span>
                    <select
                      value={editablePreferredPoa}
                      onChange={(e) => setEditablePreferredPoa(e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Select preferred place</option>
                      {PREFERRED_PLACES.map((place) => (
                        <option key={place} value={place}>
                          {place}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>APPLICANT TYPE:</span>
                    <div style={{ marginTop: "0.5rem" }}>
                      <DropdownChecklist
                        options={APPLICANT_TYPES}
                        selectedValues={editableApplicantType}
                        onChange={handleApplicantTypeChange}
                        placeholder="Select applicant type(s)"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>EMAIL:</span>
                    <span className={styles.contactValue}>{user.email}</span>
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>PHONE:</span>
                    <span className={styles.contactValue}>{user.phone}</span>
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>
                      PREFERRED PLACE OF ASSIGNMENT:
                    </span>
                    <span className={styles.contactValue}>
                      {user.preferred_poa || "Not set"}
                    </span>
                  </div>

                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>APPLICANT TYPE:</span>
                    <span className={styles.contactValue}>
                      {user.applicant_type || "Not set"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.skillsSection}>
              <h2 className={styles.skillsTitle}>SKILLS</h2>

              {isEditingProfile ? (
                <div className={styles.skillsEditContainer}>
                  <SkillsAutocomplete
                    selectedSkills={editableSkills}
                    onSkillsChange={setEditableSkills}
                    placeholder="Type to add skills..."
                  />
                </div>
              ) : (
                <div className={styles.skillsGrid}>
                  {resume?.skills && resume.skills.length > 0 ? (
                    resume.skills.map((skill: string, idx: number) => (
                      <div key={idx} className={styles.skillBadge}>
                        {skill}
                      </div>
                    ))
                  ) : (
                    <p className={styles.noSkills}>
                      No skills added yet. Click &apos;Edit Profile&apos; to add
                      your skills.
                    </p>
                  )}
                </div>
              )}
            </div>

            {isEditingProfile && (
              <div className={styles.profileEditButtonRow}>
                <Button
                  type="button"
                  variant="warning"
                  onClick={handleCancelProfileEdit}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="success"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
