import React from "react";
import Resume from "@/app/(user)/profile/components/Resume";
import styles from "../ManageJobseeker.module.css";
import { Jobseeker } from "../../types/jobseeker.types";

interface PreviewResumeTabProps {
  jobseeker: Jobseeker;
}

export default function PreviewResumeTab({ jobseeker }: PreviewResumeTabProps) {
  if (!jobseeker.resume) {
    return (
      <div className={styles.noData}>
        <p>No resume available for this jobseeker.</p>
      </div>
    );
  }

  return (
    <div className={styles.resumeContainer}>
      <Resume
        profilePicUrl={
          jobseeker.resume.profile_pic_url ??
          "/assets/images/default_profile.png"
        }
        name={jobseeker.applicant.name}
        birthDate={jobseeker.applicant.birth_date}
        address={jobseeker.applicant.address}
        barangay={jobseeker.applicant.barangay}
        district={jobseeker.applicant.district}
        email={jobseeker.applicant.email}
        phone={jobseeker.applicant.phone}
        education={jobseeker.resume.education}
        skills={
          Array.isArray(jobseeker.resume.skills)
            ? jobseeker.resume.skills
            : typeof jobseeker.resume.skills === "string"
              ? jobseeker.resume.skills.split(",").map((s) => s.trim())
              : undefined
        }
        workExperiences={jobseeker.resume.work_experiences}
        profileIntroduction={jobseeker.resume.profile_introduction}
      />
    </div>
  );
}
