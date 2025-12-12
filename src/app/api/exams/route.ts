import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface ChoiceInput {
  choice_text: string;
  is_correct?: boolean;
  position?: number;
}

interface QuestionInput {
  question_text: string;
  question_type: string;
  position: number;
  choices?: ChoiceInput[];
  correct_text?: string; // For paragraph questions
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

  // Fetch correct answers
  const { data: correctAnswers, error: correctAnswersError } = await supabase
    .from("correct_answers")
    .select("*");

  if (correctAnswersError) {
    return NextResponse.json(
      { error: "Failed to load correct answers" },
      { status: 500 },
    );
  }

  // Map DB question_type to frontend values
  function mapQuestionType(dbType: string) {
    if (dbType === "mcq") return "multiple-choice";
    if (dbType === "checkbox") return "checkboxes";
    return dbType; // "paragraph" or any other type
  }

  // Nest choices inside questions and mark correct ones
  const questionsWithChoices = questions.map((q) => {
    const questionChoices = choices.filter((c) => c.question_id === q.id);
    const questionCorrectAnswers =
      correctAnswers?.filter((ca) => ca.question_id === q.id) || [];

    // Mark which choices are correct
    const choicesWithCorrectFlag = questionChoices.map((choice) => ({
      ...choice,
      is_correct: questionCorrectAnswers.some(
        (ca) => ca.choice_id === choice.id,
      ),
    }));

    // Get correct text for paragraph questions
    const correctTextAnswer = questionCorrectAnswers.find(
      (ca) => ca.correct_text,
    );

    return {
      ...q,
      question_type: mapQuestionType(q.question_type),
      choices: choicesWithCorrectFlag,
      correct_text: correctTextAnswer?.correct_text || undefined,
    };
  });

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

  // Delete old correct answers
  if (oldQuestionIds.length > 0) {
    await supabase
      .from("correct_answers")
      .delete()
      .in("question_id", oldQuestionIds);
  }

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
  const choicesToInsert: {
    question_id: number;
    choice_text: string;
    position: number;
  }[] = [];

  questions.forEach((q: QuestionInput) => {
    if (q.choices && q.choices.length > 0) {
      q.choices.forEach((c: ChoiceInput, index: number) => {
        choicesToInsert.push({
          question_id: positionToQuestionId[q.position],
          choice_text: c.choice_text,
          position: c.position ?? index,
        });
      });
    }
  });

  // Insert choices if any
  let insertedChoices: { id: number; question_id: number; position: number }[] =
    [];
  if (choicesToInsert.length > 0) {
    const { data, error: choicesError } = await supabase
      .from("choices")
      .insert(choicesToInsert)
      .select("id, question_id, position");

    if (choicesError || !data) {
      return NextResponse.json(
        { error: "Failed to create choices", details: choicesError?.message },
        { status: 500 },
      );
    }
    insertedChoices = data;
  }

  // Prepare correct answers for insert
  const correctAnswersToInsert: {
    question_id: number;
    choice_id?: number;
    correct_text?: string;
  }[] = [];

  questions.forEach((q: QuestionInput) => {
    const questionId = positionToQuestionId[q.position];

    if (q.question_type === "paragraph" && q.correct_text) {
      // Insert correct text for paragraph questions
      correctAnswersToInsert.push({
        question_id: questionId,
        correct_text: q.correct_text,
      });
    } else if (q.choices && q.choices.length > 0) {
      // Insert correct choice IDs for MCQ/checkbox questions
      q.choices.forEach((c: ChoiceInput, choicePosition: number) => {
        if (c.is_correct) {
          // Find the inserted choice ID
          const insertedChoice = insertedChoices.find(
            (ic) =>
              ic.question_id === questionId &&
              ic.position === (c.position ?? choicePosition),
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

  // Insert correct answers
  if (correctAnswersToInsert.length > 0) {
    const { error: correctAnswersError } = await supabase
      .from("correct_answers")
      .insert(correctAnswersToInsert);

    if (correctAnswersError) {
      return NextResponse.json(
        {
          error: "Failed to save correct answers",
          details: correctAnswersError?.message,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, exam_id: id });
}
