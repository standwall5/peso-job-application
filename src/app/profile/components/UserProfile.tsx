"use client";
import BlocksWave from "@/components/BlocksWave";
import styles from "./Resume.module.css";
import { useState, useEffect } from "react";

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

interface ResumeData {
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[] | WorkExperience;
  profile_introduction: string;
}

interface User {
  name: string;
  birth_date: string;
  age: number;
  address: string;
  sex: string;
  barangay: string;
  district: string;
  email: string;
  phone: string;
  profile_pic_url: string | null;
  preferred_poa: string;
  applicant_type: string;
}

const Resume = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [userResponse, resumeResponse] = await Promise.all([
          fetch("/api/getUser"),
          fetch("/api/getResume"),
        ]);

        let userData: User | null = null;
        if (userResponse.ok) {
          const json = await userResponse.json();
          userData =
            json && Object.keys(json).length > 0 ? (json as User) : null;
        }

        let resumeData: ResumeData | null = null;
        if (resumeResponse.ok) {
          const json = await resumeResponse.json();
          resumeData =
            json && Object.keys(json).length > 0 ? (json as ResumeData) : null;
        } // non-OK (e.g. 404) => keep as null

        setUser(userData);
        setResume(resumeData);
      } catch (err) {
        console.error("Fetch failed:", err);
        setUser(null);
        setResume(null);
      }
    }
    fetchAll();
  }, []);

  if (!user || !resume) {
    return <BlocksWave />;
  }
  return (
    <div className={styles.resumeRoot} style={{ zoom: "60%" }}>
      <div className={styles.resumeHeader}>
        <img
          src={user.profile_pic_url || "/assets/images/default_profile.png"}
          alt="Profile"
          className={styles.profilePic}
        />
        <div className={styles.headerInfo}>
          <h2 className={styles.resumeName}>{user.name}</h2>
          <hr className={styles.resumeHr} />
        </div>
      </div>

      <section className={styles.section}>
        <h6 className={styles.sectionTitle}>Personal Information</h6>
        <div className={styles.personalInfo}>
          <div>BirthDate: {user.birth_date}</div>
          <div>
            {user.address}, {user.barangay}
          </div>
          <div>{user.district}, Paranaque City</div>
          <div>{user.email}</div>
          <div>{user.phone}</div>
        </div>
      </section>

      <section className={styles.section}>
        <h6 className={styles.sectionTitle}>Highest Educational Attainment</h6>
        <div className={styles.educationRow}>
          <div className={styles.educationLeft}>
            <strong>{resume.education?.school}</strong>
            <div>{resume.education?.degree}</div>
          </div>
          <div className={styles.educationRight}>
            <div>{resume.education?.location}</div>
            <div>
              {resume.education?.start_date} - {resume.education?.end_date}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h6 className={styles.sectionTitle}>Skills & Interests</h6>
        <ul className={styles.skillsList}>
          {(resume.skills ?? []).map((skill: string, idx: number) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h6 className={styles.sectionTitle}>Work Experiences</h6>
        {(Array.isArray(resume.work_experiences)
          ? resume.work_experiences
          : []
        ).map((work: WorkExperience, idx: number) => (
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

      <section className={styles.section}>
        <h6 className={styles.sectionTitle}>Profile</h6>
        <div className={styles.profileText}>
          <p>{resume.profile_introduction}</p>
        </div>
      </section>
    </div>
  );
};

Resume.displayName = "Resume";

export default Resume;
