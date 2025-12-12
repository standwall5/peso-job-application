import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface ExamAnswer {
  questionId: number;
  answer: number | number[] | string; // choiceId, array of choiceIds, or text
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { examId, jobId, answers } = await request.json();

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
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 },
      );
    }

    const applicant_id = applicantData.id;

    // Validate required fields
    if (!examId || !jobId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields: examId, jobId, or answers" },
        { status: 400 },
      );
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
          score: 0, // Will be calculated later
        },
      ])
      .select("attempt_id")
      .single();

    if (attemptError || !attemptData) {
      return NextResponse.json(
        {
          error: "Failed to create exam attempt",
          details: attemptError?.message,
        },
        { status: 500 },
      );
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
    Object.entries(
      answers as Record<number, number | number[] | string>,
    ).forEach(([questionIdStr, answer]) => {
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
      const { error: answersError } = await supabase
        .from("exam_answers")
        .insert(examAnswersToInsert);

      if (answersError) {
        return NextResponse.json(
          {
            error: "Failed to save exam answers",
            details: answersError?.message,
          },
          { status: 500 },
        );
      }
    }

    // Calculate score by comparing with correct answers
    const { data: correctAnswers, error: correctAnswersError } = await supabase
      .from("correct_answers")
      .select("question_id, choice_id, correct_text")
      .in(
        "question_id",
        Object.keys(answers).map((id) => parseInt(id)),
      );

    if (correctAnswersError) {
      return NextResponse.json(
        {
          error: "Failed to fetch correct answers",
          details: correctAnswersError?.message,
        },
        { status: 500 },
      );
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

    // Calculate score
    let correctCount = 0;
    const totalQuestions = Object.keys(answers).length;

    Object.entries(
      answers as Record<number, number | number[] | string>,
    ).forEach(([questionIdStr, answer]) => {
      const questionId = parseInt(questionIdStr);
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
      } else if (typeof answer === "string") {
        // Paragraph - compare text (case-insensitive, trimmed)
        // Note: This is a simple comparison. You may want more sophisticated matching
        if (
          correct.correctText &&
          answer.trim().toLowerCase() ===
            correct.correctText.trim().toLowerCase()
        ) {
          correctCount++;
        }
      }
    });

    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Update exam attempt with calculated score
    const { error: updateError } = await supabase
      .from("exam_attempts")
      .update({ score: Math.round(score * 100) / 100 }) // Round to 2 decimal places
      .eq("attempt_id", attemptId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update score", details: updateError?.message },
        { status: 500 },
      );
    }

    // Update the application with the exam_attempt_id
    const { error: appUpdateError } = await supabase
      .from("applications")
      .update({ exam_attempt_id: attemptId })
      .eq("job_id", jobId)
      .eq("applicant_id", applicant_id);

    if (appUpdateError) {
      return NextResponse.json(
        {
          error: "Failed to update application",
          details: appUpdateError?.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      attemptId,
      score: Math.round(score * 100) / 100,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    console.error("Exam submission error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
