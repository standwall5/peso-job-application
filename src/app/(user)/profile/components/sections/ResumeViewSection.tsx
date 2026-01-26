// src/app/(user)/profile/components/sections/ResumeViewSection.tsx
import React, { useState } from "react";
import Resume from "../Resume";
import styles from "../Profile.module.css";
import { User, ResumeData, WorkExperience } from "../../types/profile.types";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ParsedResumeData } from "@/lib/utils/resume-parser";

interface ResumeViewSectionProps {
  user: User;
  resume: ResumeData | null;
  dateNow: number;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  onEdit: () => void;
  onDownload: () => void;
  onResumeDataParsed?: (data: ParsedResumeData) => void;
}

export const ResumeViewSection: React.FC<ResumeViewSectionProps> = ({
  user,
  resume,
  dateNow,
  resumeRef,
  onEdit,
  onDownload,
  onResumeDataParsed,
}) => {
  const [showResumeUploader, setShowResumeUploader] = useState(false);

  const handleParsedData = (data: ParsedResumeData) => {
    if (onResumeDataParsed) {
      onResumeDataParsed(data);
    }
    // Optionally switch to edit mode after upload
    onEdit();
  };
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
    <>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="var(--accent)"
            style={{ width: "1.75rem", height: "1.75rem" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            My Resume
          </h2>
        </div>
        <div
          style={{
            height: "3px",
            background: "var(--accent)",
            borderRadius: "2px",
            width: "100%",
          }}
        />
      </div>
      <div className={styles.resumeWrapper}>
        <div className={styles.resume}>
          <div className={styles.resumeIconButtons}>
            <button
              className={`${styles.resumeIconButton} ${styles.resumeUploadButton}`}
              onClick={() => setShowResumeUploader(true)}
              title="Upload Resume"
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </button>
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

        {/* Resume Upload Modal */}
        {showResumeUploader && (
          <ResumeUploader
            onParsedData={handleParsedData}
            onClose={() => setShowResumeUploader(false)}
          />
        )}
      </div>
    </>
  );
};
