// src/app/(user)/job-opportunities/[companyId]/components/application/ResumePreviewTab.tsx
"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/Button";
import UserProfile from "@/app/(user)/profile/components/UserProfile";
import jobStyle from "../../JobsOfCompany.module.css";

interface ResumePreviewTabProps {
  hasApplied: boolean;
  onContinueToExam: () => void;
}

const ResumePreviewTab: React.FC<ResumePreviewTabProps> = ({
  hasApplied,
  onContinueToExam,
}) => {
  return (
    <div className={`${jobStyle.applicantDetail}`}>
      <div className={jobStyle.applicantDetailResume}>
        <UserProfile />
      </div>
      <div className={jobStyle.applicantDetailButtons}>
        {!hasApplied ? (
          <>
            <Link href="/profile">
              <Button variant="primary">Edit Profile</Button>
            </Link>
            <Button variant="success" onClick={onContinueToExam}>
              Continue to Exam
            </Button>
          </>
        ) : (
          <>
            <Link href="/profile">
              <Button variant="primary">View Profile</Button>
            </Link>
            <Button disabled variant="success">
              Application Submitted
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumePreviewTab;
