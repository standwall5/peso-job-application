"use client";
import React, { forwardRef } from "react";
import styles from "./Resume.module.css";

interface Education {
  school?: string;
  degree?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

interface WorkExperience {
  company?: string;
  position?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

interface ResumeProps {
  profilePicUrl?: string | null; // Optional now, not used in Harvard style
  name?: string;
  birthDate?: string;
  address?: string;
  barangay?: string;
  district?: string;
  email?: string;
  phone?: string;
  education?: Education;
  skills?: string[];
  workExperiences?: WorkExperience[];
  profileIntroduction?: string;
}

const Resume = forwardRef<HTMLDivElement, ResumeProps>(
  (
    {
      profilePicUrl,
      name,
      birthDate,
      address,
      barangay,
      district,
      email,
      phone,
      education,
      skills,
      workExperiences,
      profileIntroduction,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={styles.resumeRoot}
        data-html2canvas-ignore-transparency="true"
      >
        {/* Harvard Style Header - Clean, professional, centered */}
        <div className={styles.resumeHeader}>
          <h1 className={styles.resumeName}>{name}</h1>
          <div className={styles.contactInfo}>
            <span>
              {address}, {barangay}, {district}, Parañaque City
            </span>
            <span className={styles.contactDivider}>•</span>
            <span>{phone}</span>
            <span className={styles.contactDivider}>•</span>
            <span>{email}</span>
          </div>
        </div>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>PERSONAL INFORMATION</h6>
          <div className={styles.personalInfo}>
            <div>
              <strong>Date of Birth:</strong> {birthDate}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>PROFESSIONAL SUMMARY</h6>
          <div className={styles.profileText}>
            <p>{profileIntroduction}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>EDUCATION</h6>
          <div className={styles.educationRow}>
            <div className={styles.educationLeft}>
              <strong>{education?.degree}</strong>
              <div>{education?.school}</div>
            </div>
            <div className={styles.educationRight}>
              <div>{education?.location}</div>
              <div>
                {education?.start_date} - {education?.end_date}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>SKILLS</h6>
          <ul className={styles.skillsList}>
            {(skills ?? []).map((skill: string, idx: number) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>

        {workExperiences &&
          workExperiences.filter(
            (work) =>
              work.company?.trim() ||
              work.position?.trim() ||
              work.location?.trim() ||
              work.start_date?.trim() ||
              work.end_date?.trim(),
          ).length > 0 && (
            <section className={styles.section}>
              <h6 className={styles.sectionTitle}>WORK EXPERIENCE</h6>
              {workExperiences
                .filter(
                  (work) =>
                    work.company?.trim() ||
                    work.position?.trim() ||
                    work.location?.trim() ||
                    work.start_date?.trim() ||
                    work.end_date?.trim(),
                )
                .map((work: WorkExperience, idx: number) => (
                  <div className={styles.workExpRow} key={idx}>
                    <div className={styles.workExpLeft}>
                      <strong>{work.company}</strong>
                      <div>{work.position}</div>
                    </div>
                    <div className={styles.workExpRight}>
                      <div>{work.location}</div>
                      <div>
                        {work.start_date} - {work.end_date}
                      </div>
                    </div>
                  </div>
                ))}
            </section>
          )}

        {/* Certification Statement */}
        {/*<section
          className={styles.section}
          style={{
            marginTop: "2rem",
            borderTop: "1px solid #ddd",
            paddingTop: "1rem",
          }}
        >
          <div
            className={styles.profileText}
            style={{
              fontStyle: "italic",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            <p>
              I hereby certify that the above information is true and correct to
              the best of my knowledge and belief.
            </p>
          </div>
        </section>*/}
      </div>
    );
  },
);

Resume.displayName = "Resume";

export default Resume;
