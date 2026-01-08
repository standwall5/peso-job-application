import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("id");

  if (!notificationId) {
    return NextResponse.json(
      { error: "Notification ID is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get applicant ID from user (using auth_id instead of user_id)
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

    // Delete the notification (only if it belongs to the user)
    const { error: deleteError, count } = await supabase
      .from("notifications")
      .delete({ count: "exact" })
      .eq("id", notificationId)
      .eq("applicant_id", applicant.id);

    if (deleteError) {
      console.error("Delete notification error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Notification not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const includeArchived = searchParams.get("archived") === "true";

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get applicant ID from user (using auth_id instead of user_id)
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

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("applicant_id", applicant.id)
      .order("created_at", { ascending: false });

    // Filter by archived status (default: exclude archived)
    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    // Filter by read status if requested
    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Fetch notifications error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(notifications || []);
  } catch (error) {
    console.error("Unexpected error in GET /api/notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicant_id, type, title, message, link } = body;

    if (!applicant_id || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        applicant_id,
        type,
        title,
        message,
        link,
        is_read: false,
        is_archived: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create notification error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in POST /api/notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notification_id, action } = body;

    if (!notification_id || !action) {
      return NextResponse.json(
        { error: "notification_id and action are required" },
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

    const updateData: { is_archived?: boolean; is_read?: boolean } = {};

    switch (action) {
      case "archive":
        updateData.is_archived = true;
        break;
      case "unarchive":
        updateData.is_archived = false;
        break;
      case "mark_read":
        updateData.is_read = true;
        break;
      case "mark_unread":
        updateData.is_read = false;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error: updateError, count } = await supabase
      .from("notifications")
      .update(updateData, { count: "exact" })
      .eq("id", notification_id)
      .eq("applicant_id", applicant.id);

    if (updateError) {
      console.error("Update notification error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, action, updated: true });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
