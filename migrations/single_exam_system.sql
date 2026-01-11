-- Migration: Single Exam System with General Questions
-- Description: Converts multiple exams to a single general pre-screening exam for all jobs
-- Date: 2024
-- IMPORTANT: This migration will backup existing exams and create a new general exam

-- Step 1: Create backup tables
CREATE TABLE IF NOT EXISTS exams_backup AS
SELECT * FROM exams;

CREATE TABLE IF NOT EXISTS questions_backup AS
SELECT * FROM questions;

CREATE TABLE IF NOT EXISTS choices_backup AS
SELECT * FROM choices;

CREATE TABLE IF NOT EXISTS correct_answers_backup AS
SELECT * FROM correct_answers;

-- Step 2: Create or get the general exam
DO $$
DECLARE
  general_exam_id INTEGER;
BEGIN
  -- Check if general exam already exists
  SELECT id INTO general_exam_id
  FROM exams
  WHERE title = 'General Pre-screening Questions'
  LIMIT 1;

  -- If doesn't exist, create it
  IF general_exam_id IS NULL THEN
    INSERT INTO exams (title, description, date_created)
    VALUES (
      'General Pre-screening Questions',
      'Standard evaluation questions for all job applications. These questions assess general work competencies and professional qualities.',
      NOW()
    )
    RETURNING id INTO general_exam_id;
  END IF;

  -- Delete old questions for this exam if any
  DELETE FROM correct_answers WHERE question_id IN (
    SELECT id FROM questions WHERE exam_id = general_exam_id
  );
  DELETE FROM choices WHERE question_id IN (
    SELECT id FROM questions WHERE exam_id = general_exam_id
  );
  DELETE FROM questions WHERE exam_id = general_exam_id;

  -- Insert 5 general questions

  -- Question 1: Time Management (Multiple Choice)
  INSERT INTO questions (exam_id, question_text, question_type, position)
  VALUES (
    general_exam_id,
    'How do you prioritize tasks when you have multiple deadlines approaching?',
    'mcq',
    1
  );

  -- Add choices for Question 1
  INSERT INTO choices (question_id, choice_text, position)
  SELECT
    q.id,
    c.choice_text,
    c.position
  FROM questions q
  CROSS JOIN (
    VALUES
      ('I create a detailed schedule and work systematically through each task', 1),
      ('I focus on the most urgent tasks first, then move to others', 2),
      ('I ask my supervisor for guidance on prioritization', 3),
      ('I work on the easiest tasks first to build momentum', 4)
  ) AS c(choice_text, position)
  WHERE q.exam_id = general_exam_id
    AND q.question_text = 'How do you prioritize tasks when you have multiple deadlines approaching?';

  -- Set correct answer for Question 1 (option 2 is best)
  INSERT INTO correct_answers (question_id, choice_id)
  SELECT q.id, ch.id
  FROM questions q
  JOIN choices ch ON ch.question_id = q.id
  WHERE q.exam_id = general_exam_id
    AND q.question_text = 'How do you prioritize tasks when you have multiple deadlines approaching?'
    AND ch.choice_text = 'I focus on the most urgent tasks first, then move to others';

  -- Question 2: Handling Pressure (Text Response)
  INSERT INTO questions (exam_id, question_text, question_type, position)
  VALUES (
    general_exam_id,
    'Describe a time when you had to work under pressure or meet a tight deadline. How did you handle the situation and what was the outcome?',
    'paragraph',
    2
  );

  -- Question 3: Work Ethic/Professionalism (Multiple Choice)
  INSERT INTO questions (exam_id, question_text, question_type, position)
  VALUES (
    general_exam_id,
    'What does professionalism mean to you in the workplace?',
    'mcq',
    3
  );

  -- Add choices for Question 3
  INSERT INTO choices (question_id, choice_text, position)
  SELECT
    q.id,
    c.choice_text,
    c.position
  FROM questions q
  CROSS JOIN (
    VALUES
      ('Being respectful and punctual at all times', 1),
      ('Following company rules and regulations strictly', 2),
      ('Maintaining high work quality, integrity, and ethical conduct', 3),
      ('Completing tasks on time regardless of quality', 4)
  ) AS c(choice_text, position)
  WHERE q.exam_id = general_exam_id
    AND q.question_text = 'What does professionalism mean to you in the workplace?';

  -- Set correct answer for Question 3 (option 3 is best)
  INSERT INTO correct_answers (question_id, choice_id)
  SELECT q.id, ch.id
  FROM questions q
  JOIN choices ch ON ch.question_id = q.id
  WHERE q.exam_id = general_exam_id
    AND q.question_text = 'What does professionalism mean to you in the workplace?'
    AND ch.choice_text = 'Maintaining high work quality, integrity, and ethical conduct';

  -- Question 4: Communication (Text Response)
  INSERT INTO questions (exam_id, question_text, question_type, position)
  VALUES (
    general_exam_id,
    'How do you ensure clear and effective communication with team members and supervisors, especially when dealing with complex information or problems?',
    'paragraph',
    4
  );

  -- Question 5: Problem Solving (Text Response)
  INSERT INTO questions (exam_id, question_text, question_type, position)
  VALUES (
    general_exam_id,
    'Describe your approach to solving unexpected problems or challenges at work. Provide a specific example if possible.',
    'paragraph',
    5
  );

  -- Step 3: Update all jobs to use the general exam
  UPDATE jobs
  SET exam_id = general_exam_id
  WHERE exam_id IS NOT NULL OR exam_id IS NULL;

  -- Step 4: Add constraint to ensure only one exam is used
  -- This prevents creating new exams in the future
  CREATE OR REPLACE FUNCTION prevent_multiple_exams()
  RETURNS TRIGGER AS $func$
  BEGIN
    IF (SELECT COUNT(*) FROM exams WHERE title != 'General Pre-screening Questions') > 0 THEN
      RAISE EXCEPTION 'Only the General Pre-screening Questions exam is allowed. Please edit the existing exam instead of creating a new one.';
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  -- Create trigger (drop if exists first)
  DROP TRIGGER IF EXISTS enforce_single_exam ON exams;
  CREATE TRIGGER enforce_single_exam
    BEFORE INSERT ON exams
    FOR EACH ROW
    WHEN (NEW.title != 'General Pre-screening Questions')
    EXECUTE FUNCTION prevent_multiple_exams();

  -- Log completion
  RAISE NOTICE 'General exam created with ID: %', general_exam_id;
  RAISE NOTICE 'All jobs updated to use general exam';
  RAISE NOTICE 'Backup tables created: exams_backup, questions_backup, choices_backup, correct_answers_backup';

END $$;

-- Step 5: Create view for easy exam access
CREATE OR REPLACE VIEW general_exam_view AS
SELECT
  e.id as exam_id,
  e.title,
  e.description,
  q.id as question_id,
  q.question_text,
  q.question_type,
  q.position,
  json_agg(
    json_build_object(
      'id', c.id,
      'choice_text', c.choice_text,
      'position', c.position,
      'is_correct', EXISTS(
        SELECT 1 FROM correct_answers ca
        WHERE ca.choice_id = c.id
      )
    ) ORDER BY c.position
  ) FILTER (WHERE c.id IS NOT NULL) as choices
FROM exams e
LEFT JOIN questions q ON q.exam_id = e.id
LEFT JOIN choices c ON c.question_id = q.id
WHERE e.title = 'General Pre-screening Questions'
GROUP BY e.id, e.title, e.description, q.id, q.question_text, q.question_type, q.position
ORDER BY q.position;

-- Step 6: Add helpful comments
COMMENT ON TABLE exams_backup IS 'Backup of exams table before single exam migration';
COMMENT ON TABLE questions_backup IS 'Backup of questions table before single exam migration';
COMMENT ON TABLE choices_backup IS 'Backup of choices table before single exam migration';
COMMENT ON VIEW general_exam_view IS 'Simplified view of the general pre-screening exam with all questions and choices';

-- Step 7: Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT ON general_exam_view TO authenticated;

-- Migration complete
-- To verify, run: SELECT * FROM general_exam_view;
-- To rollback: See ROLLBACK_single_exam_system.sql (create separately if needed)
