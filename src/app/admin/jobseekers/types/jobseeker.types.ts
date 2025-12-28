// src/app/admin/jobseekers/types/jobseeker.types.ts

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface Education {
  school?: string;
  degree?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

export interface SelectedResume {
  profile_pic_url: string | null;
  applicant: {
    name: string;
    birth_date: string;
    address: string;
    barangay: string;
    district: string;
    email: string;
    phone: string;
    preferred_poa?: string;
    applicant_type?: string;
  };
  company: {
    id: number;
    name: string;
    logo?: string | null;
  };
  job: {
    id?: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  };
  education: Education;
  skills: string[] | string;
  work_experiences: WorkExperience[];
  profile_introduction?: string;
}

export interface Application {
  id: number;
  name: string;
  type: string;
  place: string;
  date: string;
  status: string;
  resume: SelectedResume | null;
  avatar: string;
  selected: boolean;
  applied_date?: string;
  applicant: {
    id: number;
    name: string;
    birth_date: string;
    age: number;
    address: string;
    sex: string;
    barangay: string;
    district: string;
    email: string;
    phone: string;
    profile_pic_url: string | null;
    preferred_poa: string;
    applicant_type: string;
    disability_type?: string;
  };
  applicant_id: number;
}

// Define AppliedJob locally to avoid export issues
export interface AppliedJob {
  id: number;
  job_id: number;
  company_id: number;
  company_name: string;
  company_logo: string | null;
  job_title: string;
  place_of_assignment: string;
  status: string;
  applied_date: string;
}

export interface ApplicantWithJobs extends Application {
  appliedJobs?: AppliedJob[];
}
