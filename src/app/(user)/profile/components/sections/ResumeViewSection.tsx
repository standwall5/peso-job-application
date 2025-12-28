// src/app/(user)/profile/components/sections/ResumeViewSection.tsx
import React from "react";
import Button from "@/components/Button";
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
        <Button
          className={styles.createResumeButton}
          onClick={onEdit}
          variant="primary"
        >
          Create Resume
        </Button>
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
        <div className={styles.resumeButtonContainer}>
          <Button
            className={styles.resumeButton}
            onClick={onEdit}
            variant="success"
          >
            Edit Resume
          </Button>
          <Button
            className={styles.resumeButton}
            onClick={onDownload}
            variant="danger"
          >
            Download Resume
          </Button>
        </div>
      </div>
    </div>
  );
};
