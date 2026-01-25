import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createIdVerificationNotification } from "@/lib/db/services/notification.service";

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
        { status: 403 },
      );
    }

    // Get request body
    const body = await req.json();
    const { applicantId, applicationId } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Missing applicantId parameter" },
        { status: 400 },
      );
    }

    // Update applicant_ids table to mark as verified
    const { error: updateError } = await supabase
      .from("applicant_ids")
      .update({
        is_verified: true,
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
        status: "approved",
      })
      .eq("applicant_id", applicantId);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return NextResponse.json(
        { error: "Failed to update verification status" },
        { status: 500 },
      );
    }

    // Also update applicants table to mark ID as verified
    const { error: applicantUpdateError } = await supabase
      .from("applicants")
      .update({
        id_verified: true,
        id_verified_at: new Date().toISOString(),
      })
      .eq("id", applicantId);

    if (applicantUpdateError) {
      console.error(
        "Error updating applicant verification status:",
        applicantUpdateError,
      );
      // Don't fail the request if this update fails, as the main verification already succeeded
    }

    // Create notification for applicant
    try {
      await createIdVerificationNotification(applicantId);
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue even if notification fails
    }

    // Log the verification action
    await supabase.from("id_verification_logs").insert({
      applicant_id: applicantId,
      admin_id: admin.id,
      action: "verified",
      application_id: applicationId || null,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `Admin ${admin.name} (ID: ${admin.id}) verified ID for applicant ${applicantId}`,
    );

    return NextResponse.json({
      success: true,
      message: "ID verified successfully",
    });
  } catch (error) {
    console.error("Error in verify-id route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
