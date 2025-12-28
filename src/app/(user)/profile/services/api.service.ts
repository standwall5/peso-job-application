// src/app/(user)/profile/services/api.service.ts
import {
  User,
  ResumeData,
  Job,
  UserApplication,
  Education,
  WorkExperience,
} from "../types/profile.types";

export class ProfileApiService {
  // Fetch user data
  static async getUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/getUser");
      if (response.ok) {
        const json = await response.json();
        return json && Object.keys(json).length > 0 ? (json as User) : null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  // Fetch resume data
  static async getResume(): Promise<ResumeData | null> {
    try {
      const response = await fetch("/api/getResume");
      if (response.ok) {
        const json = await response.json();
        return json && Object.keys(json).length > 0
          ? (json as ResumeData)
          : null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch resume:", error);
      return null;
    }
  }

  // Fetch all jobs
  static async getJobs(): Promise<Job[]> {
    try {
      const response = await fetch("/api/getJobs");
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      return [];
    }
  }

  // Fetch user applications
  static async getUserApplications(): Promise<UserApplication[]> {
    try {
      const response = await fetch("/api/getUserApplications");
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Failed to fetch user applications:", error);
      return [];
    }
  }

  // Update profile details
  static async updateProfileDetails(data: {
    preferred_poa: string;
    applicant_type: string;
    name: string;
  }): Promise<void> {
    await fetch("/api/updateProfileDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // Update resume
  static async updateResume(data: {
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
  }): Promise<void> {
    await fetch("/api/updateResume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // Upload profile picture
  static async uploadProfilePic(file: File): Promise<{ url: string } | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/uploadProfilePic", {
        method: "POST",
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to upload profile pic:", error);
      return null;
    }
  }
}
