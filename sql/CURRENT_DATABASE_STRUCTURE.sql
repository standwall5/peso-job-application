-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_invitation_tokens (
  id bigint NOT NULL DEFAULT nextval('admin_invitation_tokens_id_seq'::regclass),
  email text NOT NULL UNIQUE,
  admin_name text NOT NULL,
  token text NOT NULL UNIQUE,
  is_superadmin boolean DEFAULT false,
  created_by bigint,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone,
  CONSTRAINT admin_invitation_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT admin_invitation_tokens_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.peso(id)
);
CREATE TABLE public.admin_ip_verification_tokens (
  id bigint NOT NULL DEFAULT nextval('admin_ip_verification_tokens_id_seq'::regclass),
  admin_id bigint NOT NULL,
  ip_address text NOT NULL,
  token text NOT NULL UNIQUE,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  CONSTRAINT admin_ip_verification_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT admin_ip_verification_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.admin_known_ips (
  id bigint NOT NULL DEFAULT nextval('admin_known_ips_id_seq'::regclass),
  admin_id bigint NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  location text,
  first_seen timestamp with time zone DEFAULT now(),
  last_seen timestamp with time zone DEFAULT now(),
  is_verified boolean DEFAULT true,
  CONSTRAINT admin_known_ips_pkey PRIMARY KEY (id),
  CONSTRAINT admin_known_ips_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.admin_login_attempts (
  id bigint NOT NULL DEFAULT nextval('admin_login_attempts_id_seq'::regclass),
  admin_id bigint,
  email text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  success boolean NOT NULL,
  failure_reason text,
  requires_ip_verification boolean DEFAULT false,
  attempted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_login_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT admin_login_attempts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.admin_presence (
  id integer NOT NULL DEFAULT nextval('admin_presence_id_seq'::regclass),
  admin_id integer NOT NULL UNIQUE,
  is_online boolean DEFAULT false,
  last_seen timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_presence_pkey PRIMARY KEY (id),
  CONSTRAINT admin_presence_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.applicant_ids (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  applicant_id bigint NOT NULL,
  id_type text NOT NULL CHECK (id_type = ANY (ARRAY['NATIONAL ID'::text, 'DRIVER''S LICENSE'::text, 'PASSPORT'::text, 'SSS ID'::text, 'UMID'::text, 'PhilHealth ID'::text, 'TIN ID'::text, 'POSTAL ID'::text, 'VOTER''S ID'::text, 'PRC ID'::text, 'PWD ID'::text, 'SENIOR CITIZEN ID'::text, 'BARANGAY ID'::text])),
  id_front_url text NOT NULL,
  id_back_url text NOT NULL,
  selfie_with_id_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  version integer DEFAULT 1,
  is_verified boolean DEFAULT false,
  verified_by integer,
  verified_at timestamp with time zone,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  rejection_reason text,
  rejected_by integer,
  rejected_at timestamp with time zone,
  is_preferred boolean DEFAULT false,
  CONSTRAINT applicant_ids_pkey PRIMARY KEY (id),
  CONSTRAINT applicant_ids_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT applicant_ids_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.peso(id),
  CONSTRAINT applicant_ids_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.peso(id)
);
CREATE TABLE public.applicants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  auth_id uuid,
  name text NOT NULL,
  phone text,
  resume_url text,
  created_at timestamp with time zone DEFAULT now(),
  age integer,
  sex text,
  applicant_type text,
  disability_type text,
  pwd_number text,
  preferred_poa text,
  district text,
  barangay text,
  profile_pic_url text,
  address text,
  birth_date date,
  residency text,
  id_verified boolean DEFAULT false,
  id_verified_at timestamp with time zone,
  id_verified_by bigint,
  is_archived boolean DEFAULT false,
  archived_at timestamp with time zone,
  last_login timestamp with time zone,
  deployed boolean DEFAULT false,
  deployed_at timestamp with time zone,
  deployed_by bigint,
  default_id_type text CHECK (default_id_type = ANY (ARRAY['NATIONAL ID'::text, 'DRIVER''S LICENSE'::text, 'PASSPORT'::text, 'SSS ID'::text, 'UMID'::text, 'PhilHealth ID'::text, 'TIN ID'::text, 'POSTAL ID'::text, 'VOTER''S ID'::text, 'PRC ID'::text, 'PWD ID'::text, 'SENIOR CITIZEN ID'::text, 'BARANGAY ID'::text])),
  CONSTRAINT applicants_pkey PRIMARY KEY (id),
  CONSTRAINT applicants_id_verified_by_fkey FOREIGN KEY (id_verified_by) REFERENCES public.peso(id),
  CONSTRAINT applicants_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id),
  CONSTRAINT applicants_deployed_by_fkey FOREIGN KEY (deployed_by) REFERENCES public.peso(id)
);
CREATE TABLE public.application_progress (
  id bigint NOT NULL DEFAULT nextval('application_progress_id_seq'::regclass),
  job_id bigint NOT NULL,
  applicant_id bigint NOT NULL,
  resume_viewed boolean DEFAULT false,
  exam_completed boolean DEFAULT false,
  verified_id_uploaded boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT application_progress_pkey PRIMARY KEY (id),
  CONSTRAINT application_progress_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT application_progress_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id)
);
CREATE TABLE public.applications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  job_id bigint,
  applicant_id bigint,
  status text DEFAULT 'Pending'::text,
  applied_date timestamp with time zone DEFAULT now(),
  exam_id bigint,
  exam_attempt_id integer,
  applicant_id_snapshot bigint,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT applications_exam_attempt_id_fkey FOREIGN KEY (exam_attempt_id) REFERENCES public.exam_attempts(attempt_id),
  CONSTRAINT applications_applicant_id_snapshot_fkey FOREIGN KEY (applicant_id_snapshot) REFERENCES public.applicant_ids(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chat_session_id uuid,
  sender character varying,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read_by_user boolean,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_chat_session_id_fkey FOREIGN KEY (chat_session_id) REFERENCES public.chat_sessions(id)
);
CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id bigint,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  admin_id bigint,
  concern text,
  updated_at timestamp with time zone DEFAULT now(),
  last_user_message_at timestamp with time zone,
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.applicants(id),
  CONSTRAINT chat_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.choices (
  id integer NOT NULL DEFAULT nextval('choices_choice_id_seq'::regclass),
  question_id integer NOT NULL,
  choice_text text NOT NULL,
  position integer DEFAULT 1,
  CONSTRAINT choices_pkey PRIMARY KEY (id),
  CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.companies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  location text,
  industry text,
  website text,
  logo text,
  contact_email text,
  description text,
  is_archived boolean DEFAULT false,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.correct_answers (
  correct_answer_id integer NOT NULL DEFAULT nextval('correct_answers_correct_answer_id_seq'::regclass),
  question_id integer NOT NULL,
  choice_id integer,
  correct_text text,
  CONSTRAINT correct_answers_pkey PRIMARY KEY (correct_answer_id),
  CONSTRAINT correct_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT correct_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(id)
);
CREATE TABLE public.email_change_tokens (
  id bigint NOT NULL DEFAULT nextval('email_change_tokens_id_seq'::regclass),
  user_id uuid NOT NULL,
  new_email text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  CONSTRAINT email_change_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT email_change_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.exam_answers (
  answer_id integer NOT NULL DEFAULT nextval('exam_answers_answer_id_seq'::regclass),
  attempt_id integer NOT NULL,
  question_id integer NOT NULL,
  choice_id integer,
  text_answer text,
  is_correct boolean,
  graded_by bigint,
  graded_at timestamp with time zone,
  CONSTRAINT exam_answers_pkey PRIMARY KEY (answer_id),
  CONSTRAINT exam_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.exam_attempts(attempt_id),
  CONSTRAINT exam_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT exam_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(id),
  CONSTRAINT exam_answers_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.peso(id)
);
CREATE TABLE public.exam_attempts (
  attempt_id integer NOT NULL DEFAULT nextval('exam_attempts_attempt_id_seq'::regclass),
  exam_id integer NOT NULL,
  applicant_id integer NOT NULL,
  date_submitted timestamp without time zone DEFAULT now(),
  score numeric,
  job_id bigint,
  CONSTRAINT exam_attempts_pkey PRIMARY KEY (attempt_id),
  CONSTRAINT exam_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_attempts_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT exam_attempts_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.exams (
  id integer NOT NULL DEFAULT nextval('exams_exam_id_seq'::regclass),
  title text NOT NULL,
  description text,
  date_created timestamp without time zone DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category character varying,
  question text NOT NULL,
  answer text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.id_change_logs (
  id integer NOT NULL DEFAULT nextval('id_change_logs_id_seq'::regclass),
  applicant_id integer NOT NULL,
  application_id integer,
  id_type text NOT NULL,
  change_type text NOT NULL CHECK (change_type = ANY (ARRAY['initial_upload'::text, 'update'::text, 'type_change'::text])),
  old_id_front_url text,
  old_id_back_url text,
  old_selfie_url text,
  new_id_front_url text NOT NULL,
  new_id_back_url text NOT NULL,
  new_selfie_url text NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  CONSTRAINT id_change_logs_pkey PRIMARY KEY (id),
  CONSTRAINT id_change_logs_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT id_change_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.id_verification_logs (
  id integer NOT NULL DEFAULT nextval('id_verification_logs_id_seq'::regclass),
  applicant_id integer NOT NULL,
  admin_id integer NOT NULL,
  application_id integer,
  action text NOT NULL CHECK (action = ANY (ARRAY['verified'::text, 'rejected'::text, 'updated'::text])),
  reason text,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT id_verification_logs_pkey PRIMARY KEY (id),
  CONSTRAINT id_verification_logs_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT id_verification_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id)
);
CREATE TABLE public.id_view_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  applicant_id bigint NOT NULL,
  admin_id bigint NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text,
  application_id bigint,
  CONSTRAINT id_view_logs_pkey PRIMARY KEY (id),
  CONSTRAINT id_view_logs_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT id_view_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.peso(id),
  CONSTRAINT id_view_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.jobs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  company_id bigint,
  title text NOT NULL,
  place_of_assignment text,
  sex text,
  education text,
  eligibility text,
  employment_type text,
  description text,
  requirements jsonb,
  salary text,
  posted_date date,
  deadline date,
  status text,
  manpower_needed integer,
  exam_id integer,
  skills ARRAY,
  icon_url text,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT jobs_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);
CREATE TABLE public.notifications (
  id bigint NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  applicant_id bigint NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['application_update'::text, 'new_job'::text, 'exam_result'::text, 'admin_message'::text, 'referred'::text, 'rejected'::text, 'id_verified'::text, 'application_completed'::text])),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  job_id bigint,
  job_title text,
  company_name text,
  company_logo text,
  is_archived boolean DEFAULT false,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT notifications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id)
);
CREATE TABLE public.otp_verifications (
  id bigint NOT NULL DEFAULT nextval('otp_verifications_id_seq'::regclass),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['email'::text, 'phone'::text])),
  value text NOT NULL,
  otp_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  CONSTRAINT otp_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT otp_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.peso (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  auth_id uuid,
  is_superadmin boolean DEFAULT false,
  name text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text, 'deactivated'::text])),
  last_login timestamp with time zone,
  account_locked boolean DEFAULT false,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamp with time zone,
  is_archived boolean DEFAULT false,
  archived_at timestamp with time zone,
  profile_picture_url text,
  is_first_login boolean DEFAULT true,
  CONSTRAINT peso_pkey PRIMARY KEY (id),
  CONSTRAINT peso_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.questions (
  id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
  exam_id integer NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type = ANY (ARRAY['mcq'::text, 'checkbox'::text, 'paragraph'::text])),
  position integer DEFAULT 1,
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);
CREATE TABLE public.resume (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  education jsonb,
  work_experiences jsonb,
  profile_introduction text,
  applicant_id bigint UNIQUE,
  skills jsonb,
  CONSTRAINT resume_pkey PRIMARY KEY (id),
  CONSTRAINT resume_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id)
);
CREATE TABLE public.verified_ids (
  id bigint NOT NULL DEFAULT nextval('verified_ids_id_seq'::regclass),
  applicant_id bigint NOT NULL,
  job_id integer NOT NULL,
  id_type text,
  id_front_url text NOT NULL,
  id_back_url text NOT NULL,
  selfie_with_id_url text NOT NULL,
  status text DEFAULT 'pending'::text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewer_id uuid,
  CONSTRAINT verified_ids_pkey PRIMARY KEY (id),
  CONSTRAINT verified_ids_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.applicants(id),
  CONSTRAINT verified_ids_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT verified_ids_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id)
);
