import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/admin/exams/attempt?jobId=...&examId=...&applicantId=...
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const jobIdParam = searchParams.get("jobId");
  const examIdParam = searchParams.get("examId");
  const applicantIdParam = searchParams.get("applicantId");

  // Validate parameters
  if (!jobIdParam || jobIdParam === "null" || jobIdParam === "undefined") {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  if (!examIdParam || examIdParam === "null" || examIdParam === "undefined") {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  if (!applicantIdParam || applicantIdParam === "null" || applicantIdParam === "undefined") {
    return NextResponse.json({ error: "Applicant ID is required" }, { status: 400 });
  }

  const jobId = parseInt(jobIdParam, 10);
  const examId = parseInt(examIdParam, 10);
  const applicantId = parseInt(applicantIdParam, 10);

  if (isNaN(jobId) || isNaN(examId) || isNaN(applicantId)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // Verify the logged-in user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: adminData, error: adminError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }

  // Query exam_attempts for the specified applicant
  const { data: attempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("applicant_id", applicantId)
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

  // Fetch all choices for each question
  const { data: allChoices, error: allChoicesError } = await supabase
    .from("choices")
    .select("id, question_id, choice_text, position")
    .in("question_id", questionIds)
    .order("position", { ascending: true });

  if (allChoicesError) {
    return NextResponse.json({ error: allChoicesError.message }, { status: 500 });
  }

  // Fetch correct answers
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

  // Enrich answers
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
