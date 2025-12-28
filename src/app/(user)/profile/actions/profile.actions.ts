"use server";

import {
  getUser as getUserService,
  updateProfileDetails as updateProfileDetailsService,
  uploadProfilePicture as uploadProfilePictureService,
} from "@/lib/db/services/user.service";
import {
  getResume as getResumeService,
  updateResume as updateResumeService,
  Education,
  WorkExperience,
} from "@/lib/db/services/resume.service";
import { getJobs as getJobsService } from "@/lib/db/services/job.service";
import { getUserApplications as getUserApplicationsService } from "@/lib/db/services/application.service";

// User actions
export async function getUserAction() {
  try {
    const userData = await getUserService();
    console.log("User data fetched:", userData); // Debug log
    return userData;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
}

export async function updateProfileDetailsAction(updates: {
  preferred_poa?: string;
  applicant_type?: string;
  name?: string;
}) {
  try {
    return await updateProfileDetailsService(updates);
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}

export async function uploadProfilePictureAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");
    return await uploadProfilePictureService(file);
  } catch (error) {
    console.error("Failed to upload profile picture:", error);
    throw error;
  }
}

// Resume actions
export async function getResumeAction() {
  try {
    return await getResumeService();
  } catch (error) {
    console.error("Failed to get resume:", error);
    return null;
  }
}

export async function updateResumeAction(data: {
  name: string;
  birth_date: string;
  address: string;
  sex: string;
  barangay: string;
  district: string;
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[];
  profile_introduction: string;
}) {
  try {
    return await updateResumeService(data);
  } catch (error) {
    console.error("Failed to update resume:", error);
    throw error;
  }
}

// Job and application actions
export async function getJobsAction() {
  try {
    return await getJobsService();
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return [];
  }
}

export async function getUserApplicationsAction() {
  try {
    return await getUserApplicationsService();
  } catch (error) {
    console.error("Failed to get user applications:", error);
    return [];
  }
}
