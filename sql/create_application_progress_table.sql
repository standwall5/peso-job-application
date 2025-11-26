-- Create application_progress table to track user progress through job application steps
CREATE TABLE IF NOT EXISTS application_progress (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id NUMERIC NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  resume_viewed BOOLEAN DEFAULT FALSE,
  exam_completed BOOLEAN DEFAULT FALSE,
  verified_id_uploaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, applicant_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_progress_applicant ON application_progress(applicant_id);
CREATE INDEX IF NOT EXISTS idx_application_progress_job ON application_progress(job_id);

-- Add RLS policies if needed
ALTER TABLE application_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own progress
CREATE POLICY "Users can view own application progress"
  ON application_progress
  FOR SELECT
  USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own application progress"
  ON application_progress
  FOR INSERT
  WITH CHECK (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own application progress"
  ON application_progress
  FOR UPDATE
  USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own application progress"
  ON application_progress
  FOR DELETE
  USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_id = auth.uid()
    )
  );
