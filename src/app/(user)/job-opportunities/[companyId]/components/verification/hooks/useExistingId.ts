// Custom hook for fetching and managing existing ID data
import { useState, useEffect } from "react";
import { getMyID, ApplicantIDData } from "@/lib/db/services/applicant-id.service";

export function useExistingId() {
  const [existingId, setExistingId] = useState<ApplicantIDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExistingId = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyID();
      setExistingId(data);
    } catch (err) {
      console.error("Error fetching existing ID:", err);
      setError("Failed to load existing ID");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingId();
  }, []);

  return {
    existingId,
    loading,
    error,
    refetch: fetchExistingId,
  };
}
