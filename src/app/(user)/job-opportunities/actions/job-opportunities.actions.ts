"use server";

import { getJobs } from "@/lib/db/services/job.service";
import { getResume } from "@/lib/db/services/resume.service";

export async function getJobsAction() {
  try {
    const jobs = await getJobs();
    return jobs;
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return [];
  }
}

export async function getResumeAction() {
  try {
    const resume = await getResume();
    return resume;
  } catch (error) {
    console.error("Failed to get resume:", error);
    return null;
  }
}

export async function getUserSkillsAction() {
  try {
    const resume = await getResume();
    return resume?.skills || [];
  } catch (error) {
    console.error("Failed to get user skills:", error);
    return [];
  }
}
