import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createIdChangeNotification } from "@/lib/db/services/notification.service";

// POST /api/admin/request-id-change
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
    const { applicantId, reason } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Missing applicantId parameter" },
        { status: 400 },
      );
    }

    // Mark current ID as rejected/needs update
    const { error: updateError } = await supabase
      .from("applicant_ids")
      .update({
        status: "rejected",
        rejection_reason: reason || "Please update your identification document",
        rejected_by: admin.id,
        rejected_at: new Date().toISOString(),
        is_verified: false,
      })
      .eq("applicant_id", applicantId);

    if (updateError) {
      console.error("Error updating ID status:", updateError);
      return NextResponse.json(
        { error: "Failed to update ID status" },
        { status: 500 },
      );
    }

    // Send notification to applicant
    try {
      await createIdChangeNotification(applicantId, reason);
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue even if notification fails
    }

    // Log the action
    await supabase.from("id_verification_logs").insert({
      applicant_id: applicantId,
      admin_id: admin.id,
      action: "rejected",
      reason: reason || "ID update requested",
      timestamp: new Date().toISOString(),
    });

    console.log(
      `Admin ${admin.name} (ID: ${admin.id}) requested ID change for applicant ${applicantId}`,
    );

    return NextResponse.json({
      success: true,
      message: "ID update request sent to applicant",
    });
  } catch (error) {
    console.error("Error in request-id-change route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
