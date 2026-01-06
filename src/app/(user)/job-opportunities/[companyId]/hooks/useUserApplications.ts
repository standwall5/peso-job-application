// src/app/(user)/job-opportunities/[companyId]/hooks/useUserApplications.ts
import { useState } from "react";

export const useUserApplications = () => {
  const [userApplications, setUserApplications] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getUserApplications");
      const data = await res.json();
      setUserApplications(data.map((app: { job_id: number }) => app.job_id));
    } catch (err) {
      console.log("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const submitFinalApplication = async (jobId: number) => {
    const response = await fetch("/api/submitResume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_id: jobId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to submit application");
    }

    // Refresh applications list
    await fetchUserApplications();
    return result;
  };

  return {
    userApplications,
    loading,
    fetchUserApplications,
    submitFinalApplication,
  };
};
