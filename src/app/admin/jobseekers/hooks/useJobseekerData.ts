// src/app/admin/jobseekers/hooks/useJobseekerData.ts

import { useEffect, useState, useMemo } from "react";
import { Application } from "../types/jobseeker.types";

export const useJobseekerData = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [selectedApplicantTypes, setSelectedApplicantTypes] = useState<
    string[]
  >([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch("/api/getJobseekers");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Get unique applicants (deduplicate by applicant_id)
  const uniqueApplicants = useMemo(() => {
    const applicantMap = new Map<number, Application>();

    applications.forEach((app) => {
      const applicantId = app.applicant_id || app.applicant.id;

      if (!applicantMap.has(applicantId)) {
        applicantMap.set(applicantId, app);
      } else {
        const existing = applicantMap.get(applicantId)!;
        const existingDate = new Date(existing.applied_date || 0).getTime();
        const currentDate = new Date(app.applied_date || 0).getTime();

        if (currentDate > existingDate) {
          applicantMap.set(applicantId, app);
        }
      }
    });

    return Array.from(applicantMap.values());
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = uniqueApplicants ?? [];

    // Apply text search filter
    if (search) {
      filtered = filtered.filter(
        (app) =>
          app.applicant.name.toLowerCase().includes(search.toLowerCase()) ||
          app.applicant.sex.toLowerCase().includes(search.toLowerCase()) ||
          app.applicant.applicant_type
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (app.applicant.disability_type ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          app.applicant.preferred_poa
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          app.applicant.barangay.toLowerCase().includes(search.toLowerCase()) ||
          app.applicant.district.toLowerCase().includes(search.toLowerCase()) ||
          app.status.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply applicant type filter
    if (selectedApplicantTypes.length > 0) {
      filtered = filtered.filter((app) =>
        selectedApplicantTypes.includes(app.applicant.applicant_type),
      );
    }

    // Apply place of assignment filter
    if (selectedPlaces.length > 0) {
      filtered = filtered.filter((app) =>
        selectedPlaces.includes(app.applicant.preferred_poa),
      );
    }

    return filtered;
  }, [uniqueApplicants, search, selectedApplicantTypes, selectedPlaces]);

  // Sort applications
  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.applicant.name.localeCompare(b.applicant.name);
        case "date":
          return (
            new Date(b.applied_date || 0).getTime() -
            new Date(a.applied_date || 0).getTime()
          );
        case "type":
          return a.applicant.applicant_type.localeCompare(
            b.applicant.applicant_type,
          );
        case "place":
          return a.applicant.preferred_poa.localeCompare(
            b.applicant.preferred_poa,
          );
        default:
          return 0;
      }
    });
  }, [filteredApplications, sortBy]);

  // Count unique active applications
  const activeApplicationsCount = useMemo(() => {
    const activeApplicantIds = new Set(
      applications
        .filter((a) => a.status === "pending")
        .map((a) => a.applicant_id || a.applicant.id),
    );
    return activeApplicantIds.size;
  }, [applications]);

  return {
    applications,
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    uniqueApplicants,
    sortedApplications,
    activeApplicationsCount,
    selectedApplicantTypes,
    setSelectedApplicantTypes,
    selectedPlaces,
    setSelectedPlaces,
  };
};
