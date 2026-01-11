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
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
}

interface ResumeProps {
  profilePicUrl: string | null;
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
        <div className={styles.resumeHeader}>
          <img
            src={profilePicUrl || "/default-profile.png"}
            alt="Profile"
            className={styles.profilePic}
            crossOrigin="anonymous"
          />
          <div className={styles.headerInfo}>
            <h2 className={styles.resumeName}>{name}</h2>
            <hr className={styles.resumeHr} />
          </div>
        </div>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Personal Information</h6>
          <div className={styles.personalInfo}>
            <div>Birth Date: {birthDate}</div>
            <div>
              {address}, {barangay}
            </div>
            <div>{district}, Paranaque City</div>
            <div>{email}</div>
            <div>{phone}</div>
          </div>
        </section>

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>
            Highest Educational Attainment
          </h6>
          <div className={styles.educationRow}>
            <div className={styles.educationLeft}>
              <strong>{education?.school}</strong>
              <div>{education?.degree}</div>
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
          <h6 className={styles.sectionTitle}>Skills & Interests</h6>
          <ul className={styles.skillsList}>
            {(skills ?? []).map((skill: string, idx: number) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>

        {workExperiences && (
          <section className={styles.section}>
            <h6 className={styles.sectionTitle}>Work Experiences</h6>
            {(Array.isArray(workExperiences) ? workExperiences : []).map(
              (work: WorkExperience, idx: number) => (
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
              ),
            )}
          </section>
        )}

        <section className={styles.section}>
          <h6 className={styles.sectionTitle}>Overview</h6>
          <div className={styles.profileText}>
            <p>{profileIntroduction}</p>
          </div>
        </section>

        {/* Certification Statement */}
        <section
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
        </section>
      </div>
    );
  },
);

Resume.displayName = "Resume";

export default Resume;
