// Exam service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

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
        (ca) => ca.choice_id === choice.id,
      ),
    }));

    const correctTextAnswer = questionCorrectAnswers.find(
      (ca) => ca.correct_text,
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
        (ca) => ca.choice_id === choice.id,
      ),
    }));

    const correctTextAnswer = questionCorrectAnswers.find(
      (ca) => ca.correct_text,
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
  questions: Question[],
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

  if (correctAnswersToInsert.length > 0) {
    await supabase.from("correct_answers").insert(correctAnswersToInsert);
  }
}
