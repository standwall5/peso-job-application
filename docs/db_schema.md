# PESO Job Application Database Schema

This document provides a complete reference of all database tables, columns, relationships, and policies in the PESO Job Application system.

---

## Table of Contents
1. [Authentication & Users](#authentication--users)
2. [Jobs & Companies](#jobs--companies)
3. [Applications & Progress](#applications--progress)
4. [Exams & Assessments](#exams--assessments)
5. [Chat System](#chat-system)
6. [FAQs](#faqs)
7. [Entity Relationship Diagram](#entity-relationship-diagram)
8. [RLS Policies](#rls-policies)

---

## Authentication & Users

### `applicants`
Stores information about job seekers registered in the system.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | Primary key | PRIMARY KEY |
| `auth_id` | UUID | Reference to Supabase auth.users | REFERENCES auth.users(id) |
| `name` | TEXT | Full name of applicant | NOT NULL |
| `email` | TEXT | Email address | |
| `phone` | TEXT | Contact phone number | |
| `birth_date` | DATE | Date of birth | |
| `age` | INTEGER | Calculated age | |
| `sex` | TEXT | Gender (Male/Female/Other) | |
| `applicant_type` | TEXT | Type of applicant (Regular/PWD/Senior/Student) | |
| `disability_type` | TEXT | Type of disability (if PWD) | |
| `pwd_number` | TEXT | PWD ID number | |
| `preferred_poa` | TEXT | Preferred place of assignment | |
| `address` | TEXT | Street address | |
| `province` | TEXT | Province | |
| `district` | TEXT | District | |
| `city_municipality` | TEXT | City or municipality | |
| `barangay` | TEXT | Barangay | |
| `created_at` | TIMESTAMP | Account creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |

**Indexes:**
- `idx_applicants_auth_id` ON `auth_id`

---

### `peso`
Stores PESO admin user information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `auth_id` | UUID | Reference to Supabase auth.users | REFERENCES auth.users(id), UNIQUE |
| `name` | TEXT | Admin name | NOT NULL |
| `email` | TEXT | Admin email | NOT NULL |
| `created_at` | TIMESTAMP | Account creation timestamp | DEFAULT NOW() |

**Indexes:**
- `idx_peso_auth_id` ON `auth_id`

---

## Jobs & Companies

### `companies`
Stores company/employer information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `name` | TEXT | Company name | NOT NULL |
| `address` | TEXT | Company address | |
| `contact_person` | TEXT | Contact person name | |
| `contact_number` | TEXT | Contact phone number | |
| `email` | TEXT | Company email | |
| `industry` | TEXT | Industry type | |
| `created_at` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |

---

### `jobs`
Stores job posting information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | Primary key | PRIMARY KEY |
| `company_id` | BIGINT | Reference to company | REFERENCES companies(id) ON DELETE CASCADE |
| `title` | TEXT | Job title | NOT NULL |
| `description` | TEXT | Job description | |
| `place_of_assignment` | TEXT | Work location | |
| `sex` | TEXT | Gender requirement | |
| `education` | TEXT | Educational requirement | |
| `eligibility` | TEXT | Required eligibility/license | |
| `manpower_needed` | INTEGER | Number of positions | DEFAULT 1 |
| `posted_date` | DATE | Date job was posted | DEFAULT CURRENT_DATE |
| `salary_range` | TEXT | Salary range (if applicable) | |
| `job_type` | TEXT | Full-time/Part-time/Contract | |
| `created_at` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |

**Indexes:**
- `idx_jobs_company_id` ON `company_id`
- `idx_jobs_posted_date` ON `posted_date`

---

## Applications & Progress

### `applications`
Tracks job applications submitted by applicants.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | Primary key | PRIMARY KEY |
| `job_id` | BIGINT | Reference to job | REFERENCES jobs(id) ON DELETE CASCADE, NOT NULL |
| `applicant_id` | NUMERIC | Reference to applicant | REFERENCES applicants(id) ON DELETE CASCADE, NOT NULL |
| `exam_attempt_id` | INTEGER | Reference to exam attempt | REFERENCES exam_attempts(attempt_id) |
| `status` | VARCHAR(50) | Application status | DEFAULT 'pending' |
| `resume_url` | TEXT | URL to uploaded resume | |
| `cover_letter` | TEXT | Cover letter text | |
| `applied_date` | TIMESTAMP | Application submission date | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last status update | DEFAULT NOW() |

**Status Values:**
- `pending` - Application submitted, awaiting review
- `under_review` - Being evaluated by employer
- `accepted` - Application accepted
- `rejected` - Application rejected
- `withdrawn` - Withdrawn by applicant

**Unique Constraint:**
- UNIQUE(`job_id`, `applicant_id`) - One application per job per applicant

**Indexes:**
- `idx_applications_applicant_id` ON `applicant_id`
- `idx_applications_job_id` ON `job_id`

---

### `application_progress`
Tracks step-by-step progress through the application process.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | Primary key | PRIMARY KEY |
| `job_id` | BIGINT | Reference to job | REFERENCES jobs(id) ON DELETE CASCADE, NOT NULL |
| `applicant_id` | NUMERIC | Reference to applicant | REFERENCES applicants(id) ON DELETE CASCADE, NOT NULL |
| `resume_viewed` | BOOLEAN | Has resume been viewed | DEFAULT FALSE |
| `exam_completed` | BOOLEAN | Has exam been completed | DEFAULT FALSE |
| `verified_id_uploaded` | BOOLEAN | Has ID been uploaded | DEFAULT FALSE |
| `created_at` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |

**Unique Constraint:**
- UNIQUE(`job_id`, `applicant_id`)

**Indexes:**
- `idx_application_progress_applicant` ON `applicant_id`
- `idx_application_progress_job` ON `job_id`

---

## Exams & Assessments

### `exams`
Stores exam/assessment definitions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `title` | TEXT | Exam title | NOT NULL |
| `description` | TEXT | Exam description | |
| `date_created` | TIMESTAMP | Creation timestamp | DEFAULT NOW() |
| `passing_score` | INTEGER | Minimum score to pass | DEFAULT 0 |
| `time_limit` | INTEGER | Time limit in minutes | |

---

### `questions`
Stores individual exam questions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `exam_id` | INTEGER | Reference to exam | REFERENCES exams(id) ON DELETE CASCADE, NOT NULL |
| `question_text` | TEXT | Question content | NOT NULL |
| `question_type` | VARCHAR(20) | Type of question | NOT NULL |
| `position` | INTEGER | Order in exam | DEFAULT 0 |
| `points` | INTEGER | Points for this question | DEFAULT 1 |

**Question Types:**
- `mcq` - Multiple choice (single answer)
- `checkbox` - Multiple choice (multiple answers)
- `paragraph` - Text/essay answer

**Indexes:**
- `idx_questions_exam_id` ON `exam_id`

---

### `choices`
Stores answer choices for multiple choice questions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `question_id` | INTEGER | Reference to question | REFERENCES questions(id) ON DELETE CASCADE, NOT NULL |
| `choice_text` | TEXT | Choice content | NOT NULL |
| `position` | INTEGER | Order of choice | DEFAULT 0 |

**Indexes:**
- `idx_choices_question_id` ON `question_id`

---

### `correct_answers`
Stores correct answers for exam questions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `question_id` | INTEGER | Reference to question | REFERENCES questions(id) ON DELETE CASCADE, NOT NULL |
| `choice_id` | INTEGER | Reference to correct choice | REFERENCES choices(id) ON DELETE CASCADE |
| `correct_text` | TEXT | Correct answer for paragraph questions | |

**Note:** For MCQ/checkbox questions, use `choice_id`. For paragraph questions, use `correct_text`.

**Indexes:**
- `idx_correct_answers_question_id` ON `question_id`

---

### `exam_attempts`
Tracks exam attempts by applicants.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `attempt_id` | SERIAL | Primary key | PRIMARY KEY |
| `exam_id` | INTEGER | Reference to exam | REFERENCES exams(id) ON DELETE CASCADE, NOT NULL |
| `applicant_id` | NUMERIC | Reference to applicant | REFERENCES applicants(id) ON DELETE CASCADE, NOT NULL |
| `job_id` | BIGINT | Reference to job | REFERENCES jobs(id) ON DELETE CASCADE |
| `date_submitted` | TIMESTAMP | Submission timestamp | DEFAULT NOW() |
| `score` | NUMERIC(5,2) | Exam score (percentage or points) | DEFAULT 0 |
| `passed` | BOOLEAN | Whether exam was passed | DEFAULT FALSE |

**Indexes:**
- `idx_exam_attempts_applicant_id` ON `applicant_id`
- `idx_exam_attempts_exam_id` ON `exam_id`
- `idx_exam_attempts_job_id` ON `job_id`

---

### `exam_answers`
Stores individual answers submitted by applicants.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `attempt_id` | INTEGER | Reference to exam attempt | REFERENCES exam_attempts(attempt_id) ON DELETE CASCADE, NOT NULL |
| `question_id` | INTEGER | Reference to question | REFERENCES questions(id) ON DELETE CASCADE, NOT NULL |
| `choice_id` | INTEGER | Selected choice (for MCQ/checkbox) | REFERENCES choices(id) ON DELETE SET NULL |
| `text_answer` | TEXT | Text answer (for paragraph questions) | |

**Note:** For checkbox questions, multiple rows exist per question.

**Indexes:**
- `idx_exam_answers_attempt_id` ON `attempt_id`
- `idx_exam_answers_question_id` ON `question_id`

---

## Chat System

### `chat_sessions`
Stores chat sessions between applicants and admins.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| `user_id` | BIGINT | Reference to applicant | REFERENCES applicants(id) ON DELETE CASCADE, NOT NULL |
| `admin_id` | INTEGER | Reference to admin handling chat | REFERENCES peso(id) ON DELETE SET NULL |
| `status` | VARCHAR(20) | Chat session status | DEFAULT 'pending' |
| `concern` | TEXT | Initial user concern/question | |
| `created_at` | TIMESTAMP | Session creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |
| `closed_at` | TIMESTAMP | Session close timestamp | |

**Status Values:**
- `pending` - Waiting for admin to accept
- `active` - Chat is ongoing
- `closed` - Chat has been closed

**Indexes:**
- `idx_chat_sessions_user_id` ON `user_id`
- `idx_chat_sessions_admin_id` ON `admin_id`
- `idx_chat_sessions_status` ON `status`
- `idx_chat_sessions_concern` USING gin(to_tsvector('english', concern)) - Full-text search

**Realtime Enabled:** ✅ YES (for live updates)

---

### `chat_messages`
Stores individual messages in chat sessions.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Primary key | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| `chat_session_id` | UUID | Reference to chat session | REFERENCES chat_sessions(id) ON DELETE CASCADE, NOT NULL |
| `sender` | VARCHAR(10) | Who sent the message | NOT NULL |
| `message` | TEXT | Message content | NOT NULL |
| `created_at` | TIMESTAMP | Message timestamp | DEFAULT NOW() |

**Sender Values:**
- `user` - Message from applicant
- `admin` - Message from PESO admin

**Indexes:**
- `idx_chat_messages_session_id` ON `chat_session_id`
- `idx_chat_messages_created_at` ON `created_at`

**Realtime Enabled:** ✅ YES (for instant messaging)

---

### `chat_sessions_with_applicant` (VIEW)
Materialized view combining chat sessions with applicant details.

**Columns:**
- All columns from `chat_sessions`
- `applicant_id`, `applicant_name`, `auth_id` from `applicants`
- `applicant_email` from `auth.users`

**Purpose:** Allows admins to fetch chat sessions with user email without service role access.

---

### `get_chat_sessions_for_admin(session_status)` (FUNCTION)
Security definer function to fetch chat sessions with applicant details.

**Parameters:**
- `session_status` TEXT - Filter by status (default: 'pending')

**Returns:** Table with session and applicant details

**Security:** Only callable by admins (verified via `peso` table)

---

## FAQs

### `faqs`
Stores frequently asked questions for the chatbot.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Primary key | PRIMARY KEY |
| `question` | TEXT | FAQ question | NOT NULL |
| `answer` | TEXT | FAQ answer | NOT NULL |
| `category` | VARCHAR(50) | Category (jobs/application/account/etc) | |
| `created_at` | TIMESTAMP | Record creation timestamp | DEFAULT NOW() |
| `order` | INTEGER | Display order | DEFAULT 0 |

**Indexes:**
- `idx_faqs_category` ON `category`

---

## Entity Relationship Diagram
