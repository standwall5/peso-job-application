import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/admin/verify-id
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from("peso")
      .select("id, name")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { applicantId, verified } = body;

    if (!applicantId || typeof verified !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    // Update applicant verification status
    const { data: updatedApplicant, error: updateError } = await supabase
      .from("applicants")
      .update({
        id_verified: verified,
        id_verified_at: verified ? new Date().toISOString() : null,
        id_verified_by: verified ? admin.id : null,
      })
      .eq("id", applicantId)
      .select("id, name, id_verified")
      .single();

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return NextResponse.json(
        { error: "Failed to update verification status" },
        { status: 500 }
      );
    }

    // Log the verification action
    console.log(
      `Admin ${admin.name} (ID: ${admin.id}) ${
        verified ? "verified" : "unverified"
      } ID for applicant ${applicantId}`
    );

    return NextResponse.json({
      success: true,
      applicant: updatedApplicant,
      message: `ID ${verified ? "verified" : "unverified"} successfully`,
    });
  } catch (error) {
    console.error("Error in verify-id route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
