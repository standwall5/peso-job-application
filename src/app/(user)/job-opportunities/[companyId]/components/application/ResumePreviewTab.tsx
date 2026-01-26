// src/app/(user)/job-opportunities/[companyId]/components/application/ResumePreviewTab.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Resume from "@/app/(user)/profile/components/Resume";
import jobStyle from "../../JobsOfCompany.module.css";
import { createClient } from "@/utils/supabase/client";
import BlocksWave from "@/components/BlocksWave";

interface ResumePreviewTabProps {
  hasApplied: boolean;
  onContinueToExam: () => void;
  onEditResume?: () => void;
}

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

interface ResumeData {
  education?: Education;
  skills?: string[];
  work_experiences?: WorkExperience[] | WorkExperience;
  profile_introduction?: string;
}

interface UserData {
  name?: string;
  birth_date?: string;
  address?: string;
  barangay?: string;
  district?: string;
  email?: string;
  phone?: string;
  profile_pic_url?: string | null;
}

const ResumePreviewTab: React.FC<ResumePreviewTabProps> = ({
  hasApplied,
  onContinueToExam,
  onEditResume,
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setLoading(false);
          return;
        }

        // Fetch user data from applicants table
        const { data: userData } = await supabase
          .from("applicants")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (userData) {
          setUser({
            ...userData,
            email: authUser.email,
          });

          // Fetch resume data from resume table using applicant_id
          const { data: resumeData } = await supabase
            .from("resume")
            .select("*")
            .eq("applicant_id", userData.id)
            .single();

          if (resumeData) {
            setResume(resumeData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const workExperiences: WorkExperience[] = Array.isArray(
    resume?.work_experiences,
  )
    ? resume.work_experiences
    : resume?.work_experiences
      ? [resume.work_experiences]
      : [];

  if (loading) {
    return (
      <div className={jobStyle.applicantDetail}>
        <BlocksWave color="var(--accent)" />
      </div>
    );
  }

  if (!user || !resume) {
    return (
      <div className={jobStyle.applicantDetail}>
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <h3>No resume found</h3>
          <p>Please create your resume in your profile to continue.</p>
          {onEditResume && (
            <button
              onClick={onEditResume}
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Create Resume
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${jobStyle.applicantDetail}`}>
        {/* Resume Preview with Action Buttons - Wrapped in relative container */}
        <div
          className={jobStyle.applicantDetailResume}
          style={{ position: "relative", width: "100%", maxWidth: "800px" }}
        >
          {/* Resume Content */}
          <div
            onClick={() => setIsEnlarged(true)}
            style={{ cursor: "pointer" }}
            title="Click to enlarge"
          >
            <Resume
              ref={resumeRef}
              name={user.name}
              birthDate={user.birth_date}
              address={user.address}
              barangay={user.barangay}
              district={user.district}
              email={user.email}
              phone={user.phone}
              education={resume.education}
              skills={resume.skills}
              workExperiences={workExperiences}
              profileIntroduction={resume.profile_introduction}
            />
          </div>
          {/* Action Buttons - Top Right */}
          <div className={jobStyle.resumeIconButtons}>
            {onEditResume && (
              <button
                className={`${jobStyle.resumeIconButton} ${jobStyle.resumeEditButton}`}
                onClick={onEditResume}
                title="Edit Resume"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  style={{ width: "1.25rem", height: "1.25rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                {/*<span>Edit</span>*/}
              </button>
            )}
            <button
              className={`${jobStyle.resumeIconButton} ${jobStyle.resumeDownloadButton}`}
              onClick={() => setIsEnlarged(true)}
              title="View Full Resume"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                style={{ width: "1.25rem", height: "1.25rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
              {/*<span>Enlarge</span>*/}
            </button>
          </div>
        </div>

        {hasApplied && (
          <div className={jobStyle.applicationSubmittedBadge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "1.25rem", height: "1.25rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Application Submitted</span>
          </div>
        )}
      </div>

      {/* Enlarged Resume Modal */}
      {isEnlarged && (
        <div
          className={jobStyle.enlargedResumeOverlay}
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className={jobStyle.enlargedResumeContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={jobStyle.enlargedCloseButton}
              onClick={() => setIsEnlarged(false)}
              aria-label="Close enlarged view"
            >
              ✕
            </button>
            {onEditResume && (
              <button
                className={jobStyle.enlargedEditIcon}
                onClick={() => {
                  setIsEnlarged(false);
                  onEditResume();
                }}
                title="Edit Resume"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  style={{ width: "1.25rem", height: "1.25rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            )}
            <div className={jobStyle.enlargedResumeWrapper}>
              <Resume
                name={user.name}
                birthDate={user.birth_date}
                address={user.address}
                barangay={user.barangay}
                district={user.district}
                email={user.email}
                phone={user.phone}
                education={resume.education}
                skills={resume.skills}
                workExperiences={workExperiences}
                profileIntroduction={resume.profile_introduction}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumePreviewTab;
