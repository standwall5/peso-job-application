"use client";
import BlocksWave from "@/components/BlocksWave";
import styles from "./Profile.module.css";
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

const UserProfile = () => {
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
        }

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
    <div className={styles.profileContainer}>
      {/* Left Card - Profile Picture and Name */}
      <div className={styles.profileCard}>
        <div className={styles.profileImageWrapper}>
          <img
            src={user.profile_pic_url || "/assets/images/default_profile.png"}
            alt={user.name}
            className={styles.profileImage}
          />
        </div>
        <h1 className={styles.profileName}>{user.name}</h1>
        <p className={styles.profileOverview}>
          {resume.profile_introduction || "No overview available"}
        </p>
      </div>

      {/* Right Card - Contact Info and Skills */}
      <div className={styles.infoCard}>
        <div className={styles.contactSection}>
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
            <span className={styles.contactValue}>{user.preferred_poa}</span>
          </div>

          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>APPLICANT TYPE:</span>
            <span className={styles.contactValue}>{user.applicant_type}</span>
          </div>
        </div>

        <div className={styles.skillsSection}>
          <h2 className={styles.skillsTitle}>SKILLS</h2>
          <div className={styles.skillsGrid}>
            {resume.skills && resume.skills.length > 0 ? (
              resume.skills.map((skill: string, idx: number) => (
                <div key={idx} className={styles.skillBadge}>
                  {skill}
                </div>
              ))
            ) : (
              <p className={styles.noSkills}>No skills added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

UserProfile.displayName = "UserProfile";

export default UserProfile;
