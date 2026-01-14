// Exam service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";
import { createAdminClient } from "@/utils/supabase/server";

export interface Choice {
  id?: number;
  choice_text: string;
  is_correct?: boolean;
  position: number;
}

export interface Question {
  id?: number;
  question_text: string;
  question_type: "multiple-choice" | "checkboxes" | "paragraph";
  position: number;
  choices?: Choice[];
  correct_text?: string;
}

export interface Exam {
  id?: number;
  title: string;
  description: string;
  date_created?: string;
  questions: Question[];
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  applicant_id: number;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string;
}

export interface ExamSubmission {
  examId: number;
  jobId: number;
  answers: Record<number, number | number[] | string>;
}

export interface ExamSubmissionResult {
  success: boolean;
  attemptId: number;
  score: number | null;
  correctCount: number;
  autoGradedCount: number;
  paragraphCount: number;
  totalQuestions: number;
}

interface CorrectAnswer {
  question_id: number;
  choice_id: number | null;
  correct_text: string | null;
}

interface InsertedAnswer {
  answer_id: number;
  question_id: number;
  choice_id: number | null;
  text_answer: string | null;
}

interface QuestionType {
  id: number;
  question_type: string;
}

interface CorrectAnswerChoice {
  question_id: number;
  choice_id: number;
}

function mapQuestionTypeToDb(type: string): string {
  if (type === "multiple-choice") return "mcq";
  if (type === "checkboxes") return "checkbox";
  return "paragraph";
}

function mapQuestionTypeFromDb(type: string): string {
  if (type === "mcq") return "multiple-choice";
  if (type === "checkbox") return "checkboxes";
  return type;
}

export async function getExams(): Promise<Exam[]> {
  const supabase = await getSupabaseClient();

  // Fetch exams
  const { data: exams, error: examsError } = await supabase
    .from("exams")
    .select("*")
    .order("date_created", { ascending: false });

  if (examsError) {
    throw new Error("Failed to load exams");
  }

  // Fetch questions for all exams
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*");

  if (questionsError) {
    throw new Error("Failed to load questions");
  }

  // Fetch choices for all questions
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("*");

  if (choicesError) {
    throw new Error("Failed to load choices");
  }

  // Fetch correct answers
  const { data: correctAnswers, error: correctAnswersError } = await supabase
    .from("correct_answers")
    .select("*");

  if (correctAnswersError) {
    throw new Error("Failed to load correct answers");
  }

  // Nest choices inside questions and mark correct ones
  const questionsWithChoices = questions.map((q) => {
    const questionChoices = choices.filter((c) => c.question_id === q.id);
    const questionCorrectAnswers =
      correctAnswers?.filter((ca) => ca.question_id === q.id) || [];

    const choicesWithCorrectFlag = questionChoices.map((choice) => ({
      ...choice,
      is_correct: questionCorrectAnswers.some(
        (ca) => ca.choice_id === choice.id
      ),
    }));

    const correctTextAnswer = questionCorrectAnswers.find(
      (ca) => ca.correct_text
    );

    return {
      ...q,
      question_type: mapQuestionTypeFromDb(q.question_type),
      choices: choicesWithCorrectFlag,
      correct_text: correctTextAnswer?.correct_text || undefined,
    };
  });

  // Nest questions inside exams
  const examsWithQuestions = exams.map((exam) => ({
    ...exam,
    questions: questionsWithChoices.filter((q) => q.exam_id === exam.id),
  }));

  return examsWithQuestions as Exam[];
}

export async function getExamById(id: number): Promise<Exam> {
  const supabase = await getSupabaseClient();

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*")
    .eq("id", id)
    .single();

  if (examError) {
    throw new Error("Exam not found");
  }

  // Fetch questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", id);

  if (questionsError) {
    throw new Error("Failed to load questions");
  }

  const questionIds = questions.map((q) => q.id);

  // Fetch choices
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("*")
    .in("question_id", questionIds);

  if (choicesError) {
    throw new Error("Failed to load choices");
  }

  // Fetch correct answers
  const { data: correctAnswers, error: correctAnswersError } = await supabase
    .from("correct_answers")
    .select("*")
    .in("question_id", questionIds);

  if (correctAnswersError) {
    throw new Error("Failed to load correct answers");
  }

  const questionsWithChoices = questions.map((q) => {
    const questionChoices = choices.filter((c) => c.question_id === q.id);
    const questionCorrectAnswers =
      correctAnswers?.filter((ca) => ca.question_id === q.id) || [];

    const choicesWithCorrectFlag = questionChoices.map((choice) => ({
      ...choice,
      is_correct: questionCorrectAnswers.some(
        (ca) => ca.choice_id === choice.id
      ),
    }));

    const correctTextAnswer = questionCorrectAnswers.find(
      (ca) => ca.correct_text
    );

    return {
      ...q,
      question_type: mapQuestionTypeFromDb(q.question_type),
      choices: choicesWithCorrectFlag,
      correct_text: correctTextAnswer?.correct_text || undefined,
    };
  });

  return {
    ...exam,
    questions: questionsWithChoices,
  } as Exam;
}

export async function createExam(examData: Exam): Promise<Exam> {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      title: examData.title,
      description: examData.description,
    })
    .select()
    .single();

  if (examError) {
    throw new Error("Failed to create exam");
  }

  // Insert questions, choices, and correct answers
  await insertQuestionsAndChoices(exam.id, examData.questions);

  return getExamById(exam.id);
}

export async function updateExam(id: number, examData: Exam): Promise<Exam> {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  // Update exam info
  const { error: examError } = await supabase
    .from("exams")
    .update({ title: examData.title, description: examData.description })
    .eq("id", id);

  if (examError) {
    throw new Error("Failed to update exam");
  }

  // Delete old questions, choices, and correct answers
  await deleteExamQuestions(id);

  // Insert new questions
  await insertQuestionsAndChoices(id, examData.questions);

  return getExamById(id);
}

async function deleteExamQuestions(examId: number) {
  const supabase = await getSupabaseClient();

  // Get question IDs
  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .eq("exam_id", examId);

  const questionIds = questions?.map((q) => q.id) || [];

  if (questionIds.length > 0) {
    // Delete correct answers
    await supabase
      .from("correct_answers")
      .delete()
      .in("question_id", questionIds);
    // Delete choices
    await supabase.from("choices").delete().in("question_id", questionIds);
  }

  // Delete questions
  await supabase.from("questions").delete().eq("exam_id", examId);
}

async function insertQuestionsAndChoices(
  examId: number,
  questions: Question[]
) {
  const supabase = await getSupabaseClient();

  const questionsToInsert = questions.map((q) => ({
    exam_id: examId,
    question_text: q.question_text,
    question_type: mapQuestionTypeToDb(q.question_type),
    position: q.position,
  }));

  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select("id, position");

  if (questionsError || !insertedQuestions) {
    throw new Error("Failed to create questions");
  }

  const positionToQuestionId: Record<number, number> = {};
  insertedQuestions.forEach((q) => {
    positionToQuestionId[q.position] = q.id;
  });

  // Insert choices
  const choicesToInsert: {
    question_id: number;
    choice_text: string;
    position: number;
  }[] = [];

  questions.forEach((q) => {
    if (q.choices && q.choices.length > 0) {
      q.choices.forEach((c, index) => {
        choicesToInsert.push({
          question_id: positionToQuestionId[q.position],
          choice_text: c.choice_text,
          position: c.position ?? index,
        });
      });
    }
  });

  let insertedChoices: {
    id: number;
    question_id: number;
    position: number;
  }[] = [];

  if (choicesToInsert.length > 0) {
    const { data, error: choicesError } = await supabase
      .from("choices")
      .insert(choicesToInsert)
      .select("id, question_id, position");

    if (choicesError || !data) {
      throw new Error("Failed to create choices");
    }
    insertedChoices = data;
  }

  // Insert correct answers
  const correctAnswersToInsert: {
    question_id: number;
    choice_id?: number;
    correct_text?: string;
  }[] = [];

  questions.forEach((q) => {
    const questionId = positionToQuestionId[q.position];

    if (q.question_type === "paragraph" && q.correct_text) {
      correctAnswersToInsert.push({
        question_id: questionId,
        correct_text: q.correct_text,
      });
    } else if (q.choices && q.choices.length > 0) {
      q.choices.forEach((c, choicePosition) => {
        if (c.is_correct) {
          const insertedChoice = insertedChoices.find(
            (ic) =>
              ic.question_id === questionId &&
              ic.position === (c.position ?? choicePosition)
          );
          if (insertedChoice) {
            correctAnswersToInsert.push({
              question_id: questionId,
              choice_id: insertedChoice.id,
            });
          }
        }
      });
    }
  });

  if (correctAnswersToInsert.length > 0) {
    await supabase.from("correct_answers").insert(correctAnswersToInsert);
  }
}

export async function submitExam(
  submission: ExamSubmission
): Promise<ExamSubmissionResult> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get applicant_id from applicants table
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    throw new Error("Applicant not found");
  }

  const applicant_id = applicantData.id;
  const { examId, jobId, answers } = submission;

  // Validate required fields
  if (!examId || !jobId || !answers) {
    throw new Error("Missing required fields: examId, jobId, or answers");
  }

  // Create exam attempt
  const { data: attemptData, error: attemptError } = await supabase
    .from("exam_attempts")
    .insert([
      {
        exam_id: examId,
        applicant_id: applicant_id,
        job_id: jobId,
        date_submitted: new Date().toISOString(),
        score: null, // Will be calculated later
      },
    ])
    .select("attempt_id")
    .single();

  if (attemptError || !attemptData) {
    throw new Error("Failed to create exam attempt");
  }

  const attemptId = attemptData.attempt_id;

  // Prepare exam answers for insertion
  const examAnswersToInsert: {
    attempt_id: number;
    question_id: number;
    choice_id?: number;
    text_answer?: string;
  }[] = [];

  // Process each answer
  Object.entries(answers).forEach(([questionIdStr, answer]) => {
    const questionId = parseInt(questionIdStr);

    if (Array.isArray(answer)) {
      // Checkbox question - insert multiple rows
      answer.forEach((choiceId) => {
        examAnswersToInsert.push({
          attempt_id: attemptId,
          question_id: questionId,
          choice_id: choiceId,
        });
      });
    } else if (typeof answer === "number") {
      // Multiple choice question
      examAnswersToInsert.push({
        attempt_id: attemptId,
        question_id: questionId,
        choice_id: answer,
      });
    } else if (typeof answer === "string") {
      // Paragraph question
      examAnswersToInsert.push({
        attempt_id: attemptId,
        question_id: questionId,
        text_answer: answer,
      });
    }
  });

  // Insert all exam answers
  if (examAnswersToInsert.length > 0) {
    const { data: insertedAnswers, error: answersError } = await supabase
      .from("exam_answers")
      .insert(examAnswersToInsert)
      .select("answer_id, question_id, choice_id, text_answer");

    if (answersError) {
      throw new Error("Failed to save exam answers");
    }

    // Auto-grade MCQ and checkbox questions immediately
    if (insertedAnswers) {
      await autoGradeAnswers(supabase, insertedAnswers, answers);
    }
  }

  // Fetch question types to determine which are paragraph questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_type")
    .in(
      "id",
      Object.keys(answers).map((id) => parseInt(id))
    );

  if (questionsError) {
    throw new Error("Failed to fetch questions");
  }

  // Create a map of question types
  const questionTypes: Record<number, string> = {};
  questions?.forEach((q) => {
    questionTypes[q.id] = q.question_type;
  });

  // Calculate score by comparing with correct answers
  // Only fetch correct answers for MCQ and checkbox questions (not paragraph)
  const nonParagraphQuestionIds = Object.keys(answers)
    .map((id) => parseInt(id))
    .filter((qId) => questionTypes[qId] !== "paragraph");

  let correctAnswers: CorrectAnswer[] = [];
  if (nonParagraphQuestionIds.length > 0) {
    const { data, error: correctAnswersError } = await supabase
      .from("correct_answers")
      .select("question_id, choice_id, correct_text")
      .in("question_id", nonParagraphQuestionIds);

    if (correctAnswersError) {
      throw new Error("Failed to fetch correct answers");
    }
    correctAnswers = data || [];
  }

  // Group correct answers by question_id
  const correctAnswersByQuestion: Record<
    number,
    {
      choiceIds: number[];
      correctText: string | null;
    }
  > = {};

  correctAnswers?.forEach((ca) => {
    if (!correctAnswersByQuestion[ca.question_id]) {
      correctAnswersByQuestion[ca.question_id] = {
        choiceIds: [],
        correctText: ca.correct_text || null,
      };
    }
    if (ca.choice_id) {
      correctAnswersByQuestion[ca.question_id].choiceIds.push(ca.choice_id);
    }
  });

  // Calculate score - ONLY for MCQ and checkbox questions
  // Paragraph questions will be manually graded by admin
  let correctCount = 0;
  let autoGradedCount = 0; // Count only MCQ and checkbox questions
  let paragraphCount = 0;

  Object.entries(answers).forEach(([questionIdStr, answer]) => {
    const questionId = parseInt(questionIdStr);
    const questionType = questionTypes[questionId];

    // Skip paragraph questions - they need manual grading
    if (questionType === "paragraph") {
      paragraphCount++;
      return;
    }

    autoGradedCount++;
    const correct = correctAnswersByQuestion[questionId];

    if (!correct) return;

    if (Array.isArray(answer)) {
      // Checkbox - must match all correct choices
      const sortedAnswer = [...answer].sort();
      const sortedCorrect = [...correct.choiceIds].sort();
      if (
        sortedAnswer.length === sortedCorrect.length &&
        sortedAnswer.every((val, idx) => val === sortedCorrect[idx])
      ) {
        correctCount++;
      }
    } else if (typeof answer === "number") {
      // Multiple choice - must match the correct choice
      if (correct.choiceIds.includes(answer)) {
        correctCount++;
      }
    }
  });

  // Calculate score based only on auto-graded questions
  // If there are no auto-graded questions, set score to null (pending manual review)
  const score =
    autoGradedCount > 0 ? (correctCount / autoGradedCount) * 100 : null;

  // Update exam attempt with calculated score
  // Note: score will be null if exam contains only paragraph questions
  const { error: updateError } = await supabase
    .from("exam_attempts")
    .update({
      score: score !== null ? Math.round(score * 100) / 100 : null,
    })
    .eq("attempt_id", attemptId);

  if (updateError) {
    throw new Error("Failed to update score");
  }

  // Update the application with the exam_attempt_id
  const { error: appUpdateError } = await supabase
    .from("applications")
    .update({ exam_attempt_id: attemptId })
    .eq("job_id", jobId)
    .eq("applicant_id", applicant_id);

  if (appUpdateError) {
    throw new Error("Failed to update application");
  }

  return {
    success: true,
    attemptId,
    score: score !== null ? Math.round(score * 100) / 100 : null,
    correctCount,
    autoGradedCount,
    paragraphCount,
    totalQuestions: Object.keys(answers).length,
  };
}

/**
 * Automatically grade MCQ and checkbox answers by setting is_correct field
 */
/**
 * Automatically grade MCQ and checkbox answers by setting is_correct field
 */
async function autoGradeAnswers(
  supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
  insertedAnswers: InsertedAnswer[],
  submittedAnswers: Record<number, number | number[] | string>
) {
  // Get question types
  const questionIds = [...new Set(insertedAnswers.map((a) => a.question_id))];

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_type")
    .in("id", questionIds);

  if (!questions) return;

  // Create question type map
  const questionTypeMap: Record<number, string> = {};
  questions.forEach((q: QuestionType) => {
    questionTypeMap[q.id] = q.question_type;
  });

  // Filter non-paragraph questions
  const nonParagraphQuestionIds = questionIds.filter(
    (qId) => questionTypeMap[qId] !== "paragraph"
  );

  if (nonParagraphQuestionIds.length === 0) return;

  // Get correct answers
  const { data: correctAnswers } = await supabase
    .from("correct_answers")
    .select("question_id, choice_id")
    .in("question_id", nonParagraphQuestionIds);

  if (!correctAnswers) return;

  // Group correct answers by question
  const correctByQuestion: Record<number, number[]> = {};
  correctAnswers.forEach((ca: CorrectAnswerChoice) => {
    if (!correctByQuestion[ca.question_id]) {
      correctByQuestion[ca.question_id] = [];
    }
    if (ca.choice_id) {
      correctByQuestion[ca.question_id].push(ca.choice_id);
    }
  });

  // Grade each answer
  const gradingUpdates = insertedAnswers
    .filter((answer) => questionTypeMap[answer.question_id] !== "paragraph")
    .map((answer) => {
      const questionId = answer.question_id;
      const correctChoices = correctByQuestion[questionId] || [];
      const questionType = questionTypeMap[questionId];

      let isCorrect = false;

      if (questionType === "mcq") {
        // Multiple choice - single correct answer
        isCorrect =
          answer.choice_id !== null &&
          correctChoices.includes(answer.choice_id);
      } else if (questionType === "checkbox") {
        // Checkbox - need to check if ALL submitted choices for this question are correct
        const submittedAnswer = submittedAnswers[questionId];
        if (Array.isArray(submittedAnswer)) {
          const sortedSubmitted = [...submittedAnswer].sort();
          const sortedCorrect = [...correctChoices].sort();
          isCorrect =
            sortedSubmitted.length === sortedCorrect.length &&
            sortedSubmitted.every((val, idx) => val === sortedCorrect[idx]);
        }
      }

      return supabase
        .from("exam_answers")
        .update({ is_correct: isCorrect })
        .eq("answer_id", answer.answer_id);
    });

  await Promise.all(gradingUpdates);
}

/**
 * Get exam attempt with full details (answers, questions, correct answers)
 * Uses admin client to bypass RLS for admin viewing
 */
export async function getExamAttemptForAdmin(
  jobId: number,
  examId: number,
  applicantId: number
) {
  // Use admin client to bypass RLS policies
  const supabase = createAdminClient();

  console.log("=== Service: Searching for exam attempt ===");
  console.log("Parameters:", { jobId, examId, applicantId });

  // Debug: Check all attempts for this applicant
  const { data: allAttempts, error: debugError } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("applicant_id", applicantId);

  console.log("All attempts for applicant:", allAttempts);

  // First, try to find with all three criteria
  let { data: attempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("applicant_id", applicantId)
    .eq("job_id", jobId)
    .eq("exam_id", examId)
    .maybeSingle();

  console.log("Query with all criteria result:", attempt);

  if (attemptError) {
    console.error("Error with all criteria:", attemptError);
    throw new Error(attemptError.message);
  }

  // If not found, try with just applicant_id and exam_id
  if (!attempt) {
    console.log("Trying fallback query (without job_id)...");
    const { data: fallbackAttempt, error: fallbackError } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("applicant_id", applicantId)
      .eq("exam_id", examId)
      .order("date_submitted", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Fallback query result:", fallbackAttempt);

    if (fallbackError) {
      console.error("Fallback error:", fallbackError);
      throw new Error(fallbackError.message);
    }

    attempt = fallbackAttempt;
  }

  if (!attempt) {
    console.log("No exam attempt found");
    return null;
  }

  console.log("Found attempt:", attempt);

  // Fetch all answers for this attempt with question details
  const { data: rawAnswers, error: answersError } = await supabase
    .from("exam_answers")
    .select(
      "answer_id, attempt_id, question_id, choice_id, text_answer, is_correct"
    )
    .eq("attempt_id", attempt.attempt_id);

  if (answersError) {
    throw new Error(answersError.message);
  }

  if (!rawAnswers || rawAnswers.length === 0) {
    // Return attempt without answers if no answers exist
    return {
      attempt,
      answers: [],
      correctAnswers: [],
    };
  }

  // Get unique question IDs and choice IDs
  const questionIds = [...new Set(rawAnswers.map((a) => a.question_id))];
  const choiceIds = [
    ...new Set(rawAnswers.map((a) => a.choice_id).filter((id) => id !== null)),
  ];

  // Fetch question details
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_text, question_type, position")
    .in("id", questionIds);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  // Fetch choice details
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("id, question_id, choice_text")
    .in("id", choiceIds);

  if (choicesError) {
    throw new Error(choicesError.message);
  }

  // Fetch all choices for each question
  const { data: allChoices, error: allChoicesError } = await supabase
    .from("choices")
    .select("id, question_id, choice_text, position")
    .in("question_id", questionIds)
    .order("position", { ascending: true });

  if (allChoicesError) {
    throw new Error(allChoicesError.message);
  }

  // Fetch correct answers
  const { data: correctAnswers, error: correctError } = await supabase
    .from("correct_answers")
    .select("question_id, choice_id, correct_text")
    .in("question_id", questionIds);

  if (correctError) {
    throw new Error(correctError.message);
  }

  // Map everything together
  const questionsMap = new Map(questions.map((q) => [q.id, q]));
  const choicesMap = new Map(choices.map((c) => [c.id, c]));

  // Group all choices by question
  const choicesByQuestion = new Map<number, typeof allChoices>();
  allChoices.forEach((choice) => {
    if (!choicesByQuestion.has(choice.question_id)) {
      choicesByQuestion.set(choice.question_id, []);
    }
    choicesByQuestion.get(choice.question_id)?.push(choice);
  });

  // Enrich answers
  const enrichedAnswers = rawAnswers.map((answer) => ({
    ...answer,
    questions: {
      ...questionsMap.get(answer.question_id),
      choices: choicesByQuestion.get(answer.question_id) || [],
    },
    choices: answer.choice_id ? choicesMap.get(answer.choice_id) : null,
  }));

  return {
    attempt,
    answers: enrichedAnswers,
    correctAnswers,
  };
}
