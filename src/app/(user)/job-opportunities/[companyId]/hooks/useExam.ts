// src/app/(user)/job-opportunities/[companyId]/hooks/useExam.ts
import { useState } from "react";
import { Exam } from "../types/job.types";
import { ExamAttemptData } from "../types/application.types";
import { submitExam } from "@/lib/db/services/exam.service";

export const useExam = () => {
  const [examData, setExamData] = useState<Exam | null>(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [examAttempt, setExamAttempt] = useState<ExamAttemptData | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);

  const fetchExam = async (examId: number) => {
    setLoadingExam(true);
    try {
      const response = await fetch(`/api/getExam?id=${examId}`);
      const data = await response.json();
      setExamData(data);
    } catch (err) {
      console.error("Failed to fetch exam:", err);
      setExamData(null);
    } finally {
      setLoadingExam(false);
    }
  };

  const fetchExamAttempt = async (jobId: number, examId: number) => {
    setLoadingAttempt(true);
    try {
      const res = await fetch(
        `/api/exams/attempt?jobId=${jobId}&examId=${examId}`
      );
      const data = await res.json();
      console.log("Exam attempt data:", data);

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

  const handleExamSubmit = async (
    examId: number,
    jobId: number,
    answers: Record<number, number | number[] | string>
  ) => {
    try {
      const result = await submitExam({
        examId,
        jobId,
        answers,
      });

      if (result.success) {
        // Refresh exam attempt to show results
        await fetchExamAttempt(jobId, examId);
        return result;
      }

      return result;
    } catch (error) {
      console.error("Error submitting exam:", error);
      throw error;
    }
  };

  const resetExamData = () => {
    setExamData(null);
    setExamAttempt(null);
  };

  return {
    examData,
    loadingExam,
    examAttempt,
    loadingAttempt,
    fetchExam,
    fetchExamAttempt,
    handleExamSubmit,
    resetExamData,
  };
};
