import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface QuestionInput {
  question_text: string;
  question_type: string;
  position: number;
  choices?: { choice_text: string; is_correct: boolean }[];
}

export async function GET() {
  const supabase = await createClient();

  // Fetch exams
  const { data: exams, error: examsError } = await supabase
    .from("exams")
    .select("*")
    .order("date_created", { ascending: false });

  if (examsError) {
    return NextResponse.json(
      { error: "Failed to load exams" },
      { status: 500 },
    );
  }

  // Fetch questions for all exams
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*");

  if (questionsError) {
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 },
    );
  }

  // Fetch choices for all questions
  const { data: choices, error: choicesError } = await supabase
    .from("choices")
    .select("*");

  if (choicesError) {
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

  // Nest questions inside exams
  const examsWithQuestions = exams.map((exam) => ({
    ...exam,
    questions: questionsWithChoices.filter((q) => q.exam_id === exam.id),
  }));

  return NextResponse.json(examsWithQuestions);
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { id, title, description, questions } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing exam id" }, { status: 400 });
  }

  // Update exam info
  const { error: examError } = await supabase
    .from("exams")
    .update({ title, description })
    .eq("id", id);

  if (examError) {
    return NextResponse.json(
      { error: "Failed to update exam", details: examError?.message },
      { status: 500 },
    );
  }

  // Get all question ids for this exam
  const { data: oldQuestions, error: oldQuestionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("exam_id", id);

  if (oldQuestionsError) {
    return NextResponse.json(
      {
        error: "Failed to fetch old questions",
        details: oldQuestionsError?.message,
      },
      { status: 500 },
    );
  }

  const oldQuestionIds = oldQuestions.map((q) => q.id);

  // Delete old choices
  if (oldQuestionIds.length > 0) {
    await supabase.from("choices").delete().in("question_id", oldQuestionIds);
  }

  // Delete old questions
  await supabase.from("questions").delete().eq("exam_id", id);

  // Insert new questions
  const questionsToInsert = questions.map((q: QuestionInput) => ({
    exam_id: id,
    question_text: q.question_text,
    question_type:
      q.question_type === "multiple-choice"
        ? "mcq"
        : q.question_type === "checkboxes"
          ? "checkbox"
          : "paragraph",
    position: q.position,
  }));

  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert)
    .select("id, position");

  if (questionsError || !insertedQuestions) {
    return NextResponse.json(
      { error: "Failed to create questions", details: questionsError?.message },
      { status: 500 },
    );
  }

  // Map position to question_id for choices
  const positionToQuestionId: Record<number, number> = {};
  insertedQuestions.forEach((q) => {
    positionToQuestionId[q.position] = q.id;
  });

  // Prepare choices for insert
  const choicesToInsert = [];
  questions.forEach((q) => {
    if (q.choices && q.choices.length > 0) {
      q.choices.forEach((c) => {
        choicesToInsert.push({
          question_id: positionToQuestionId[q.position],
          choice_text: c.choice_text,
          position: c.position,
        });
      });
    }
  });

  // Insert choices if any
  if (choicesToInsert.length > 0) {
    const { error: choicesError } = await supabase
      .from("choices")
      .insert(choicesToInsert);

    if (choicesError) {
      return NextResponse.json(
        { error: "Failed to create choices", details: choicesError?.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, exam_id: id });
}
