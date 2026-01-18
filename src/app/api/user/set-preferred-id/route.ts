import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/user/set-preferred-id
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get applicant ID
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 },
      );
    }

    // Get request body
    const body = await req.json();
    const { idType } = body;

    if (!idType) {
      return NextResponse.json(
        { error: "Missing idType parameter" },
        { status: 400 },
      );
    }

    // Verify the ID type exists for this applicant
    const { data: idDocument, error: idError } = await supabase
      .from("applicant_ids")
      .select("id")
      .eq("applicant_id", applicant.id)
      .eq("id_type", idType)
      .single();

    if (idError || !idDocument) {
      return NextResponse.json(
        { error: "ID type not found for this applicant" },
        { status: 404 },
      );
    }

    // First, set all IDs as not preferred for this applicant
    const { error: resetError } = await supabase
      .from("applicant_ids")
      .update({ is_preferred: false })
      .eq("applicant_id", applicant.id);

    if (resetError) {
      console.error("Error resetting preferred IDs:", resetError);
      return NextResponse.json(
        { error: "Failed to update preferred ID" },
        { status: 500 },
      );
    }

    // Then set the selected ID as preferred
    const { error: updateError } = await supabase
      .from("applicant_ids")
      .update({ is_preferred: true })
      .eq("applicant_id", applicant.id)
      .eq("id_type", idType);

    if (updateError) {
      console.error("Error setting preferred ID:", updateError);
      return NextResponse.json(
        { error: "Failed to set preferred ID" },
        { status: 500 },
      );
    }

    console.log(
      `Applicant ${applicant.id} set preferred ID type to: ${idType}`,
    );

    return NextResponse.json({
      success: true,
      message: "Preferred ID updated successfully",
      idType: idType,
    });
  } catch (error) {
    console.error("Error in set-preferred-id route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
