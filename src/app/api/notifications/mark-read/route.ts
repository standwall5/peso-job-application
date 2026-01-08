import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notification_id, mark_all } = body;

    if (!notification_id && !mark_all) {
      return NextResponse.json(
        { error: "Either notification_id or mark_all must be provided" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get applicant ID (using auth_id)
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

    if (mark_all) {
      // Mark all unread notifications as read
      const { error: updateError, count } = await supabase
        .from("notifications")
        .update({ is_read: true }, { count: "exact" })
        .eq("applicant_id", applicant.id)
        .eq("is_read", false)
        .eq("is_archived", false); // Only mark non-archived notifications

      if (updateError) {
        console.error("Mark all as read error:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        marked_count: count || 0,
        message: `Marked ${count || 0} notification(s) as read`,
      });
    } else if (notification_id) {
      // Mark specific notification as read
      const { error: updateError, count } = await supabase
        .from("notifications")
        .update({ is_read: true }, { count: "exact" })
        .eq("id", notification_id)
        .eq("applicant_id", applicant.id);

      if (updateError) {
        console.error("Mark notification as read error:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }

      if (count === 0) {
        return NextResponse.json(
          { error: "Notification not found or already marked as read" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        marked_count: 1,
        message: "Notification marked as read",
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error(
      "Unexpected error in POST /api/notifications/mark-read:",
      error,
    );
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
