// src/app/(user)/profile/components/sections/ResumeViewSection.tsx
import React from "react";
import Resume from "../Resume";
import styles from "../Profile.module.css";
import { User, ResumeData, WorkExperience } from "../../types/profile.types";

interface ResumeViewSectionProps {
  user: User;
  resume: ResumeData | null;
  dateNow: number;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  onEdit: () => void;
  onDownload: () => void;
}

export const ResumeViewSection: React.FC<ResumeViewSectionProps> = ({
  user,
  resume,
  dateNow,
  resumeRef,
  onEdit,
  onDownload,
}) => {
  if (!resume) {
    return (
      <div
        style={{
          textAlign: "center",
          margin: "2rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3>No resume found.</h3>
        <p>Click below to create your resume.</p>
        <button
          className={styles.createResumeButton}
          onClick={onEdit}
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--button))",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create Resume
        </button>
      </div>
    );
  }

  const workExperiences: WorkExperience[] = Array.isArray(
    resume.work_experiences,
  )
    ? resume.work_experiences
    : resume.work_experiences
      ? [resume.work_experiences]
      : [];

  return (
    <div className={styles.resumeWrapper}>
      <div className={styles.resume}>
        <div className={styles.resumeIconButtons}>
          <button
            className={`${styles.resumeIconButton} ${styles.resumeEditButton}`}
            onClick={onEdit}
            title="Edit Resume"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="black"
              style={{ width: "1.25rem", height: "1.25rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
          <button
            className={`${styles.resumeIconButton} ${styles.resumeDownloadButton}`}
            onClick={onDownload}
            title="Download Resume"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="black"
              style={{ width: "1.25rem", height: "1.25rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        </div>
        <Resume
          ref={resumeRef}
          profilePicUrl={
            user.profile_pic_url
              ? user.profile_pic_url + "?t=" + dateNow
              : "/assets/images/default_profile.png"
          }
          name={user?.name}
          birthDate={user?.birth_date}
          address={user?.address}
          barangay={user?.barangay}
          district={user?.district}
          email={user?.email}
          phone={user?.phone}
          education={{
            school: resume?.education?.school,
            degree: resume?.education?.degree,
            location: resume?.education?.location,
            start_date: resume?.education?.start_date,
            end_date: resume?.education?.end_date,
          }}
          skills={resume?.skills}
          workExperiences={workExperiences}
          profileIntroduction={resume?.profile_introduction}
        />
      </div>
    </div>
  );
};
