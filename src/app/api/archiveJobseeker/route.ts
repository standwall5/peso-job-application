import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { applicantId, isArchived } = await req.json();

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 },
      );
    }

    // Update the applicant's is_archived status
    const { error } = await supabase
      .from("applicants")
      .update({ is_archived: isArchived ?? true })
      .eq("id", applicantId);

    if (error) {
      console.error("Error archiving jobseeker:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: isArchived
        ? "Jobseeker archived successfully"
        : "Jobseeker unarchived successfully",
    });
  } catch (error) {
    console.error("Error in archive API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
