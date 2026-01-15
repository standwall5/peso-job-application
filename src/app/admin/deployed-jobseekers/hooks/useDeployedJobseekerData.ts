// src/app/admin/deployed-jobseekers/hooks/useDeployedJobseekerData.ts

import { useEffect, useState, useMemo } from "react";
import { Application } from "@/app/admin/jobseekers/types/jobseeker.types";

export const useDeployedJobseekerData = () => {
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
      const response = await fetch("/api/getJobseekers?deployed=true");
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
    return (uniqueApplicants ?? []).filter((app) => {
      // Search filter
      const matchesSearch =
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
        app.status.toLowerCase().includes(search.toLowerCase());

      // Applicant type filter
      const matchesType =
        selectedApplicantTypes.length === 0 ||
        selectedApplicantTypes.includes(app.applicant.applicant_type);

      // Place filter
      const matchesPlace =
        selectedPlaces.length === 0 ||
        selectedPlaces.includes(app.applicant.preferred_poa);

      return matchesSearch && matchesType && matchesPlace;
    });
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
            b.applicant.applicant_type
          );
        case "place":
          return a.applicant.preferred_poa.localeCompare(
            b.applicant.preferred_poa
          );
        default:
          return 0;
      }
    });
  }, [filteredApplications, sortBy]);

  return {
    applications,
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    uniqueApplicants,
    sortedApplications,
    selectedApplicantTypes,
    setSelectedApplicantTypes,
    selectedPlaces,
    setSelectedPlaces,
  };
};
