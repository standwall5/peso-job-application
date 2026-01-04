import { useState } from "react";
import { JobApplication } from "../types/jobseeker.types";

export function useApplications(jobseekerId: number) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/getApplicantApplications?applicant_id=${jobseekerId}`,
      );
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: number,
    status: string,
  ) => {
    const response = await fetch(`/api/updateApplicationStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: applicationId,
        status: status,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update application status");
    }

    return result;
  };

  return {
    applications,
    loading,
    fetchApplications,
    updateApplicationStatus,
  };
}
