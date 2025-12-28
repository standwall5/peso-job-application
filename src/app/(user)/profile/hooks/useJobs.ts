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
        setUserApplications(
          applicationsData.map((app) => ({
            job_id: app.job_id,
            applied_date: app.applied_date,
            status: app.status,
          })),
        );
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
