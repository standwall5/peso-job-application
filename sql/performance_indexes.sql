-- =====================================================================
-- PERFORMANCE INDEXES FOR PESO JOB APPLICATION DATABASE
-- =====================================================================
-- This file contains index creation commands to optimize query performance
-- Run these in your Supabase SQL Editor to improve loading times

-- =====================================================================
-- APPLICATIONS TABLE INDEXES
-- =====================================================================

-- Index for fetching applications by applicant (user profile queries)
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id 
ON applications(applicant_id);

-- Index for fetching applications by job (job details page)
CREATE INDEX IF NOT EXISTS idx_applications_job_id 
ON applications(job_id);

-- Index for filtering by status (admin dashboard, reports)
CREATE INDEX IF NOT EXISTS idx_applications_status 
ON applications(status);

-- Composite index for applicant's applications ordered by date
CREATE INDEX IF NOT EXISTS idx_applications_applicant_date 
ON applications(applicant_id, applied_date DESC);

-- Composite index for job applications with status filtering
CREATE INDEX IF NOT EXISTS idx_applications_job_status 
ON applications(job_id, status);

-- =====================================================================
-- JOBS TABLE INDEXES
-- =====================================================================

-- Index for fetching jobs by company
CREATE INDEX IF NOT EXISTS idx_jobs_company_id 
ON jobs(company_id);

-- Index for filtering active/inactive jobs
CREATE INDEX IF NOT EXISTS idx_jobs_is_active 
ON jobs(is_active);

-- Index for exam assignment lookups
CREATE INDEX IF NOT EXISTS idx_jobs_exam_id 
ON jobs(exam_id) WHERE exam_id IS NOT NULL;

-- Composite index for active jobs by company
CREATE INDEX IF NOT EXISTS idx_jobs_company_active 
ON jobs(company_id, is_active) WHERE is_active = true;

-- Index for job posting date filtering
CREATE INDEX IF NOT EXISTS idx_jobs_date_posted 
ON jobs(date_posted DESC);

-- =====================================================================
-- EXAM-RELATED INDEXES
-- =====================================================================

-- Index for fetching exam attempts by applicant
CREATE INDEX IF NOT EXISTS idx_exam_attempts_applicant 
ON exam_attempts(applicant_id);

-- Index for fetching exam attempts by exam
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam 
ON exam_attempts(exam_id);

-- Composite index for finding specific exam attempt (used in admin view)
CREATE INDEX IF NOT EXISTS idx_exam_attempts_applicant_exam_job 
ON exam_attempts(applicant_id, exam_id, job_id);

-- Index for exam answers by attempt
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt 
ON exam_answers(attempt_id);

-- Index for exam answers by question (for grading)
CREATE INDEX IF NOT EXISTS idx_exam_answers_question 
ON exam_answers(question_id);

-- Index for questions by exam
CREATE INDEX IF NOT EXISTS idx_questions_exam 
ON questions(exam_id);

-- Index for choices by question
CREATE INDEX IF NOT EXISTS idx_choices_question 
ON choices(question_id);

-- Index for correct answers
CREATE INDEX IF NOT EXISTS idx_correct_answers_question 
ON correct_answers(question_id);

-- =====================================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================================

-- Index for fetching user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_applicant 
ON notifications(applicant_id);

-- Index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_applicant_unread 
ON notifications(applicant_id, is_read) WHERE is_read = false;

-- Index for notifications by type
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(type);

-- Composite index for recent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_applicant_created 
ON notifications(applicant_id, created_at DESC);

-- =====================================================================
-- APPLICANT/RESUME INDEXES
-- =====================================================================

-- Index for applicant auth lookups
CREATE INDEX IF NOT EXISTS idx_applicants_auth_id 
ON applicants(auth_id);

-- Index for resume by applicant
CREATE INDEX IF NOT EXISTS idx_resume_applicant 
ON resume(applicant_id);

-- Index for applicant IDs
CREATE INDEX IF NOT EXISTS idx_applicant_ids_applicant 
ON applicant_ids(applicant_id);

-- =====================================================================
-- CHAT SYSTEM INDEXES
-- =====================================================================

-- Index for chat sessions by applicant
CREATE INDEX IF NOT EXISTS idx_chat_sessions_applicant 
ON chat_sessions(applicant_id);

-- Index for chat sessions by admin
CREATE INDEX IF NOT EXISTS idx_chat_sessions_admin 
ON chat_sessions(admin_id) WHERE admin_id IS NOT NULL;

-- Index for active chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status 
ON chat_sessions(status);

-- Index for chat messages by session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
ON chat_messages(chat_session_id);

-- Composite index for recent messages in session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created 
ON chat_messages(chat_session_id, created_at ASC);

-- =====================================================================
-- ADMIN SYSTEM INDEXES
-- =====================================================================

-- Index for admin auth lookups
CREATE INDEX IF NOT EXISTS idx_peso_auth_id 
ON peso(auth_id);

-- Index for admin email lookups
CREATE INDEX IF NOT EXISTS idx_peso_email 
ON peso(email);

-- Index for admin login attempts
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_admin 
ON admin_login_attempts(admin_id);

-- Index for known IPs
CREATE INDEX IF NOT EXISTS idx_admin_known_ips_admin 
ON admin_known_ips(admin_id);

-- =====================================================================
-- COMPANIES TABLE INDEXES
-- =====================================================================

-- Index for company name searches
CREATE INDEX IF NOT EXISTS idx_companies_name 
ON companies(name);

-- =====================================================================
-- ID VERIFICATION INDEXES
-- =====================================================================

-- Index for verified IDs by applicant
CREATE INDEX IF NOT EXISTS idx_verified_ids_applicant 
ON verified_ids(applicant_id);

-- Index for ID view logs by application
CREATE INDEX IF NOT EXISTS idx_id_view_logs_application 
ON id_view_logs(application_id);

-- Index for ID view logs by admin
CREATE INDEX IF NOT EXISTS idx_id_view_logs_admin 
ON id_view_logs(admin_id);

-- =====================================================================
-- ANALYTICS & REPORTING INDEXES
-- =====================================================================

-- Index for application progress tracking
CREATE INDEX IF NOT EXISTS idx_application_progress_applicant 
ON application_progress(applicant_id);

-- Composite index for date-based analytics (used in reports)
CREATE INDEX IF NOT EXISTS idx_applications_date_status 
ON applications(applied_date DESC, status);

-- Index for company performance analytics
CREATE INDEX IF NOT EXISTS idx_applications_company_date 
ON applications(job_id, applied_date DESC);

-- =====================================================================
-- PARTIAL INDEXES FOR SPECIFIC QUERIES
-- =====================================================================

-- Index for pending applications only (heavily filtered in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_applications_pending 
ON applications(applicant_id, applied_date DESC) 
WHERE status = 'Pending';

-- Index for active jobs with exams (application flow)
CREATE INDEX IF NOT EXISTS idx_jobs_active_with_exam 
ON jobs(company_id, exam_id) 
WHERE is_active = true AND exam_id IS NOT NULL;

-- =====================================================================
-- TEXT SEARCH INDEXES (GIN)
-- =====================================================================

-- Full-text search on job titles (for search functionality)
CREATE INDEX IF NOT EXISTS idx_jobs_title_search 
ON jobs USING gin(to_tsvector('english', title));

-- Full-text search on company names
CREATE INDEX IF NOT EXISTS idx_companies_name_search 
ON companies USING gin(to_tsvector('english', name));

-- Full-text search on applicant names
CREATE INDEX IF NOT EXISTS idx_applicants_name_search 
ON applicants USING gin(to_tsvector('english', name));

-- =====================================================================
-- EXECUTION NOTES
-- =====================================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. The IF NOT EXISTS clause prevents errors if indexes already exist
-- 3. Creating indexes may take a few minutes on large datasets
-- 4. Monitor index usage with: 
--    SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
-- 5. Check index sizes with:
--    SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
--    FROM pg_stat_user_indexes WHERE schemaname = 'public';
-- =====================================================================
