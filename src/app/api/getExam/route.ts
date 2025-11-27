import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("id");

  if (!examId) {
    return NextResponse.json({ error: "Missing exam id" }, { status: 400 });
  }

  // Fetch the exam
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    console.error("Fetch exam error:", examError);
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Fetch questions for this exam
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", examId)
    .order("position", { ascending: true });

  if (questionsError) {
    console.error("Fetch questions error:", questionsError);
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 },
    );
  }

  // Fetch choices for these questions
  const questionIds = questions.map((q) => q.id);
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("*")
    .in("question_id", questionIds)
    .order("position", { ascending: true });

  if (choicesError) {
    console.error("Fetch choices error:", choicesError);
    return NextResponse.json(
      { error: "Failed to load choices" },
      { status: 500 },
    );
  }

  // Map DB question_type to frontend values
  function mapQuestionType(dbType: string) {
    if (dbType === "mcq") return "multiple-choice";
    if (dbType === "checkbox") return "checkboxes";
    return dbType; // "paragraph" or any other type
  }

  // Nest choices inside questions
  const questionsWithChoices = questions.map((q) => ({
    ...q,
    question_type: mapQuestionType(q.question_type),
    choices: choices.filter((c) => c.question_id === q.id),
  }));

  // Build the complete exam object
  const examWithQuestions = {
    ...exam,
    questions: questionsWithChoices,
  };

  return NextResponse.json(examWithQuestions);
}
