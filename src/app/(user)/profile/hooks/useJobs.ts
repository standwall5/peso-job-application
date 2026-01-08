import { useState, useEffect } from "react";
import { Job, UserApplication } from "../types/profile.types";
import {
  getJobsAction,
  getUserApplicationsAction,
} from "../actions/profile.actions";

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<UserApplication[]>(
    [],
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsData, applicationsData] = await Promise.all([
          getJobsAction(),
          getUserApplicationsAction(),
        ]);

        setJobs(jobsData);

        const mappedApplications: UserApplication[] = applicationsData.map(
          (app) => ({
            id: app.id,
            job_id: app.job_id,
            applied_date: app.applied_date,
            status: app.status,
          }),
        );

        setUserApplications(mappedApplications);
      } catch (error) {
        console.error("Failed to fetch jobs and applications:", error);
      }
    }
    fetchData();
  }, []);

  return {
    jobs,
    userApplications,
  };
};
