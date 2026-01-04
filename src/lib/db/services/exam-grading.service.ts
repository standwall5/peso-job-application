// Manual exam grading service for paragraph questions
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface GradeParagraphAnswerParams {
  answerId: number;
  isCorrect: boolean;
  attemptId: number;
}

export interface RecalculateScoreResult {
  newScore: number;
  totalQuestions: number;
  correctCount: number;
  ungradedCount: number;
}

interface ExamAnswer {
  answer_id: number;
  is_correct: boolean | null;
  question_id: number;
}

interface QuestionWithType {
  question_text: string;
  question_type: string;
}

interface ExamAnswerWithQuestion {
  answer_id: number;
  is_correct: boolean | null;
  graded_by: number | null;
  graded_at: string | null;
  question_id: number;
  text_answer: string | null;
  questions: QuestionWithType;
}

/**
 * Grade a paragraph answer as correct or incorrect
 */
export async function gradeParagraphAnswer(
  params: GradeParagraphAnswerParams,
): Promise<{ success: boolean; message: string }> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get admin ID
  const { data: adminData } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!adminData) {
    throw new Error("Admin not found");
  }

  const { answerId, isCorrect, attemptId } = params;

  // Update the exam answer with grading
  const { error: updateError } = await supabase
    .from("exam_answers")
    .update({
      is_correct: isCorrect,
      graded_by: adminData.id,
      graded_at: new Date().toISOString(),
    })
    .eq("answer_id", answerId);

  if (updateError) {
    throw new Error("Failed to grade answer");
  }

  // Recalculate score for this attempt
  await recalculateAttemptScore(attemptId);

  return {
    success: true,
    message: `Answer marked as ${isCorrect ? "correct" : "incorrect"}`,
  };
}

/**
 * Recalculate the score for an exam attempt
 * Counts all answers where is_correct = true
 */
/**
 * Recalculate the score for an exam attempt
 * Counts all answers where is_correct = true
 */
export async function recalculateAttemptScore(
  attemptId: number,
): Promise<RecalculateScoreResult> {
  const supabase = await getSupabaseClient();

  // Get all answers for this attempt
  const { data: answers, error: answersError } = await supabase
    .from("exam_answers")
    .select("answer_id, is_correct, question_id")
    .eq("attempt_id", attemptId);

  if (answersError || !answers) {
    throw new Error("Failed to fetch exam answers");
  }

  // Group answers by question_id
  const answersByQuestion = new Map<number, typeof answers>();
  answers.forEach((answer) => {
    if (!answersByQuestion.has(answer.question_id)) {
      answersByQuestion.set(answer.question_id, []);
    }
    answersByQuestion.get(answer.question_id)?.push(answer);
  });

  const totalQuestions = answersByQuestion.size;
  let correctCount = 0;
  let ungradedCount = 0;

  // Check each question
  answersByQuestion.forEach((questionAnswers, questionId) => {
    // A question is considered correct if ALL its answers are marked is_correct = true
    // A question is considered ungraded if ANY of its answers have is_correct = null
    const hasNull = questionAnswers.some((a) => a.is_correct === null);
    const allTrue = questionAnswers.every((a) => a.is_correct === true);

    if (hasNull) {
      ungradedCount++;
    } else if (allTrue) {
      correctCount++;
    }
  });

  // Calculate score
  // If there are ungraded answers, score remains null (pending)
  const score =
    ungradedCount === 0 && totalQuestions > 0
      ? (correctCount / totalQuestions) * 100
      : null;

  // Update exam attempt score
  const { error: updateError } = await supabase
    .from("exam_attempts")
    .update({
      score: score !== null ? Math.round(score * 100) / 100 : null,
    })
    .eq("attempt_id", attemptId);

  if (updateError) {
    throw new Error("Failed to update exam score");
  }

  return {
    newScore: score !== null ? Math.round(score * 100) / 100 : 0,
    totalQuestions,
    correctCount,
    ungradedCount,
  };
}

/**
 * Get grading status for an exam attempt
 */
export async function getGradingStatus(attemptId: number) {
  const supabase = await getSupabaseClient();

  const { data: answers, error } = await supabase
    .from("exam_answers")
    .select(
      `
      answer_id,
      is_correct,
      graded_by,
      graded_at,
      question_id,
      text_answer,
      questions (
        question_text,
        question_type
      )
    `,
    )
    .eq("attempt_id", attemptId)
    .returns<ExamAnswerWithQuestion[]>();

  if (error) {
    throw new Error("Failed to fetch grading status");
  }

  const paragraphQuestions = answers?.filter(
    (a) => a.questions?.question_type === "paragraph",
  );

  const ungradedParagraphs = paragraphQuestions?.filter(
    (a) => a.is_correct === null,
  );

  return {
    totalAnswers: answers?.length || 0,
    paragraphQuestions: paragraphQuestions?.length || 0,
    ungradedParagraphs: ungradedParagraphs?.length || 0,
    allGraded: ungradedParagraphs?.length === 0,
  };
}
