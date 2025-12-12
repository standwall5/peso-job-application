import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/exams/attempt?jobId=...&examId=...
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const examId = searchParams.get("examId");

  // Get current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant_id from applicants table
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }
  const applicant_id = applicantData.id;

  // Query exam_attempts directly by applicant_id, job_id, and exam_id
  const { data: attempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("applicant_id", applicant_id)
    .eq("job_id", jobId)
    .eq("exam_id", examId)
    .maybeSingle();

  if (attemptError) {
    return NextResponse.json({ error: attemptError.message }, { status: 500 });
  }

  if (!attempt) {
    return NextResponse.json({ attempt: null }); // No attempt yet
  }

  // Fetch all answers for this attempt with question details
  const { data: rawAnswers, error: answersError } = await supabase
    .from("exam_answers")
    .select("attempt_id, question_id, choice_id, text_answer")
    .eq("attempt_id", attempt.attempt_id);

  if (answersError) {
    return NextResponse.json({ error: answersError.message }, { status: 500 });
  }

  // Get unique question IDs and choice IDs
  const questionIds = [...new Set(rawAnswers.map((a) => a.question_id))];
  const choiceIds = [...new Set(rawAnswers.map((a) => a.choice_id).filter((id) => id !== null))];

  // Fetch question details
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_text, question_type, position")
    .in("id", questionIds);

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  // Fetch choice details
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("id, question_id, choice_text")
    .in("id", choiceIds);

  if (choicesError) {
    return NextResponse.json({ error: choicesError.message }, { status: 500 });
  }

  // Fetch all choices for each question (for display purposes)
  const { data: allChoices, error: allChoicesError } = await supabase
    .from("choices")
    .select("id, question_id, choice_text, position")
    .in("question_id", questionIds)
    .order("position", { ascending: true });

  if (allChoicesError) {
    return NextResponse.json({ error: allChoicesError.message }, { status: 500 });
  }

  // Fetch correct answers for these questions
  const { data: correctAnswers, error: correctError } = await supabase
    .from("correct_answers")
    .select("question_id, choice_id, correct_text")
    .in("question_id", questionIds);

  if (correctError) {
    return NextResponse.json({ error: correctError.message }, { status: 500 });
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

  // Enrich answers with question and choice details
  const enrichedAnswers = rawAnswers.map((answer) => ({
    ...answer,
    questions: {
      ...questionsMap.get(answer.question_id),
      choices: choicesByQuestion.get(answer.question_id) || [],
    },
    choices: answer.choice_id ? choicesMap.get(answer.choice_id) : null,
  }));

  return NextResponse.json({
    attempt,
    answers: enrichedAnswers,
    correctAnswers,
  });
}
