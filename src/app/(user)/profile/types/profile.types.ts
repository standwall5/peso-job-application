// src/app/(user)/profile/types/profile.types.ts

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
}

export interface Education {
  school: string;
  degree: string;
  attainment: string;
  location: string;
  start_date: string;
  end_date: string;
}

export interface ResumeData {
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[] | WorkExperience;
  profile_introduction: string;
}

export interface User {
  name: string;
  birth_date: string;
  age: number;
  address: string;
  sex: string;
  city: string;
  barangay: string;
  district: string;
  email: string;
  phone: string;
  profile_pic_url: string | null;
  preferred_poa: string;
  applicant_type: string;
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  exam_id?: number | null;
  companies: {
    name: string;
    logo: string | null;
  };
}

export interface UserApplication {
  id: number;
  job_id: number;
  applied_date: string;
  status: string;
}

export type ProfileTab =
  | "profileDetails"
  | "viewResume"
  | "editResume"
  | "applications"
  | "inProgress"
  | "viewId"
  | "settings";
