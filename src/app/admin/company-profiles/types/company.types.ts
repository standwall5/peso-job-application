// src/app/admin/company-profiles/types/company.types.ts

export interface Job {
  id: number;
  company_id: number;
  title: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  exam_id?: number | null;
  manpower_needed?: number;
}

export interface Company {
  id: number;
  name: string;
  location?: string;
  industry?: string;
  website?: string;
  logo: string | null;
  contact_email?: string;
  description?: string;
  totalManpower: number;
  jobs: Job[];
  totalJobsPosted: number;
}

export interface CompanyWithStats extends Company {
  totalJobsAllCompanies: number;
}

export interface ExamChoice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: ExamChoice[];
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: ExamQuestion[];
}
