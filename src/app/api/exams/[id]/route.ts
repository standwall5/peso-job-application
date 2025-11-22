import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const { id } = await params;
  const examId = Number(id);

  if (!examId) {
    return NextResponse.json({ error: "Invalid exam id" }, { status: 400 });
  }

  // Fetch exam
  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("*")
    .eq("exam_id", examId)
    .single();

  if (examErr || !exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Fetch questions
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("*, choices(*), correct_answers(*)")
    .eq("exam_id", examId)
    .order("position", { ascending: true });

  if (qErr) {
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ...exam,
    questions,
  });
}
