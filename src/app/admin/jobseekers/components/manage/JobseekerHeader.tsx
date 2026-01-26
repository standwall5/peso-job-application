"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "../Jobseekers.module.css";
import { Jobseeker } from "../../types/jobseeker.types";
import { useAdminChat } from "@/contexts/AdminChatContext";
import Toast from "@/components/toast/Toast";

interface JobseekerHeaderProps {
  jobseeker: Jobseeker;
}

export default function JobseekerHeader({ jobseeker }: JobseekerHeaderProps) {
  const { chatWidgetRef } = useAdminChat();
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
  });

  const handleMessageJobseeker = async () => {
    if (!chatWidgetRef?.current) {
      setToast({
        show: true,
        title: "Error",
        message: "Chat widget not available",
      });
      return;
    }

    try {
      await chatWidgetRef.current.initiateChat(
        jobseeker.id,
        jobseeker.applicant.name,
      );
      setToast({
        show: true,
        title: "Success",
        message: `Chat started with ${jobseeker.applicant.name}`,
      });
    } catch (error) {
      setToast({
        show: true,
        title: "Error",
        message: "Failed to start chat. Please try again.",
      });
    }
  };

  return (
    <>
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
          <span className={styles.jobseekerName}>
            {jobseeker.applicant.name}
          </span>
          <span className={styles.jobseekerPreferredPOA}>
            Preferred Place of Assignment: {jobseeker.applicant.preferred_poa}
          </span>
          <span className={styles.jobseekerType}>
            Applicant Type: {jobseeker.applicant.applicant_type}
          </span>
        </div>
        <button
          className={styles.messageJobseekerBtn}
          onClick={handleMessageJobseeker}
          title="Start a chat with this jobseeker"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fillRule="evenodd"
              d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
              clipRule="evenodd"
            />
          </svg>
          Message Jobseeker
        </button>
      </div>

      {toast.show && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast({ show: false, title: "", message: "" })}
        />
      )}
    </>
  );
}
