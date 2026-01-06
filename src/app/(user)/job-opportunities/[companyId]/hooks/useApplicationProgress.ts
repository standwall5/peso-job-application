// src/app/(user)/job-opportunities/[companyId]/hooks/useApplicationProgress.ts
import { useState } from "react";
import {
  ApplicationProgress,
  ApplicationProgressResponse,
} from "../types/application.types";

export const useApplicationProgress = () => {
  const [applicationProgress, setApplicationProgress] = useState<
    Record<number, ApplicationProgress>
  >({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const res = await fetch("/api/application-progress");
      const data = await res.json();
      if (data.progress && Array.isArray(data.progress)) {
        const progressMap: Record<number, ApplicationProgress> = {};
        data.progress.forEach((p: ApplicationProgressResponse) => {
          progressMap[p.job_id] = {
            resume_viewed: p.resume_viewed,
            exam_completed: p.exam_completed,
            verified_id_uploaded: p.verified_id_uploaded,
          };
        });
        setApplicationProgress(progressMap);
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const updateProgress = async (
    jobId: number,
    updates: Partial<ApplicationProgress>
  ) => {
    const currentProgress = applicationProgress[jobId] || {
      resume_viewed: false,
      exam_completed: false,
      verified_id_uploaded: false,
    };

    const newProgress = { ...currentProgress, ...updates };

    // Optimistically update UI
    setApplicationProgress((prev) => ({
      ...prev,
      [jobId]: newProgress,
    }));

    // Save to server
    try {
      await fetch("/api/application-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          resumeViewed: newProgress.resume_viewed,
          examCompleted: newProgress.exam_completed,
          verifiedIdUploaded: newProgress.verified_id_uploaded,
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
      // Revert on error
      setApplicationProgress((prev) => ({
        ...prev,
        [jobId]: currentProgress,
      }));
    }
  };

  const clearProgress = async (jobId: number) => {
    try {
      await fetch(`/api/application-progress?jobId=${jobId}`, {
        method: "DELETE",
      });
      setApplicationProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[jobId];
        return newProgress;
      });
    } catch (err) {
      console.error("Failed to clear progress:", err);
    }
  };

  return {
    applicationProgress,
    loadingProgress,
    fetchProgress,
    updateProgress,
    clearProgress,
  };
};
