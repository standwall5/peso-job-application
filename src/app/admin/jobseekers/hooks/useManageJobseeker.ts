import { useState } from "react";
import { ExamAttemptData } from "../types/jobseeker.types";

export function useManageJobseeker() {
  const [examAttempt, setExamAttempt] = useState<ExamAttemptData | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
  });

  const showToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
  };

  const fetchExamAttempt = async (
    jobId: number,
    examId: number,
    applicantId: number,
  ) => {
    setLoadingAttempt(true);
    try {
      const res = await fetch(
        `/api/admin/exams/attempt?jobId=${jobId}&examId=${examId}&applicantId=${applicantId}`,
      );
      const data = await res.json();

      if (data.attempt) {
        setExamAttempt(data);
      } else {
        setExamAttempt(null);
      }
    } catch (err) {
      console.error("Failed to fetch exam attempt:", err);
      setExamAttempt(null);
    } finally {
      setLoadingAttempt(false);
    }
  };

  return {
    examAttempt,
    loadingAttempt,
    fetchExamAttempt,
    toast,
    showToast,
    setToast,
  };
}
