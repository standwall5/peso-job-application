// src/app/(user)/job-opportunities/[companyId]/types/job.types.ts

export interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  company?: {
    name: string;
    logo: string | null;
  };
  companies?: {
    name: string;
    logo: string | null;
  };
  exam_id?: number | null;
}

export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
  is_correct?: boolean;
}

export interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: Choice[];
  correct_text?: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface ExamAnswer {
  question_id: number;
  choice_id?: number;
  text_answer?: string;
  questions?: {
    question_text: string;
    question_type?: string;
    position?: number;
    choices?: Array<{
      id: number;
      choice_text: string;
    }>;
  };
  choices?: {
    choice_text: string;
  };
}

export interface CorrectAnswer {
  question_id: number;
  choice_id?: number;
  correct_text?: string;
}

export interface Application {
  id: number;
  peso_id: string;
  job_id: number;
  applied_date: string;
  status: string;
  exam_score?: number;
  exam_answers?: ExamAnswer[];
}
