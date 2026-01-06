// src/app/(user)/job-opportunities/[companyId]/types/application.types.ts

export interface ApplicationProgress {
  resume_viewed: boolean;
  exam_completed: boolean;
  verified_id_uploaded: boolean;
}

export interface ApplicationProgressResponse {
  job_id: number;
  applicant_id: number;
  resume_viewed: boolean;
  exam_completed: boolean;
  verified_id_uploaded: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamAttemptData {
  attempt: {
    attempt_id: number;
    exam_id: number;
    applicant_id: number;
    date_submitted: string;
    score: number;
  };
  answers: Array<{
    question_id: number;
    choice_id?: number;
    text_answer?: string;
    questions?: {
      question_text: string;
      choices?: Array<{ id: number; choice_text: string }>;
    };
    choices?: {
      choice_text: string;
    };
  }>;
  correctAnswers: Array<{
    question_id: number;
    choice_id?: number;
    correct_text?: string;
  }>;
}

export interface ToastState {
  show: boolean;
  title: string;
  message: string;
}
