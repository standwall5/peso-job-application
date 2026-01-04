import React from "react";
import Image from "next/image";
import styles from "../ManageJobseeker.module.css";
import { Jobseeker } from "../../types/jobseeker.types";

interface JobseekerHeaderProps {
  jobseeker: Jobseeker;
}

export default function JobseekerHeader({ jobseeker }: JobseekerHeaderProps) {
  return (
    <div className={styles.jobseekerContainer}>
      <Image
        src={
          jobseeker?.resume?.profile_pic_url ||
          "/assets/images/default_profile.png"
        }
        alt="Jobseeker Profile Picture"
        width={84}
        height={84}
      />
      <div className={styles.jobseekerDetails}>
        <h2>Applicant</h2>
        <span className={styles.jobseekerName}>{jobseeker.applicant.name}</span>
        <span className={styles.jobseekerPreferredPOA}>
          Preferred Place of Assignment: {jobseeker.applicant.preferred_poa}
        </span>
        <span className={styles.jobseekerType}>
          Applicant Type: {jobseeker.applicant.applicant_type}
        </span>
      </div>
    </div>
  );
}
